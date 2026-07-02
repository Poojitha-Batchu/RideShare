import os
import uuid
from pathlib import Path


def build_profile_image_name(user_id, original_name):
    ext = Path(original_name or "image.png").suffix or ".png"
    safe_name = f"user_{user_id}_{uuid.uuid4().hex}{ext.lower()}"
    return f"profile_images/{safe_name}"
