from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.generics import ListAPIView, RetrieveAPIView

from apps.models import City, DeliveryPoint
from apps.serializer import CityListModelSerializer, DeliveryPointsListModelSerializer, \
    DeliveryPointsRetrieveModelSerializer


# Create your views here.

class CityListAPIView(ListAPIView):
    queryset = City.objects.all()
    serializer_class = CityListModelSerializer
    filter_backends = [SearchFilter]
    search_fields = ['name']


class DeliveryPointsListAPIView(ListAPIView):
    queryset = DeliveryPoint.objects.only('address', 'has_dressing_room', 'location')
    serializer_class = DeliveryPointsListModelSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['city']


class DeliveryPointsRetrieveAPIView(RetrieveAPIView):
    queryset = DeliveryPoint.objects.only('address', 'has_dressing_room', 'location', 'order_retention_period')
    serializer_class = DeliveryPointsRetrieveModelSerializer
