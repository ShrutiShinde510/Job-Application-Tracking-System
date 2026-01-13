import React, { useState } from 'react';
import { X, Calendar, Clock, Video, Users, MapPin, FileText } from 'lucide-react';
import './AddApplicationModal.css';

function AddInterviewModal({ isOpen, onClose, applications, onInterviewAdded }) {
    const [formData, setFormData] = useState({
        application: '',
        round: 'Technical',
        interviewDate: '',
        duration: 60,
        interviewType: 'Video',
        interviewer: {
            name: '',
            title: '',
            email: ''
        },
        location: '',
        notes: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverMsg, setServerMsg] = useState('');
    const [msgType, setMsgType] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('interviewer.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                interviewer: {
                    ...formData.interviewer,
                    [field]: value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
        setServerMsg('');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.application) newErrors.application = 'Please select an application';
        if (!formData.interviewDate) newErrors.interviewDate = 'Interview date is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length === 0) {
            setLoading(true);
            setServerMsg('');
            setMsgType('');

            try {
                const token = localStorage.getItem('token');

                const response = await fetch('http://localhost:5001/api/interviews', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('✅ Interview created:', data);
                    setServerMsg('✅ Interview scheduled successfully!');
                    setMsgType('success');

                    setTimeout(() => {
                        onInterviewAdded();
                        onClose();
                        resetForm();
                    }, 1000);
                } else {
                    setServerMsg(data.message || 'Failed to schedule interview');
                    setMsgType('error');
                }
            } catch (error) {
                console.error('❌ Error scheduling interview:', error);
                setServerMsg('⚠️ Cannot connect to server');
                setMsgType('error');
            } finally {
                setLoading(false);
            }
        } else {
            setErrors(newErrors);
        }
    };

    const resetForm = () => {
        setFormData({
            application: '',
            round: 'Technical',
            interviewDate: '',
            duration: 60,
            interviewType: 'Video',
            interviewer: {
                name: '',
                title: '',
                email: ''
            },
            location: '',
            notes: ''
        });
        setServerMsg('');
        setErrors({});
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-section">
                        <Calendar size={24} />
                        <h2 className="modal-title">Schedule Interview</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                    {serverMsg && (
                        <div className={`modal-message ${msgType}`}>
                            {serverMsg}
                        </div>
                    )}

                    {/* Application Selection */}
                    <div className="form-group">
                        <label className="form-label">Application *</label>
                        <select
                            name="application"
                            className="form-select"
                            value={formData.application}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="">Select an application</option>
                            {applications.map(app => (
                                <option key={app._id} value={app._id}>
                                    {app.company} - {app.position}
                                </option>
                            ))}
                        </select>
                        {errors.application && <span className="error-message">{errors.application}</span>}
                    </div>

                    {/* Interview Round & Type */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Interview Round *</label>
                            <select
                                name="round"
                                className="form-select"
                                value={formData.round}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="Phone Screen">Phone Screen</option>
                                <option value="Technical">Technical</option>
                                <option value="Behavioral">Behavioral</option>
                                <option value="System Design">System Design</option>
                                <option value="HR Round">HR Round</option>
                                <option value="Final Round">Final Round</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Interview Type</label>
                            <select
                                name="interviewType"
                                className="form-select"
                                value={formData.interviewType}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="Video">Video</option>
                                <option value="Phone">Phone</option>
                                <option value="In-Person">In-Person</option>
                                <option value="On-Site">On-Site</option>
                            </select>
                        </div>
                    </div>

                    {/* Date & Duration */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                <Calendar size={16} style={{ verticalAlign: 'middle' }} /> Interview Date & Time *
                            </label>
                            <input
                                type="datetime-local"
                                name="interviewDate"
                                className="form-input"
                                value={formData.interviewDate}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errors.interviewDate && <span className="error-message">{errors.interviewDate}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Clock size={16} style={{ verticalAlign: 'middle' }} /> Duration (minutes)
                            </label>
                            <input
                                type="number"
                                name="duration"
                                className="form-input"
                                placeholder="60"
                                value={formData.duration}
                                onChange={handleChange}
                                disabled={loading}
                                min="15"
                                step="15"
                            />
                        </div>
                    </div>

                    {/* Interviewer Details */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                <Users size={16} style={{ verticalAlign: 'middle' }} /> Interviewer Name
                            </label>
                            <input
                                type="text"
                                name="interviewer.name"
                                className="form-input"
                                placeholder="John Doe"
                                value={formData.interviewer.name}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Interviewer Title</label>
                            <input
                                type="text"
                                name="interviewer.title"
                                className="form-input"
                                placeholder="Senior Engineer"
                                value={formData.interviewer.title}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Location/Link */}
                    <div className="form-group">
                        <label className="form-label">
                            <MapPin size={16} style={{ verticalAlign: 'middle' }} /> Meeting Link or Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            className="form-input"
                            placeholder="https://meet.google.com/... or Office Address"
                            value={formData.location}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label className="form-label">
                            <FileText size={16} style={{ verticalAlign: 'middle' }} /> Notes
                        </label>
                        <textarea
                            name="notes"
                            className="form-textarea"
                            placeholder="Preparation notes, topics to cover..."
                            rows="3"
                            value={formData.notes}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Scheduling...' : 'Schedule Interview'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddInterviewModal;