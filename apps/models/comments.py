from django.db.models import Model, ImageField, ForeignKey, CASCADE, IntegerChoices, SET_NULL
from django.db.models.fields import PositiveSmallIntegerField, TextField, BooleanField

from apps.models.base import CreatedBaseModel
from apps.models.utils import quality_assessment_validate


class Comment(CreatedBaseModel):
    class Status(IntegerChoices):
        REJECTED = 0, 'Rejected'
        PUBLISHED = 1, 'Published'

    product = ForeignKey('apps.Product', CASCADE, related_name='comments')
    quality_assessment = PositiveSmallIntegerField(validators=[quality_assessment_validate])
    user = ForeignKey('apps.User',SET_NULL,related_name='comments',null=True)
    service_evaluation = PositiveSmallIntegerField(validators=[quality_assessment_validate])
    delivery_speed_assessment = PositiveSmallIntegerField(validators=[quality_assessment_validate])
    advantages = TextField()
    disadvantages = TextField()
    comment = TextField()
    status = PositiveSmallIntegerField(choices=Status.choices)
    is_anonymous = BooleanField(default=False)


class CommentImage(Model):
    image = ImageField(upload_to='comment/images/%Y/%m/%d')
    comment = ForeignKey('apps.Comment', CASCADE, related_name='images')
