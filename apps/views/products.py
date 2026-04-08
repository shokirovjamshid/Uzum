from django.core.cache import cache
from django.core.signing import TimestampSigner
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from mptt.utils import get_cached_trees
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.generics import CreateAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.filters import ProductFiterSet
from apps.models import City, DeliveryPoint, Category, User, Product, Shop, Favorite, Seller, Comment
from apps.permissions import SellerBasePermission, SellerCreateBasePermission
from apps.serializers import (
    CityListModelSerializer,
    DeliveryPointsListModelSerializer,
    DeliveryPointsRetrieveModelSerializer,
    ProductListSerializer,
    CategoryModelSerializer,
    ShopRetrieveUpdateDestroySerializer,
    ShopListCreateSerializer,
    CommentListModelSerializer,
    CommentCreateModelSerializer,
    FavoriteListProductModelSerializer,
    FavoriteRetrieveProductSerializer, CategoryDetailModelSerializer,
)

signer = TimestampSigner()


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
    filterset_fields = ["city"]


@extend_schema(tags=['delivery point'])
class DeliveryPointsRetrieveAPIView(RetrieveAPIView):
    queryset = DeliveryPoint.objects.only('address', 'has_dressing_room', 'location', 'order_retention_period')
    serializer_class = DeliveryPointsRetrieveModelSerializer


@extend_schema(tags=['Product'])  # ☑️
class CategoryListAPIView(ListAPIView):
    queryset = Category.objects.defer('attribute', 'path', 'product_amount')
    serializer_class = CategoryModelSerializer

    def list(self, request, *args, **kwargs):
        data = cache.get('categories_key')
        if data is None:
            queryset = self.filter_queryset(
                self.get_queryset()).prefetch_related('subcategory')
            tree = get_cached_trees(queryset)
            serializer = self.get_serializer(tree, many=True)
            data = serializer.data
            cache.set('categories_key', data, 36000)
        return Response(data)

@extend_schema(tags=['Product'])
class CategoryDetailAPIView(ListAPIView):
    queryset = Category.objects.filter(parent=None).prefetch_related(
        'attribute__values',
        'subcategory__attribute__values',
        'subcategory__subcategory__attribute__values'
    )
    serializer_class = CategoryDetailModelSerializer


@extend_schema(tags=["Product"])
class FavoriteProductListCreateAPIView(ListCreateAPIView):
    queryset = Favorite.objects.all()
    permission_classes = [IsAuthenticated, ]
    serializer_class = FavoriteListProductModelSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(user=self.request.user)




@extend_schema(tags=["Product"])
class FavoriteProductRetrieveAPIView(RetrieveAPIView):
    queryset = Favorite.objects.defer('status')
    serializer_class = FavoriteRetrieveProductSerializer
    permission_classes = [IsAuthenticated, ]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(user=self.request.user)


@extend_schema(tags=["shop"])
class ShopRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Shop.objects.defer('updated_at')
    serializer_class = ShopRetrieveUpdateDestroySerializer
    permission_classes = SellerBasePermission,
    lookup_field = 'slug'


@extend_schema(tags=["shop"])
class ShopListCreateAPIView(ListCreateAPIView):
    queryset = Shop.objects.defer('updated_at')
    serializer_class = ShopListCreateSerializer
    permission_classes = IsAuthenticated, SellerCreateBasePermission

    def get_queryset(self):
        query = super().get_queryset()
        if self.request.user.is_admin:
            return query
        return query.filter(seller__user=self.request.user)

    def perform_create(self, serializer):
        seller = Seller.objects.get(user=self.request.user)
        serializer.save(seller=seller)


@extend_schema(tags=["Product"])
class CommentListAPIView(ListAPIView):
    queryset = Comment.objects.defer('is_anonymous', 'service_evaluation', 'delivery_speed_assessment', 'user',
                                     'updated_at').prefetch_related('images')
    serializer_class = CommentListModelSerializer

    def get_queryset(self):
        query = super().get_queryset()
        return query.filter(product__slug=self.kwargs.get('slug'), status=Comment.Status.PUBLISHED)


@extend_schema(tags=["Product"])
class CommentCreateAPIView(CreateAPIView):
    queryset = Comment.objects.defer('status')
    serializer_class = CommentCreateModelSerializer


@extend_schema(tags=["Product"])
class ProductModelViewSet(ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductListSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = ProductFiterSet
    ordering_fields = 'created_at',
    lookup_url_kwarg = 'slug'

    def get_serializer_class(self):
        if self.request.method in SAFE_METHODS:
            return ProductListSerializer
        return super().get_serializer_class()

    @action(detail=True, url_path='comments', methods=['get'])
    def get_comment(self, request, **kwargs):
        product = self.get_object()
        comments = Comment.objects.filter(product=product)
        serializer = CommentListModelSerializer(comments, many=True)
        return Response(serializer.data)

    @action(detail=True, url_path='comments', methods=['post'])
    def create_comment(self, request, **kwargs):
        product = self.get_object()
        serializer = CommentCreateModelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product=product, user=request.user)
            return Response(serializer.data)
        return Response(serializer.errors)
