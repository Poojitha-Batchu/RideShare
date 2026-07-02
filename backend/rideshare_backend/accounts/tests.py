from django.test import SimpleTestCase

from .storage import build_profile_image_name


class ProfileImageStorageTests(SimpleTestCase):
    def test_build_profile_image_name_uses_user_id_and_uuid(self):
        file_name = "dp.png"
        image_name = build_profile_image_name(user_id=12, original_name=file_name)

        self.assertTrue(image_name.startswith("profile_images/user_12_"))
        self.assertTrue(image_name.endswith(".png"))
