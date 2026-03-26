from random import randint

from celery import shared_task

from root.settings import TIME_OUT, r


def register_key(phone):
    return f"register:{phone}"


@shared_task
def send_sms_code(phone, msg):
    print(f"📞 {phone}\n{msg}")


@shared_task
def register_sms(phone):
    code = randint(100000, 999999)
    key = register_key(phone)
    is_set = r.set(key, code, ex=int(TIME_OUT), nx=True)
    if is_set:
        code_to_send = code
    else:
        code_to_send = r.get(key)
        if r.ttl(key) == -1:
            r.expire(key, int(TIME_OUT))
    # if not cache.get(key):
    #     cache.set(key, code, TIME_OUT)

    text = f"Tasdiqlash kodi: {code_to_send}"
    send_sms_code.delay(phone, text)
