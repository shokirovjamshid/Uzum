from django.db.models import Model, CharField, BooleanField
from location_field.models.plain import PlainLocationField


class City(Model):
    name = CharField(max_length=100)
    is_default = BooleanField(default=False)
    location = PlainLocationField(based_fields=['city'], zoom=6)

#   {
#     "id": 1720,
#     "cityId": 1,
#     "address": "Toshkent sh., Yashnobod tumani, Katta Yangiobod ko'chasi, 7 uy",
#     "timeFrom": "08:30",
#     "timeTo": "16:30",
#     "date": 1771545600000,
#     "hasDressingRoom": true,
#     "hasEcoEndpoint": false,
#     "hasFreeSpace": true,
#     "acceptReturns": false,
#     "postPaidEnabled": true,
#     "postPaidAvailability": "CASH_AND_CARD",
#     "longitude": 69.350847,
#     "latitude": 41.275026,
#     "deliveryDate": {
#         "localDate": [
#             2026,
#             2,
#             20,
#             0,
#             0
#         ],
#         "periods": [],
#         "options": [],
#         "expectedTimeFrom": "16:00",
#         "expectedTimeTo": "16:30",
#         "expectedDateFrom": [
#             2026,
#             2,
#             20,
#             16,
#             0
#         ],
#         "expectedDateTo": [
#             2026,
#             2,
#             20,
#             16,
#             30
#         ],
#         "textDeliveryWithDate": "20 fevral",
#         "textDeliveryWithShortDate": null,
#         "date": 1771545600000
#     },
#     "comments": [
#         {
#             "type": "DESCRIPTION",
#             "text": "Faqat Uzum Market topshirish punktlarida qaytarish mumkin"
#         }
#     ],
#     "type": "UZ_POST",
#     "title": "O'zbekiston pochta bo'limi",
#     "deliveryPrice": 0,
#     "scheduleInfo": {
#         "days": [
#             {
#                 "day": "MONDAY",
#                 "dayOff": false,
#                 "workingHours": "08:30 - 12:30, 13:30 - 16:30"
#             },
#             {
#                 "day": "TUESDAY",
#                 "dayOff": false,
#                 "workingHours": "08:30 - 12:30, 13:30 - 16:30"
#             },
#             {
#                 "day": "WEDNESDAY",
#                 "dayOff": false,
#                 "workingHours": "08:30 - 12:30, 13:30 - 16:30"
#             },
#             {
#                 "day": "THURSDAY",
#                 "dayOff": false,
#                 "workingHours": "08:30 - 12:30, 13:30 - 16:30"
#             },
#             {
#                 "day": "FRIDAY",
#                 "dayOff": false,
#                 "workingHours": "08:30 - 12:30, 13:30 - 16:30"
#             },
#             {
#                 "day": "SATURDAY",
#                 "dayOff": false,
#                 "workingHours": "08:30 - 13:30"
#             },
#             {
#                 "day": "SUNDAY",
#                 "dayOff": true,
#                 "workingHours": null
#             }
#         ]
#     },
#     "scheduleInfoCompact": {
#         "days": [
#             {
#                 "dayRange": "Du - Ju",
#                 "dayOff": false,
#                 "workingHours": "08:30 - 12:30, 13:30 - 16:30"
#             },
#             {
#                 "dayRange": "Sh",
#                 "dayOff": false,
#                 "workingHours": "08:30 - 13:30"
#             },
#             {
#                 "dayRange": "Ya",
#                 "dayOff": true,
#                 "workingHours": "Dam Kuni"
#             }
#         ]
#     }
# },
