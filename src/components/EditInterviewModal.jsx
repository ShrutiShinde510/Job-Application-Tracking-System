import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Video, Users, MapPin, FileText } from 'lucide-react';
import './AddApplicationModal.css';

function EditInterviewModal({ isOpen, onClose, interview, onInterviewUpdated }) {
    const [formData, setFormData] = useState({
        round: '',
        interviewDate: '',
        duration: 60,
        interviewType: 'Video',
        interviewer: {
            name: '',
            title: '',
            email: ''
        },
        location: '',
        status: 'Scheduled',
        outcome: 'Pending',
        notes: '',
        feedback: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverMsg, setServerMsg] = useState('');
    const [msgType, setMsgType] = useState('');

    useEffect(() => {
        if (interview && isOpen) {
            setFormData({
                round: interview.round || '',
                interviewDate: interview.interviewDate ? new Date(interview.interviewDate).toISOString().slice(0, 16) : '',
                duration: interview.duration || 60,
                interviewType: interview.interviewType || 'Video',
                interviewer: interview.interviewer || { name: '', title: '', email: '' },
                location: interview.location || '',
                status: interview.status || 'Scheduled',
                outcome: interview.outcome || 'Pending',
                notes: interview.notes || '',
                feedback: interview.feedback || ''
            });
        }
    }, [interview, isOpen]);

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

                const response = await fetch(`http://localhost:5001/api/interviews/${interview._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('✅ Interview updated:', data);
                    setServerMsg('✅ Interview updated successfully!');
                    setMsgType('success');

                    setTimeout(() => {
                        onInterviewUpdated();
                        onClose();
                        setServerMsg('');
                    }, 1000);
                } else {
                    setServerMsg(data.message || 'Failed to update interview');
                    setMsgType('error');
                }
            } catch (error) {
                console.error('❌ Error updating interview:', error);
                setServerMsg('⚠️ Cannot connect to server');
                setMsgType('error');
            } finally {
                setLoading(false);
            }
        } else {
            setErrors(newErrors);
        }
    };

    if (!isOpen || !interview) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-section">
                        <Calendar size={24} />
                        <h2 className="modal-title">Edit Interview</h2>
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
                                value={formData.duration}
                                onChange={handleChange}
                                disabled={loading}
                                min="15"
                                step="15"
                            />
                        </div>
                    </div>

                    {/* Status & Outcome */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                name="status"
                                className="form-select"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="Scheduled">Scheduled</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Rescheduled">Rescheduled</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Outcome</label>
                            <select
                                name="outcome"
                                className="form-select"
                                value={formData.outcome}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Passed">Passed</option>
                                <option value="Failed">Failed</option>
                                <option value="N/A">N/A</option>
                            </select>
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

                    {/* Feedback */}
                    {formData.status === 'Completed' && (
                        <div className="form-group">
                            <label className="form-label">Feedback</label>
                            <textarea
                                name="feedback"
                                className="form-textarea"
                                placeholder="Interview feedback and observations..."
                                rows="3"
                                value={formData.feedback}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    )}

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
                            {loading ? 'Updating...' : 'Update Interview'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditInterviewModal;