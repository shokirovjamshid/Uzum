from random import randint

from celery import shared_task
from django.core.cache import cache


def register_key(phone):
    return f"register:{phone}"


@shared_task
def send_sms_code(phone, msg):
    print(f"📞 {phone}\n{msg}")


@shared_task
def register_sms(phone):
    code = randint(100000, 999999)
    key = register_key(phone)
    if not cache.get(key):
        cache.set(key, code, 120)

    text = f"Tasdiqlash kodi: {code}"
    send_sms_code.delay(phone, text)
