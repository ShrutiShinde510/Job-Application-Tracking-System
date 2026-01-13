import React from 'react';
import { X, Calendar, Clock, Video, Users, MapPin, FileText, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import './ViewDetailsModal.css';

function InterviewDetailsModal({ isOpen, onClose, interview, onEdit, onDelete }) {
    if (!isOpen || !interview) return null;

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Scheduled': return '#3b82f6';
            case 'Completed': return '#10b981';
            case 'Cancelled': return '#ef4444';
            case 'Rescheduled': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const getOutcomeInfo = (outcome) => {
        switch (outcome) {
            case 'Passed':
                return { icon: <CheckCircle size={20} />, color: '#10b981', label: 'Passed ✓' };
            case 'Failed':
                return { icon: <XCircle size={20} />, color: '#ef4444', label: 'Not Selected' };
            case 'Pending':
                return { icon: <AlertCircle size={20} />, color: '#f59e0b', label: 'Pending' };
            default:
                return { icon: <AlertCircle size={20} />, color: '#6b7280', label: 'N/A' };
        }
    };

    const dateTime = formatDateTime(interview.interviewDate);
    const outcomeInfo = getOutcomeInfo(interview.outcome);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="view-modal interview-details" onClick={(e) => e.stopPropagation()}>
                <div className="view-header">
                    <div className="view-logo">
                        {interview.application?.logo || '🏢'}
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="view-content">
                    <h2 className="view-company">{interview.application?.company}</h2>
                    <p className="view-position">{interview.application?.position}</p>

                    <div className="interview-status-row">
                        <div
                            className="view-status"
                            style={{
                                backgroundColor: getStatusColor(interview.status) + '20',
                                color: getStatusColor(interview.status)
                            }}
                        >
                            {interview.status}
                        </div>
                        {interview.outcome !== 'Pending' && interview.outcome !== 'N/A' && (
                            <div
                                className="view-status"
                                style={{
                                    backgroundColor: outcomeInfo.color + '20',
                                    color: outcomeInfo.color
                                }}
                            >
                                {outcomeInfo.icon}
                                {outcomeInfo.label}
                            </div>
                        )}
                    </div>

                    <div className="view-details">
                        <div className="detail-item">
                            <Calendar size={18} />
                            <div>
                                <span className="detail-label">Interview Date</span>
                                <span className="detail-value">{dateTime.date}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <Clock size={18} />
                            <div>
                                <span className="detail-label">Time & Duration</span>
                                <span className="detail-value">{dateTime.time} ({interview.duration} min)</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <Video size={18} />
                            <div>
                                <span className="detail-label">Interview Type & Round</span>
                                <span className="detail-value">{interview.interviewType} - {interview.round}</span>
                            </div>
                        </div>

                        {interview.interviewer?.name && (
                            <div className="detail-item">
                                <Users size={18} />
                                <div>
                                    <span className="detail-label">Interviewer</span>
                                    <span className="detail-value">
                                        {interview.interviewer.name}
                                        {interview.interviewer.title && ` - ${interview.interviewer.title}`}
                                    </span>
                                </div>
                            </div>
                        )}

                        {interview.location && (
                            <div className="detail-item">
                                <MapPin size={18} />
                                <div>
                                    <span className="detail-label">Location/Link</span>
                                    {interview.location.startsWith('http') ? (
                                        <a
                                            href={interview.location}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="detail-link"
                                        >
                                            Join Meeting →
                                        </a>
                                    ) : (
                                        <span className="detail-value">{interview.location}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {interview.notes && (
                            <div className="detail-item notes">
                                <FileText size={18} />
                                <div>
                                    <span className="detail-label">Notes</span>
                                    <p className="detail-notes">{interview.notes}</p>
                                </div>
                            </div>
                        )}

                        {interview.feedback && (
                            <div className="detail-item notes">
                                <FileText size={18} />
                                <div>
                                    <span className="detail-label">Feedback</span>
                                    <p className="detail-notes">{interview.feedback}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                onClose();
                                onEdit(interview);
                            }}
                        >
                            <Edit size={18} />
                            Edit Interview
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={() => {
                                onClose();
                                onDelete(interview);
                            }}
                        >
                            <Trash2 size={18} />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InterviewDetailsModal;