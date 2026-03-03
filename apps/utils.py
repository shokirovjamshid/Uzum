from rest_framework.exceptions import ValidationError
import base64
import io

from qrcode import QRCode

def _generate_qr_image_base64(payload: str) -> str:
    qr = QRCode(version=1, box_size=10, border=5)
    qr.add_data(payload)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return qr_base64


def _status_cache_key(user_id: int) -> str:
    return f"consumers:user_status:{user_id}"


def code_length_validate(value):
    if len(str(value)) != 6:
        raise ValidationError('uzunligi 6 ga teng bolishi kerak')