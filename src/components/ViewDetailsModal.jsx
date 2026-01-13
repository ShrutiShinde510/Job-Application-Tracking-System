import React from 'react';
import { X, Building2, MapPin, DollarSign, Calendar, Link as LinkIcon, Briefcase, FileText } from 'lucide-react';
import './ViewDetailsModal.css';

function ViewDetailsModal({ isOpen, onClose, application }) {
    if (!isOpen || !application) return null;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'offer': return '#10b981';
            case 'interview': return '#3b82f6';
            case 'applied': return '#f59e0b';
            case 'rejected': return '#ef4444';
            case 'wishlist': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="view-modal" onClick={(e) => e.stopPropagation()}>
                <div className="view-header">
                    <div className="view-logo">{application.logo || '🏢'}</div>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="view-content">
                    <h2 className="view-company">{application.company}</h2>
                    <p className="view-position">{application.position}</p>

                    <div
                        className="view-status"
                        style={{
                            backgroundColor: getStatusColor(application.status) + '20',
                            color: getStatusColor(application.status)
                        }}
                    >
                        {application.status}
                    </div>

                    <div className="view-details">
                        {application.location && (
                            <div className="detail-item">
                                <MapPin size={18} />
                                <div>
                                    <span className="detail-label">Location</span>
                                    <span className="detail-value">{application.location}</span>
                                </div>
                            </div>
                        )}

                        {application.salary && (
                            <div className="detail-item">
                                <DollarSign size={18} />
                                <div>
                                    <span className="detail-label">Salary Range</span>
                                    <span className="detail-value">{application.salary}</span>
                                </div>
                            </div>
                        )}

                        <div className="detail-item">
                            <Briefcase size={18} />
                            <div>
                                <span className="detail-label">Job Type</span>
                                <span className="detail-value">{application.jobType || 'Full-time'}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <Calendar size={18} />
                            <div>
                                <span className="detail-label">Applied Date</span>
                                <span className="detail-value">{formatDate(application.appliedDate)}</span>
                            </div>
                        </div>

                        {application.jobUrl && (
                            <div className="detail-item">
                                <LinkIcon size={18} />
                                <div>
                                    <span className="detail-label">Job Posting</span>
                                    <a
                                        href={application.jobUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="detail-link"
                                    >
                                        View Job Posting →
                                    </a>
                                </div>
                            </div>
                        )}

                        {application.notes && (
                            <div className="detail-item notes">
                                <FileText size={18} />
                                <div>
                                    <span className="detail-label">Notes</span>
                                    <p className="detail-notes">{application.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewDetailsModal;