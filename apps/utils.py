from rest_framework.exceptions import ValidationError


def code_length_validate(value):
    if len(str(value)) != 6:
        raise ValidationError('uzunligi 6 ga teng bolishi kerak')