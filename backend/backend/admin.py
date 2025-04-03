from django.contrib import admin
from api.models import UserProfile, Match, UserStat, Tournament

# Register your models here.
admin.site.register(UserProfile)
admin.site.register(UserStat)
admin.site.register(Match)
admin.site.register(Tournament)