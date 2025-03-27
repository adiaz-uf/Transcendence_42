import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import "../styles/MessageBox.css";

const MessageBox = ({ 
    message, 
    type = 'info', 
    duration = 4000, 
    onClose 
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onClose && onClose();
        }, duration);

        const progressInterval = setInterval(() => {
            setProgress(prev => Math.max(0, prev - 1));
        }, duration / 100);

        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
        };
    }, [duration, onClose]);

    const handleClose = () => {
        onClose && onClose();
    };

    if (!isVisible) return null;

    return (
        <div className={`message-box ${type}`}>
            <div className="message-content">
                {message}
                <button 
                    className="message-close" 
                    onClick={handleClose}
                >
                    ✕
                </button>
            </div>
            <div 
                className="message-progress" 
                style={{ 
                    width: `${progress}%`, 
                    backgroundColor: getProgressColor(type) 
                }}
            />
        </div>
    );
};

// Helper function to get progress bar color
const getProgressColor = (type) => {
    switch (type) {
        case 'success': return '#4CAF50';
        case 'error': return '#F44336';
        case 'warning': return '#FF9800';
        default: return '#2196F3';
    }
};

MessageBox.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['info', 'success', 'error', 'warning']),
    duration: PropTypes.number,
    onClose: PropTypes.func
};

export default MessageBox;

