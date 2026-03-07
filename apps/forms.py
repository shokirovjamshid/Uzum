
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from apps.models import User

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('phone', 'email','password','type')

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ('email', 'password', 'type')