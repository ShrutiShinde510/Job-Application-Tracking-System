import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, MapPin, Plus, Edit, Trash2, CheckCircle, XCircle, Users, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import AddInterviewModal from '../components/AddInterviewModal';
import EditInterviewModal from '../components/EditInterviewModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import InterviewDetailsModal from '../components/InterviewDetailsModal';
import api from '../services/api';
import './Interviews.css';

function Interviews({ setCurrentPage }) {
    const [interviews, setInterviews] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('upcoming'); // upcoming, past, all
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchInterviews(), fetchApplications()]);
        setLoading(false);
    };

    const fetchInterviews = async () => {
        try {
            const response = await api.get('/interviews');
            setInterviews(response.data.interviews);
        } catch (error) {
            console.error('Error fetching interviews:', error);
            useDummyInterviews();
        }
    };

    const fetchApplications = async () => {
        try {
            const response = await api.get('/applications');
            setApplications(response.data.applications);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const useDummyInterviews = () => {
        const dummyInterviews = [
            {
                _id: '1',
                application: {
                    _id: 'app1',
                    company: 'Google',
                    position: 'Senior Software Engineer',
                    logo: '🔍'
                },
                round: 'Technical',
                interviewDate: new Date(Date.now() + 86400000).toISOString(),
                duration: 60,
                interviewType: 'Video',
                interviewer: {
                    name: 'Jane Smith',
                    title: 'Engineering Manager'
                },
                location: 'https://meet.google.com/xyz-abc-def',
                status: 'Scheduled',
                outcome: 'Pending',
                notes: 'Prepare system design and coding questions'
            },
            {
                _id: '2',
                application: {
                    _id: 'app2',
                    company: 'Microsoft',
                    position: 'Full Stack Developer',
                    logo: '💻'
                },
                round: 'Phone Screen',
                interviewDate: new Date(Date.now() + 172800000).toISOString(),
                duration: 45,
                interviewType: 'Phone',
                interviewer: {
                    name: 'John Doe',
                    title: 'Senior Recruiter'
                },
                status: 'Scheduled',
                outcome: 'Pending',
                notes: 'Discuss background and experience'
            },
            {
                _id: '3',
                application: {
                    _id: 'app3',
                    company: 'Amazon',
                    position: 'Frontend Engineer',
                    logo: '📦'
                },
                round: 'Behavioral',
                interviewDate: new Date(Date.now() - 86400000).toISOString(),
                duration: 60,
                interviewType: 'Video',
                interviewer: {
                    name: 'Sarah Johnson',
                    title: 'Team Lead'
                },
                location: 'https://zoom.us/j/123456789',
                status: 'Completed',
                outcome: 'Passed',
                notes: 'Went well, discussed STAR method',
                feedback: 'Strong communication skills, good examples'
            }
        ];
        setInterviews(dummyInterviews);
    };

    const handleInterviewAdded = () => {
        fetchInterviews();
    };

    const handleInterviewUpdated = () => {
        fetchInterviews();
    };

    const handleInterviewDeleted = () => {
        fetchInterviews();
    };

    const handleEdit = (interview) => {
        setSelectedInterview(interview);
        setIsEditModalOpen(true);
    };

    const handleDelete = (interview) => {
        setSelectedInterview(interview);
        setIsDeleteModalOpen(true);
    };

    const handleViewDetails = (interview) => {
        setSelectedInterview(interview);
        setIsDetailsModalOpen(true);
    };

    const filterInterviews = () => {
        const now = new Date();

        switch (view) {
            case 'upcoming':
                return interviews.filter(i => new Date(i.interviewDate) >= now && i.status === 'Scheduled');
            case 'past':
                return interviews.filter(i => new Date(i.interviewDate) < now || i.status === 'Completed');
            case 'all':
            default:
                return interviews;
        }
    };

    const filteredInterviews = filterInterviews();

    const getStatusColor = (status) => {
        switch (status) {
            case 'Scheduled': return '#3b82f6';
            case 'Completed': return '#10b981';
            case 'Cancelled': return '#ef4444';
            case 'Rescheduled': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const getOutcomeIcon = (outcome) => {
        switch (outcome) {
            case 'Passed': return <CheckCircle size={16} color="#10b981" />;
            case 'Failed': return <XCircle size={16} color="#ef4444" />;
            default: return <Clock size={16} color="#f59e0b" />;
        }
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' })
        };
    };

    const isToday = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isTomorrow = (dateString) => {
        const date = new Date(dateString);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date.toDateString() === tomorrow.toDateString();
    };

    const getDateLabel = (dateString) => {
        if (isToday(dateString)) return 'Today';
        if (isTomorrow(dateString)) return 'Tomorrow';
        return null;
    };

    const stats = {
        upcoming: interviews.filter(i => new Date(i.interviewDate) >= new Date() && i.status === 'Scheduled').length,
        completed: interviews.filter(i => i.status === 'Completed').length,
        passed: interviews.filter(i => i.outcome === 'Passed').length,
        total: interviews.length
    };

    if (loading) {
        return (
            <div className="interviews-page">
                <Navbar setCurrentPage={setCurrentPage} currentPage="interviews" />
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading interviews...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="interviews-page">
            <Navbar setCurrentPage={setCurrentPage} currentPage="interviews" />

            {/* Modals */}
            <AddInterviewModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                applications={applications}
                onInterviewAdded={handleInterviewAdded}
            />

            <EditInterviewModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                interview={selectedInterview}
                onInterviewUpdated={handleInterviewUpdated}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                item={selectedInterview}
                itemType="interview"
                onDeleted={handleInterviewDeleted}
            />

            <InterviewDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                interview={selectedInterview}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <div className="interviews-container">
                {/* Header */}
                <div className="interviews-header">
                    <div>
                        <h1 className="page-title">Interview Schedule</h1>
                        <p className="page-subtitle">Manage and prepare for your interviews</p>
                    </div>
                    <button className="add-button" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={20} />
                        <span>Schedule Interview</span>
                    </button>
                </div>

                {/* Stats */}
                <div className="interview-stats">
                    <div className="stat-card">
                        <Clock size={24} style={{ color: '#3b82f6' }} />
                        <div>
                            <h3>{stats.upcoming}</h3>
                            <p>Upcoming</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <CheckCircle size={24} style={{ color: '#10b981' }} />
                        <div>
                            <h3>{stats.completed}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <Users size={24} style={{ color: '#f59e0b' }} />
                        <div>
                            <h3>{stats.passed}</h3>
                            <p>Passed</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <Calendar size={24} style={{ color: '#8b5cf6' }} />
                        <div>
                            <h3>{stats.total}</h3>
                            <p>Total</p>
                        </div>
                    </div>
                </div>

                {/* View Tabs */}
                <div className="view-tabs">
                    <button
                        className={`view-tab ${view === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setView('upcoming')}
                    >
                        Upcoming ({stats.upcoming})
                    </button>
                    <button
                        className={`view-tab ${view === 'past' ? 'active' : ''}`}
                        onClick={() => setView('past')}
                    >
                        Past
                    </button>
                    <button
                        className={`view-tab ${view === 'all' ? 'active' : ''}`}
                        onClick={() => setView('all')}
                    >
                        All ({stats.total})
                    </button>
                </div>

                {/* Interviews List */}
                <div className="interviews-list">
                    {filteredInterviews.length > 0 ? (
                        filteredInterviews.map((interview) => {
                            const dateTime = formatDateTime(interview.interviewDate);
                            const dateLabel = getDateLabel(interview.interviewDate);

                            return (
                                <div key={interview._id} className="interview-card">
                                    <div className="interview-card-header">
                                        <div className="interview-company-info">
                                            <div className="company-logo-interview">
                                                {interview.application?.logo || '🏢'}
                                            </div>
                                            <div>
                                                <h3 className="interview-company">{interview.application?.company}</h3>
                                                <p className="interview-position">{interview.application?.position}</p>
                                            </div>
                                        </div>
                                        <div className="interview-actions">
                                            <button className="icon-btn" onClick={() => handleEdit(interview)}>
                                                <Edit size={16} />
                                            </button>
                                            <button className="icon-btn delete" onClick={() => handleDelete(interview)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="interview-card-body">
                                        <div className="interview-info-grid">
                                            <div className="info-item">
                                                <Calendar size={16} />
                                                <div>
                                                    {dateLabel && <span className="date-label">{dateLabel}</span>}
                                                    <span className="info-value">{dateTime.date}</span>
                                                    <span className="info-label">{dateTime.dayOfWeek}</span>
                                                </div>
                                            </div>

                                            <div className="info-item">
                                                <Clock size={16} />
                                                <div>
                                                    <span className="info-value">{dateTime.time}</span>
                                                    <span className="info-label">{interview.duration} minutes</span>
                                                </div>
                                            </div>

                                            <div className="info-item">
                                                <Video size={16} />
                                                <div>
                                                    <span className="info-value">{interview.interviewType}</span>
                                                    <span className="info-label">{interview.round}</span>
                                                </div>
                                            </div>

                                            {interview.interviewer?.name && (
                                                <div className="info-item">
                                                    <Users size={16} />
                                                    <div>
                                                        <span className="info-value">{interview.interviewer.name}</span>
                                                        <span className="info-label">{interview.interviewer.title || 'Interviewer'}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {interview.location && (
                                            <div className="interview-location">
                                                <MapPin size={14} />
                                                {interview.location.startsWith('http') ? (
                                                    <a href={interview.location} target="_blank" rel="noopener noreferrer">
                                                        Join Meeting
                                                    </a>
                                                ) : (
                                                    <span>{interview.location}</span>
                                                )}
                                            </div>
                                        )}

                                        {interview.notes && (
                                            <div className="interview-notes">
                                                <FileText size={14} />
                                                <span>{interview.notes}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="interview-card-footer">
                                        <div className="interview-badges">
                                            <span
                                                className="status-badge"
                                                style={{
                                                    backgroundColor: getStatusColor(interview.status) + '20',
                                                    color: getStatusColor(interview.status)
                                                }}
                                            >
                                                {interview.status}
                                            </span>
                                            {interview.outcome !== 'Pending' && (
                                                <span className="outcome-badge">
                                                    {getOutcomeIcon(interview.outcome)}
                                                    {interview.outcome}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            className="view-details-btn"
                                            onClick={() => handleViewDetails(interview)}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="empty-state">
                            <Calendar size={64} style={{ color: '#cbd5e0' }} />
                            <h3>No {view} interviews</h3>
                            <p>Schedule your first interview to get started</p>
                            <button className="add-button" onClick={() => setIsAddModalOpen(true)}>
                                <Plus size={20} />
                                Schedule Interview
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Interviews;