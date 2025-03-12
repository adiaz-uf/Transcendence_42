import React from 'react';
import { Form, Button, Modal } from 'react-bootstrap';

export default function TwoFAModal({ show2FAModal, handleClose2FAModal, is2FAEnabled, qrCode, secret, twoFACode, setTwoFACode, handleToggle2FA }) {
  return (
    <Modal show={show2FAModal} onHide={handleClose2FAModal} dialogClassName="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          {is2FAEnabled ? "Disable Two-Factor Authentication" : "Enable Two-Factor Authentication"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!is2FAEnabled && qrCode && (
          <>
            <p>Scan this QR code with your authenticator app:</p>
            <img src={qrCode} alt="2FA QR Code" className="qr-code" />
            <p>Or enter this secret manually: <strong>{secret}</strong></p>
          </>
        )}
        {is2FAEnabled && <p>Enter your 2FA code to disable it:</p>}
        <Form onSubmit={handleToggle2FA}>
          <Form.Group controlId="form2FACode">
            <Form.Label>2FA Code</Form.Label>
            <Form.Control
              type="text"
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value)}
              placeholder="Enter the 6-digit code"
            />
          </Form.Group>
          <Button variant={is2FAEnabled ? "danger" : "success"} type="submit" className="mt-3 w-100">
            {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
