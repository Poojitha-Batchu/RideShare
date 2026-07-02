import os
import uuid
from pathlib import Path
from django.core.files.storage import default_storage
from django.conf import settings


def build_profile_image_name(user_id, original_name):
    ext = Path(original_name or "image.png").suffix or ".png"
    safe_name = f"user_{user_id}_{uuid.uuid4().hex}{ext.lower()}"
    return f"profile_images/{safe_name}"


class ProfileImageStorage:
    def generate_filename(self, user_id, original_name):
        """Generate a unique filename for a profile image."""
        return build_profile_image_name(user_id, original_name)

    def upload_file(self, user_id, uploaded_file):
        """Upload a file to cloud or local storage with unique naming."""
        unique_filename = self.generate_filename(user_id, uploaded_file.name)
        
        use_gcs = getattr(settings, 'USE_GCS_FOR_MEDIA', False)
        bucket_name = getattr(settings, 'GS_BUCKET_NAME', '')
        
        if use_gcs and bucket_name:
            try:
                from google.cloud import storage
                client = storage.Client()
                bucket = client.bucket(bucket_name)
                blob = bucket.blob(unique_filename)
                blob.upload_from_file(uploaded_file, content_type=uploaded_file.content_type)
                return blob.public_url
            except Exception as e:
                print(f"GCS upload failed: {e}, falling back to local storage")
                return self._save_locally(unique_filename, uploaded_file)
        
        return self._save_locally(unique_filename, uploaded_file)
    
    def _save_locally(self, filename, uploaded_file):
        """Save file locally and return the path."""
        media_root = settings.MEDIA_ROOT
        filepath = os.path.join(media_root, filename)
        
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'wb') as f:
            for chunk in uploaded_file.chunks():
                f.write(chunk)
        
        media_url = settings.MEDIA_URL + filename
        return media_url
