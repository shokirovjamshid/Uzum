from rest_framework.permissions import BasePermission, SAFE_METHODS

from apps.models import User


class SellerBasePermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.is_authenticated:
            return request.user == obj.seller.user and request.user.type == User.TypeChoice.SELLER
        return False


class SellerCreateBasePermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS and request.user.type == User.TypeChoice.ADMIN:
            return True
        return request.user.type == User.TypeChoice.SELLER
