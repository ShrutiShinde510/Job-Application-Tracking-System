import React, { useState } from 'react';
import { X, Briefcase, MapPin, DollarSign, Calendar, Link as LinkIcon } from 'lucide-react';
import './AddApplicationModal.css';

function EditApplicationModal({ isOpen, onClose, application, onApplicationUpdated }) {
    const [formData, setFormData] = useState({
        company: application?.company || '',
        position: application?.position || '',
        location: application?.location || '',
        salary: application?.salary || '',
        jobType: application?.jobType || 'Full-time',
        status: application?.status || 'Applied',
        appliedDate: application?.appliedDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        jobUrl: application?.jobUrl || '',
        notes: application?.notes || '',
        logo: application?.logo || '🏢'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverMsg, setServerMsg] = useState('');
    const [msgType, setMsgType] = useState('');

    const emojiOptions = ['🏢', '💼', '🚀', '💻', '🔧', '🎯', '⚡', '🌟', '📱', '🎨', '🔍', '📊'];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
        setServerMsg('');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.company.trim()) newErrors.company = 'Company name is required';
        if (!formData.position.trim()) newErrors.position = 'Position is required';
        if (formData.jobUrl && !formData.jobUrl.startsWith('http')) {
            newErrors.jobUrl = 'URL must start with http:// or https://';
        }
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

                const response = await fetch(`http://localhost:5001/api/applications/${application._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('✅ Application updated:', data);
                    setServerMsg('✅ Application updated successfully!');
                    setMsgType('success');

                    setTimeout(() => {
                        onApplicationUpdated();
                        onClose();
                        setServerMsg('');
                    }, 1000);
                } else {
                    setServerMsg(data.message || 'Failed to update application');
                    setMsgType('error');
                }
            } catch (error) {
                console.error('❌ Error updating application:', error);
                setServerMsg('⚠️ Cannot connect to server');
                setMsgType('error');
            } finally {
                setLoading(false);
            }
        } else {
            setErrors(newErrors);
        }
    };

    if (!isOpen || !application) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-section">
                        <Briefcase size={24} />
                        <h2 className="modal-title">Edit Application</h2>
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

                    <div className="form-group">
                        <label className="form-label">Company Logo (Emoji)</label>
                        <div className="emoji-picker">
                            {emojiOptions.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    className={`emoji-option ${formData.logo === emoji ? 'selected' : ''}`}
                                    onClick={() => setFormData({ ...formData, logo: emoji })}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Company Name *</label>
                            <input
                                type="text"
                                name="company"
                                className="form-input"
                                placeholder="e.g., Google"
                                value={formData.company}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errors.company && <span className="error-message">{errors.company}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Position *</label>
                            <input
                                type="text"
                                name="position"
                                className="form-input"
                                placeholder="e.g., Software Engineer"
                                value={formData.position}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errors.position && <span className="error-message">{errors.position}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                <MapPin size={16} style={{ verticalAlign: 'middle' }} /> Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                className="form-input"
                                placeholder="e.g., New York, NY"
                                value={formData.location}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <DollarSign size={16} style={{ verticalAlign: 'middle' }} /> Salary Range
                            </label>
                            <input
                                type="text"
                                name="salary"
                                className="form-input"
                                placeholder="e.g., $100k - $150k"
                                value={formData.salary}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Job Type</label>
                            <select
                                name="jobType"
                                className="form-select"
                                value={formData.jobType}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                                <option value="Freelance">Freelance</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                name="status"
                                className="form-select"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="Wishlist">Wishlist</option>
                                <option value="Applied">Applied</option>
                                <option value="Interview">Interview</option>
                                <option value="Offer">Offer</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                <Calendar size={16} style={{ verticalAlign: 'middle' }} /> Applied Date
                            </label>
                            <input
                                type="date"
                                name="appliedDate"
                                className="form-input"
                                value={formData.appliedDate}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <LinkIcon size={16} style={{ verticalAlign: 'middle' }} /> Job URL
                            </label>
                            <input
                                type="url"
                                name="jobUrl"
                                className="form-input"
                                placeholder="https://..."
                                value={formData.jobUrl}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errors.jobUrl && <span className="error-message">{errors.jobUrl}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea
                            name="notes"
                            className="form-textarea"
                            placeholder="Add any notes about this application..."
                            rows="3"
                            value={formData.notes}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

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
                            {loading ? 'Updating...' : 'Update Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditApplicationModal;