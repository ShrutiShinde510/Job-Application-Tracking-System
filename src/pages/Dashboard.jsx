
import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Building2,
  DollarSign
} from 'lucide-react';
import Navbar from '../components/Navbar';
import AddApplicationModal from '../components/AddApplicationModal';
import EditApplicationModal from '../components/EditApplicationModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ViewDetailsModal from '../components/ViewDetailsModal';
import ActionMenu from '../components/ActionMenu';
import api from '../services/api';
import './Dashboard.css';

function Dashboard({ setCurrentPage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeApplications: 0,
    interviews: 0,
    offers: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Fetch applications from backend
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5001/api/applications', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setApplications(data.applications);
        calculateStats(data.applications);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch applications');
        useDummyData();
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Unable to connect to server');
      useDummyData();
    } finally {
      setLoading(false);
    }
  };

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
        logo: '🔍',
        notes: 'Great company culture'
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
        status: 'Interview',
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
    calculateStats(dummyApplications);
  };

  const calculateStats = (apps) => {
    setStats({
      totalApplications: apps.length,
      activeApplications: apps.filter(app =>
        app.status === 'Applied' || app.status === 'Interview'
      ).length,
      interviews: apps.filter(app => app.status === 'Interview').length,
      offers: apps.filter(app => app.status === 'Offer').length,
      rejected: apps.filter(app => app.status === 'Rejected').length
    });
  };

  // Handle application actions
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

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'offer': return <CheckCircle size={16} />;
      case 'interview': return <Calendar size={16} />;
      case 'applied': return <Clock size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || app.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar setCurrentPage={setCurrentPage} />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
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

      <div className="container">
        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            ⚠️ {error} - Showing demo data
          </div>
        )}

        {/* Header */}
        <div className="header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Track and manage your job applications</p>
          </div>
          <button className="add-button" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} />
            <span>Add Application</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <Briefcase size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Applications</p>
              <h3 className="stat-value">{stats.totalApplications}</h3>
              <p className="stat-change">
                <TrendingUp size={14} /> +3 this week
              </p>
            </div>
          </div>

          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Active Applications</p>
              <h3 className="stat-value">{stats.activeApplications}</h3>
              <p className="stat-change">In progress</p>
            </div>
          </div>

          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Interviews</p>
              <h3 className="stat-value">{stats.interviews}</h3>
              <p className="stat-change">2 upcoming</p>
            </div>
          </div>

          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Offers Received</p>
              <h3 className="stat-value">{stats.offers}</h3>
              <p className="stat-change">
                <TrendingUp size={14} /> Great job!
              </p>
            </div>
          </div>
        </div>

        {/* Recent Applications Section */}
        <div className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Recent Applications</h2>
              <p className="section-subtitle">Your latest job applications</p>
            </div>
            <button className="view-all-btn">View All →</button>
          </div>

          {/* Search and Filter */}
          <div className="filter-bar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search companies or positions..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <Filter size={18} />
              <select
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="wishlist">Wishlist</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Applications Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr className="table-header">
                  <th className="th">Company</th>
                  <th className="th">Position</th>
                  <th className="th">Location</th>
                  <th className="th">Salary</th>
                  <th className="th">Status</th>
                  <th className="th">Applied Date</th>
                  <th className="th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <tr key={app._id} className="application-row">
                      <td className="td">
                        <div className="company-cell">
                          <div className="company-logo">{app.logo || '🏢'}</div>
                          <span className="company-name">{app.company}</span>
                        </div>
                      </td>
                      <td className="td">{app.position}</td>
                      <td className="td">
                        <div className="location-cell">
                          <Building2 size={14} />
                          {app.location}
                        </div>
                      </td>
                      <td className="td">
                        <div className="salary-cell">
                          <DollarSign size={14} />
                          {app.salary || 'Not specified'}
                        </div>
                      </td>
                      <td className="td">
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor(app.status) + '20',
                            color: getStatusColor(app.status)
                          }}
                        >
                          {getStatusIcon(app.status)}
                          {app.status}
                        </span>
                      </td>
                      <td className="td">{formatDate(app.appliedDate)}</td>
                      <td className="td">
                        <ActionMenu
                          application={app}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="td empty-state">
                      <p>No applications found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;


