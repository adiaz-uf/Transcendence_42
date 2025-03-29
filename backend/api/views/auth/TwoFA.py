from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response
from rest_framework.views import APIView
from django_otp.plugins.otp_totp.models import TOTPDevice
from io import BytesIO
import base64
import qrcode

class Setup2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        device = TOTPDevice.objects.filter(user=user, name='default').first()
        if not device:
            device = TOTPDevice.objects.create(user=user, name='default')
            user.totp_secret = base64.b32encode(device.bin_key).decode('utf-8').rstrip('=')
            user.save()

        totp_uri = device.config_url
        qr = qrcode.QRCode()
        qr.add_data(totp_uri)
        qr.make(fit=True)
        img = qr.make_image(fill='black', back_color='white')
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode('utf-8')

        return Response({
            'qr_code': f'data:image/png;base64,{img_str}',
            'secret': base64.b32encode(device.bin_key).decode('utf-8'),
            'is_2fa_enabled': user.is_2fa_enabled  # Added to inform the frontend
        })

    def post(self, request):
        user = request.user
        code = request.data.get('code')
        disable = request.data.get('disable', False)  # New parameter to disable

        device = TOTPDevice.objects.filter(user=user, name='default').first()
        if not device:
            return Response({'error': 'No 2FA device found'}, status=400)

        if disable:
            if device.verify_token(code):
                user.is_2fa_enabled = False
                user.save()
                return Response({'message': '2FA successfully disabled'})
            return Response({'error': 'Invalid code for deactivation'}, status=400)
        else:
            if device.verify_token(code):
                user.is_2fa_enabled = True
                user.save()
                return Response({'message': '2FA successfully enabled'})
            return Response({'error': 'Invalid code for activation'}, status=400)