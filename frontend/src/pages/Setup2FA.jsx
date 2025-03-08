import React, { useState, useEffect } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import api from '../api';
import { ACCESS_TOKEN } from '../constants';
import { useNavigate } from 'react-router-dom';

export default function Setup2FA() {
  const [qrCode, setQrCode] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const token = localStorage.getItem(ACCESS_TOKEN);
        const response = await api.get('/api/setup-2fa/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQrCode(response.data.qr_code);
      } catch (error) {
        alert('Erreur lors de la récupération du QR code');
        navigate('/login');
      }
    };
    fetchQrCode();
  }, [navigate]);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      const response = await api.post('/api/setup-2fa/', { code }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(response.data.message);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-2fa-container" style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Activer la double authentification</h2>
      <p>Scannez ce QR code avec une application comme Google Authenticator :</p>
      {qrCode && <img src={qrCode} alt="QR Code" />}
      <Form style={{ maxWidth: '300px', margin: '20px auto' }}>
        <Form.Group id="code" className="mb-4">
          <Form.Control
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Entrez le code TOTP"
          />
        </Form.Group>
        <Button
          id="form-verify-button"
          className="w-100"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : 'Vérifier et activer'}
        </Button>
      </Form>
    </div>
  );
}
