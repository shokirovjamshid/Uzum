import os
from datetime import datetime

from django.core.validators import RegexValidator
from django.db.models.fields.files import ImageFieldFile
from rest_framework.exceptions import ValidationError

uz_phone_validator = RegexValidator(
    regex=r"^\d{9}$",
    message="Raqam faqat 998XXXXXXXXX formatida bo'lishi kerak"
)


def upload_image_size_5mb_validator(obj: ImageFieldFile):
    if obj.size > 5 * 1024 * 1024:
        raise ValidationError(f'This image is too big (max - 5mb) {obj.size / 1024 / 1024:.2f} MB')
    return obj


def quality_assessment_validate(obj):
    if obj > 5 or obj < 1:
        raise ValidationError('Bunday baholash mumkin emas')


def upload_to_image(obj, filename: str):
    _name = obj.__class__.__name__.lower()
    date_path = datetime.now().strftime("%Y/%m/%d")

    return f"{_name}/{date_path}/{filename}"


from django.core.exceptions import ValidationError
from PIL import Image


def validate_image(image):
    try:
        img = Image.open(image)
        w, h = img.size

        # if not (2.9 < w / h < 3.1):
        #     raise ValidationError("Rasm tomoni 3:4 nisbatda bo‘lishi kerak")

        if w < 1080 or h < 1440:
            raise ValidationError("Rasm minimal 1080x1440 bo‘lishi kerak")

        if hasattr(image, 'size') and image.size > 5 * 1024 * 1024:
            raise ValidationError("Rasm 5MB dan oshmasligi kerak")

    except OSError:
        raise ValidationError("Yaroqsiz rasm fayli")


def validate_video(file):
    valid_extensions = ['.mp4']
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in valid_extensions:
        raise ValidationError('Ruxsat etilgan format: MP4')

    if file.size > 10 * 1024 * 1024:  # 10 Mb
        raise ValidationError('Video hajmi 10 Mb dan oshmasligi kerak')

    try:
        from moviepy.editor import VideoFileClip
        clip = VideoFileClip(file.temporary_file_path())
        width, height = clip.size
        if width < 1080 or height < 1440:
            raise ValidationError('Video minimal o‘lchami 1080x1440 bo‘lishi kerak')
        if abs((width / height) - (3 / 4)) > 0.01:
            raise ValidationError('Video tomoni 3:4 nisbatda bo‘lishi kerak')
        clip.reader.close()
        clip.audio.reader.close_proc()
    except Exception:
        raise ValidationError('Video o‘lchamini tekshirib bo‘lmadi')
