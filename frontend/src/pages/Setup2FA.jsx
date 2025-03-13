import React, { useState, useEffect } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import api from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Setup2FA() {
  const [qrCode, setQrCode] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const tempToken = params.get('temp_token');  // Retrieve the temporary token

  useEffect(() => {
    if (!tempToken) {  // If no temp_token, it’s a normal setup process
      const fetchQrCode = async () => {
        try {
          const token = localStorage.getItem(ACCESS_TOKEN);
          const response = await api.get('/api/setup-2fa/', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setQrCode(response.data.qr_code);
        } catch (error) {
          alert('Error fetching the QR code');
          navigate('/login');
        }
      };
      fetchQrCode();
    }
  }, [navigate, tempToken]);

  const handleVerify = async () => {
    setLoading(true);
    try {
      if (tempToken) {  // OAuth2 case
        const response = await api.post(
          '/api/setup-2fa/',
          { code },
          { headers: { Authorization: `Bearer ${tempToken}` } }
        );
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
        localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
        navigate('/');
      } else {  // Normal setup case
        const token = localStorage.getItem(ACCESS_TOKEN);
        const response = await api.post(
			'/api/setup-2fa/',
			{ code },
			{ headers: { Authorization: `Bearer ${token}` } }
		);
        alert(response.data.message);
        navigate('/');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Verification error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-2fa-container" style={{ textAlign: 'center', padding: '20px' }}>
      <h2>{tempToken ? '2FA Verification' : 'Enable Two-Factor Authentication'}</h2>
      {!tempToken && (
        <p>Scan this QR code with an app like Google Authenticator:</p>
      )}
      {!tempToken && qrCode && <img src={qrCode} alt="QR Code" />}
      <Form style={{ maxWidth: '300px', margin: '20px auto' }}>
        <Form.Group id="code" className="mb-4">
          <Form.Control
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter the TOTP code"
          />
        </Form.Group>
        <Button
          id="form-verify-button"
          className="w-100"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : tempToken ? 'Verify' : 'Verify and Enable'}
        </Button>
      </Form>
    </div>
  );
}
