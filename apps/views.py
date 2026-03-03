from django.core.cache import cache
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework.filters import SearchFilter
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.models import City, DeliveryPoint, Category, User, Product
from apps.serializer import CityListModelSerializer, DeliveryPointsListModelSerializer, \
    DeliveryPointsRetrieveModelSerializer, CategorySerializer, RegisterSerializer, ProductListSerializer
from apps.tasks import register_sms, register_key


# Create your views here.
@extend_schema(tags=['delivery point'])
class CityListAPIView(ListAPIView):
    queryset = City.objects.all()
    serializer_class = CityListModelSerializer
    filter_backends = [SearchFilter]
    search_fields = ['name']


@extend_schema(tags=['delivery point'])
class DeliveryPointsListAPIView(ListAPIView):
    queryset = DeliveryPoint.objects.only('address', 'has_dressing_room', 'location')
    serializer_class = DeliveryPointsListModelSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['city']


@extend_schema(tags=['delivery point'])
class DeliveryPointsRetrieveAPIView(RetrieveAPIView):
    queryset = DeliveryPoint.objects.only('address', 'has_dressing_room', 'location', 'order_retention_period')
    serializer_class = DeliveryPointsRetrieveModelSerializer


@extend_schema(tags=['category'])
class CategoryListAPIView(APIView):
    def get(self, request):
        tree = cache.get('categories_cache')
        if tree is None:
            top_categories = Category.objects.filter(parent=None).prefetch_related('subcategory')
            tree = CategorySerializer(top_categories, many=True).data
            cache.set('categories_cache', tree, 3)
        return Response(tree)


@extend_schema(tags=['Register'])
class RegisterSmsCodeAPIView(APIView):
    def get(self, request, phone):
        if not request.user.is_authenticated:
            if not cache.get(register_key(phone)):
                register_sms.delay(phone)
                return Response({'message': 'Tasdiqlash uchun kode yuborildi'})
            else:
                return Response({'message': 'Sizga kod yuborilgan'})
        return Response({'message': "Royhatdan o'tgansiz"})


@extend_schema(tags=['Register'])
class RegisterAPIView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


@extend_schema(tags=['Product'])
class ProductListAPIView(ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductListSerializer

    def get_queryset(self):
        query = super().get_queryset()
        slug = self.kwargs.get('slug')
        if "-" in slug:
            category_id = int(slug.split('-')[-1])
            return query.filter(category__path__contains=[category_id])
        return query

