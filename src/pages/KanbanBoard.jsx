import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import AddApplicationModal from '../components/AddApplicationModal';
import EditApplicationModal from '../components/EditApplicationModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ViewDetailsModal from '../components/ViewDetailsModal';
import api from '../services/api';
import './KanbanBoard.css';

function KanbanBoard({ setCurrentPage }) {
    const [applications, setApplications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [draggedItem, setDraggedItem] = useState(null);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

    const columns = [
        { id: 'Wishlist', title: 'Wishlist', color: '#8b5cf6' },
        { id: 'Applied', title: 'Applied', color: '#f59e0b' },
        { id: 'Interview', title: 'Interview', color: '#3b82f6' },
        { id: 'Offer', title: 'Offer', color: '#10b981' },
        { id: 'Rejected', title: 'Rejected', color: '#ef4444' }
    ];

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/applications');
            setApplications(response.data.applications);
            setError('');
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError(error.response?.data?.message || 'Unable to connect to server');
            useDummyData();
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const useDummyData = () => {
        const dummyApplications = [
            {
                _id: '1',
                company: 'Google',
                position: 'Senior Software Engineer',
                location: 'Mountain View, CA',
                salary: '$150k - $200k',
                status: 'Interview',
                appliedDate: '2025-01-08',
                jobType: 'Full-time',
                logo: '🔍'
            },
            {
                _id: '2',
                company: 'Microsoft',
                position: 'Full Stack Developer',
                location: 'Redmond, WA',
                salary: '$130k - $180k',
                status: 'Applied',
                appliedDate: '2025-01-07',
                jobType: 'Full-time',
                logo: '💻'
            },
            {
                _id: '3',
                company: 'Amazon',
                position: 'Frontend Engineer',
                location: 'Seattle, WA',
                salary: '$140k - $190k',
                status: 'Wishlist',
                appliedDate: '2025-01-06',
                jobType: 'Full-time',
                logo: '📦'
            },
            {
                _id: '4',
                company: 'Meta',
                position: 'React Developer',
                location: 'Menlo Park, CA',
                salary: '$145k - $195k',
                status: 'Offer',
                appliedDate: '2025-01-05',
                jobType: 'Full-time',
                logo: '👍'
            },
            {
                _id: '5',
                company: 'Apple',
                position: 'iOS Developer',
                location: 'Cupertino, CA',
                salary: '$155k - $205k',
                status: 'Rejected',
                appliedDate: '2025-01-04',
                jobType: 'Full-time',
                logo: '🍎'
            }
        ];
        setApplications(dummyApplications);
    };

    const handleApplicationAdded = () => {
        fetchApplications();
    };

    const handleApplicationUpdated = () => {
        fetchApplications();
    };

    const handleApplicationDeleted = () => {
        fetchApplications();
    };

    const handleView = (application) => {
        setSelectedApplication(application);
        setIsViewModalOpen(true);
    };

    const handleEdit = (application) => {
        setSelectedApplication(application);
        setIsEditModalOpen(true);
    };

    const handleDelete = (application) => {
        setSelectedApplication(application);
        setIsDeleteModalOpen(true);
    };

    // Drag and Drop handlers
    const handleDragStart = (e, application) => {
        setDraggedItem(application);
        e.dataTransfer.effectAllowed = 'move';
        e.target.style.opacity = '0.5';
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedItem(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();

        if (!draggedItem || draggedItem.status === newStatus) {
            return;
        }

        const originalApplications = [...applications];

        // Update locally first for instant feedback (Optimistic Update)
        const updatedApplications = applications.map(app =>
            app._id === draggedItem._id ? { ...app, status: newStatus } : app
        );
        setApplications(updatedApplications);

        // Update on backend
        try {
            await api.put(`/applications/${draggedItem._id}`, { ...draggedItem, status: newStatus });
            console.log('✅ Status updated successfully');
        } catch (error) {
            console.error('❌ Error updating status:', error);
            // Revert on error
            setApplications(originalApplications);
        }
    };

    const filteredApplications = applications.filter(app =>
        app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getApplicationsByStatus = (status) => {
        return filteredApplications.filter(app => app.status === status);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading && applications.length === 0) {
        return (
            <div className="kanban-page">
                <Navbar setCurrentPage={setCurrentPage} />
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading kanban board...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="kanban-page">
            <Navbar setCurrentPage={setCurrentPage} />

            {/* All Modals */}
            <AddApplicationModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onApplicationAdded={handleApplicationAdded}
            />

            <EditApplicationModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                application={selectedApplication}
                onApplicationUpdated={handleApplicationUpdated}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                item={selectedApplication}
                itemType="application"
                onDeleted={handleApplicationDeleted}
            />

            <ViewDetailsModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                application={selectedApplication}
            />

            <div className="kanban-container">
                {/* Header */}
                {error && (
                    <div className="error-banner">
                        ⚠️ {error} - Showing demo data
                    </div>
                )}

                <div className="kanban-header">
                    <div>
                        <h1 className="kanban-title">Kanban Board</h1>
                        <p className="kanban-subtitle">Drag and drop to update application status</p>
                    </div>
                    <div className="kanban-actions">
                        <div className="search-box-kanban">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search applications..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="add-button" onClick={() => setIsAddModalOpen(true)}>
                            <Plus size={20} />
                            <span>Add Application</span>
                        </button>
                    </div>
                </div>

                {/* Kanban Columns */}
                <div className="kanban-board">
                    {columns.map((column) => {
                        const columnApplications = getApplicationsByStatus(column.id);

                        return (
                            <div
                                key={column.id}
                                className="kanban-column"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, column.id)}
                            >
                                <div className="column-header" style={{ borderTopColor: column.color }}>
                                    <h3 className="column-title">{column.title}</h3>
                                    <span className="column-count">{columnApplications.length}</span>
                                </div>

                                <div className="column-content">
                                    {columnApplications.length > 0 ? (
                                        columnApplications.map((app) => (
                                            <div
                                                key={app._id}
                                                className="kanban-card"
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, app)}
                                                onDragEnd={handleDragEnd}
                                                onClick={() => handleView(app)}
                                            >
                                                <div className="card-header">
                                                    <div className="card-logo">{app.logo || '🏢'}</div>
                                                    <div className="card-menu" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            className="card-menu-btn"
                                                            onClick={() => handleEdit(app)}
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className="card-menu-btn delete"
                                                            onClick={() => handleDelete(app)}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>

                                                <h4 className="card-company">{app.company}</h4>
                                                <p className="card-position">{app.position}</p>

                                                {app.location && (
                                                    <p className="card-location">📍 {app.location}</p>
                                                )}

                                                {app.salary && (
                                                    <p className="card-salary">💰 {app.salary}</p>
                                                )}

                                                <div className="card-footer">
                                                    <span className="card-date">🗓️ {formatDate(app.appliedDate)}</span>
                                                    {app.jobType && (
                                                        <span className="card-type">{app.jobType}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-column">
                                            <p>No applications</p>
                                            <p className="empty-hint">Drag cards here</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default KanbanBoard;
