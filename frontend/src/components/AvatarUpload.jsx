import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import api from '../api';

export default function AvatarUpload({ show, handleClose, onAvatarUpdate }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError("File size should be less than 2MB");
        return;
      }
      if (!file.type.match(/image\/(jpeg|png|gif)/)) {
        setError("Only JPEG, PNG, and GIF images are allowed");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      const response = await api.patch('/api/user/profile/', formData, {
      });
      
      // Fetch the updated profile to get the new avatar URL
      const profileResponse = await api.get('/api/user/profile/');
      onAvatarUpdate(profileResponse.data.avatar);
      handleClose();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to upload avatar");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} dialogClassName="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Change Avatar</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="align-items-center">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleFileSelect}
            className="mb-3"
          />
          {error && <div className="text-danger mb-3">{error}</div>}
          {selectedFile && (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              style={{ maxWidth: '200px', maxHeight: '200px' }}
              className="mb-3"
            />
          )}
        </div>
      </Modal.Body>
      <Modal.Footer style={{border:"none"}}>
        <Button variant="primary" onClick={handleUpload}>
          Upload
        </Button>
        <Button variant="danger" onClick={handleClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
} 