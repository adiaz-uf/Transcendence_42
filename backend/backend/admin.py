from django.contrib import admin
from .models import *
# Register your models here.

admin.site.register(UserProfile)
admin.site.register(UserStat)
admin.site.register(Match)
admin.site.register(Tournament)