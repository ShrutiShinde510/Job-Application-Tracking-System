import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import './DeleteConfirmModal.css';

function DeleteConfirmModal({ isOpen, onClose, item, itemType, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const [serverMsg, setServerMsg] = useState('');

    const handleDelete = async () => {
        setLoading(true);
        setServerMsg('');

        try {
            const token = localStorage.getItem('token');
            const endpoint = itemType === 'interview'
                ? `http://localhost:5001/api/interviews/${item._id}`
                : `http://localhost:5001/api/applications/${item._id}`;

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                console.log(`✅ ${itemType} deleted`);
                setServerMsg(`✅ ${itemType} deleted successfully!`);

                setTimeout(() => {
                    onDeleted();
                    onClose();
                    setServerMsg('');
                }, 1000);
            } else {
                setServerMsg(data.message || `Failed to delete ${itemType}`);
            }
        } catch (error) {
            console.error(`❌ Error deleting ${itemType}:`, error);
            setServerMsg('⚠️ Cannot connect to server');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !item) return null;

    const itemName = itemType === 'interview'
        ? `${item.round} at ${item.application?.company}`
        : `${item.company} (${item.position})`;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                <div className="delete-icon">
                    <AlertTriangle size={48} />
                </div>

                <h2 className="delete-title">Delete {itemType === 'interview' ? 'Interview' : 'Application'}?</h2>
                <p className="delete-text">
                    Are you sure you want to delete the {itemType} for{' '}
                    <strong>{itemName}</strong>?
                </p>
                <p className="delete-warning">This action cannot be undone.</p>

                {serverMsg && (
                    <div className={`delete-message ${serverMsg.includes('✅') ? 'success' : 'error'}`}>
                        {serverMsg}
                    </div>
                )}

                <div className="delete-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : `Delete ${itemType === 'interview' ? 'Interview' : 'Application'}`}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteConfirmModal;