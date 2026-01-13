import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Target, Award, XCircle, Clock, Download } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './Analytics.css';

function Analytics({ setCurrentPage }) {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('all'); // all, month, week

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/applications');
            setApplications(response.data.applications);
        } catch (error) {
            console.error('Error:', error);
            useDummyData();
        } finally {
            setLoading(false);
        }
    };

    const useDummyData = () => {
        setApplications([
            {
                _id: '1',
                company: 'Google',
                position: 'Senior Software Engineer',
                status: 'Interview',
                appliedDate: '2025-01-08',
                jobType: 'Full-time'
            },
            {
                _id: '2',
                company: 'Microsoft',
                position: 'Full Stack Developer',
                status: 'Applied',
                appliedDate: '2025-01-07',
                jobType: 'Full-time'
            },
            {
                _id: '3',
                company: 'Amazon',
                position: 'Frontend Engineer',
                status: 'Wishlist',
                appliedDate: '2025-01-06',
                jobType: 'Full-time'
            },
            {
                _id: '4',
                company: 'Meta',
                position: 'React Developer',
                status: 'Offer',
                appliedDate: '2025-01-05',
                jobType: 'Full-time'
            },
            {
                _id: '5',
                company: 'Apple',
                position: 'iOS Developer',
                status: 'Rejected',
                appliedDate: '2025-01-04',
                jobType: 'Full-time'
            },
            {
                _id: '6',
                company: 'Netflix',
                position: 'Backend Engineer',
                status: 'Applied',
                appliedDate: '2024-12-28',
                jobType: 'Full-time'
            },
            {
                _id: '7',
                company: 'Tesla',
                position: 'Software Engineer',
                status: 'Interview',
                appliedDate: '2024-12-25',
                jobType: 'Full-time'
            },
            {
                _id: '8',
                company: 'Uber',
                position: 'Full Stack Developer',
                status: 'Rejected',
                appliedDate: '2024-12-20',
                jobType: 'Contract'
            }
        ]);
    };

    // Filter by time range
    const filterByTimeRange = (apps) => {
        const now = new Date();
        const filtered = apps.filter(app => {
            const appDate = new Date(app.appliedDate);
            if (timeRange === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return appDate >= weekAgo;
            } else if (timeRange === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return appDate >= monthAgo;
            }
            return true;
        });
        return filtered;
    };

    const filteredApps = filterByTimeRange(applications);

    // Calculate statistics
    const stats = {
        total: filteredApps.length,
        applied: filteredApps.filter(a => a.status === 'Applied').length,
        interview: filteredApps.filter(a => a.status === 'Interview').length,
        offer: filteredApps.filter(a => a.status === 'Offer').length,
        rejected: filteredApps.filter(a => a.status === 'Rejected').length,
        wishlist: filteredApps.filter(a => a.status === 'Wishlist').length
    };

    // Calculate success rates
    const successRate = stats.total > 0
        ? ((stats.offer / stats.total) * 100).toFixed(1)
        : 0;

    const interviewRate = stats.total > 0
        ? (((stats.interview + stats.offer) / stats.total) * 100).toFixed(1)
        : 0;

    const rejectionRate = stats.total > 0
        ? ((stats.rejected / stats.total) * 100).toFixed(1)
        : 0;

    // Applications by month
    const getMonthlyData = () => {
        const monthlyMap = new Map();

        filteredApps.forEach(app => {
            const date = new Date(app.appliedDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

            if (!monthlyMap.has(monthKey)) {
                monthlyMap.set(monthKey, { month: monthName, count: 0 });
            }
            monthlyMap.get(monthKey).count += 1;
        });

        return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    };

    const monthlyData = getMonthlyData();
    const maxMonthlyCount = Math.max(...monthlyData.map(d => d.count), 1);

    // Top companies
    const getTopCompanies = () => {
        const companyMap = new Map();

        filteredApps.forEach(app => {
            if (!companyMap.has(app.company)) {
                companyMap.set(app.company, { name: app.company, count: 0 });
            }
            companyMap.get(app.company).count += 1;
        });

        return Array.from(companyMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    };

    const topCompanies = getTopCompanies();

    const handleExport = () => {
        const csvContent = [
            ['Company', 'Position', 'Status', 'Applied Date', 'Job Type'],
            ...filteredApps.map(app => [
                app.company,
                app.position,
                app.status,
                new Date(app.appliedDate).toLocaleDateString(),
                app.jobType || 'Full-time'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="analytics-page">
                <Navbar setCurrentPage={setCurrentPage} currentPage="analytics" />
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-page">
            <Navbar setCurrentPage={setCurrentPage} currentPage="analytics" />

            <div className="analytics-container">
                {/* Header */}
                <div className="analytics-header">
                    <div>
                        <h1 className="page-title">Analytics & Reports</h1>
                        <p className="page-subtitle">Insights into your job search journey</p>
                    </div>
                    <div className="header-actions">
                        <select
                            className="time-range-select"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option value="all">All Time</option>
                            <option value="month">Last 30 Days</option>
                            <option value="week">Last 7 Days</option>
                        </select>
                        <button className="export-btn" onClick={handleExport}>
                            <Download size={18} />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-icon" style={{ background: '#667eea15', color: '#667eea' }}>
                            <Target size={24} />
                        </div>
                        <div className="metric-content">
                            <p className="metric-label">Total Applications</p>
                            <h2 className="metric-value">{stats.total}</h2>
                            <p className="metric-trend positive">
                                <TrendingUp size={14} /> Active search
                            </p>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon" style={{ background: '#10b98115', color: '#10b981' }}>
                            <Award size={24} />
                        </div>
                        <div className="metric-content">
                            <p className="metric-label">Success Rate</p>
                            <h2 className="metric-value">{successRate}%</h2>
                            <p className="metric-trend">{stats.offer} offers received</p>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}>
                            <Calendar size={24} />
                        </div>
                        <div className="metric-content">
                            <p className="metric-label">Interview Rate</p>
                            <h2 className="metric-value">{interviewRate}%</h2>
                            <p className="metric-trend">{stats.interview} interviews</p>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon" style={{ background: '#ef444415', color: '#ef4444' }}>
                            <XCircle size={24} />
                        </div>
                        <div className="metric-content">
                            <p className="metric-label">Rejection Rate</p>
                            <h2 className="metric-value">{rejectionRate}%</h2>
                            <p className="metric-trend">{stats.rejected} rejections</p>
                        </div>
                    </div>
                </div>

                <div className="charts-row">
                    {/* Status Distribution */}
                    <div className="chart-card">
                        <h3 className="chart-title">Application Status Distribution</h3>
                        <div className="status-chart">
                            <div className="status-bar-item">
                                <div className="status-info">
                                    <span className="status-dot" style={{ background: '#8b5cf6' }}></span>
                                    <span className="status-name">Wishlist</span>
                                    <span className="status-count">{stats.wishlist}</span>
                                </div>
                                <div className="status-bar-container">
                                    <div
                                        className="status-bar"
                                        style={{
                                            width: `${(stats.wishlist / stats.total) * 100}%`,
                                            background: '#8b5cf6'
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="status-bar-item">
                                <div className="status-info">
                                    <span className="status-dot" style={{ background: '#f59e0b' }}></span>
                                    <span className="status-name">Applied</span>
                                    <span className="status-count">{stats.applied}</span>
                                </div>
                                <div className="status-bar-container">
                                    <div
                                        className="status-bar"
                                        style={{
                                            width: `${(stats.applied / stats.total) * 100}%`,
                                            background: '#f59e0b'
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="status-bar-item">
                                <div className="status-info">
                                    <span className="status-dot" style={{ background: '#3b82f6' }}></span>
                                    <span className="status-name">Interview</span>
                                    <span className="status-count">{stats.interview}</span>
                                </div>
                                <div className="status-bar-container">
                                    <div
                                        className="status-bar"
                                        style={{
                                            width: `${(stats.interview / stats.total) * 100}%`,
                                            background: '#3b82f6'
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="status-bar-item">
                                <div className="status-info">
                                    <span className="status-dot" style={{ background: '#10b981' }}></span>
                                    <span className="status-name">Offer</span>
                                    <span className="status-count">{stats.offer}</span>
                                </div>
                                <div className="status-bar-container">
                                    <div
                                        className="status-bar"
                                        style={{
                                            width: `${(stats.offer / stats.total) * 100}%`,
                                            background: '#10b981'
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="status-bar-item">
                                <div className="status-info">
                                    <span className="status-dot" style={{ background: '#ef4444' }}></span>
                                    <span className="status-name">Rejected</span>
                                    <span className="status-count">{stats.rejected}</span>
                                </div>
                                <div className="status-bar-container">
                                    <div
                                        className="status-bar"
                                        style={{
                                            width: `${(stats.rejected / stats.total) * 100}%`,
                                            background: '#ef4444'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Companies */}
                    <div className="chart-card">
                        <h3 className="chart-title">Top Companies Applied To</h3>
                        <div className="top-companies">
                            {topCompanies.map((company, index) => (
                                <div key={company.name} className="company-rank-item">
                                    <div className="rank-badge">#{index + 1}</div>
                                    <div className="company-rank-info">
                                        <span className="company-rank-name">{company.name}</span>
                                        <div className="company-rank-bar-container">
                                            <div
                                                className="company-rank-bar"
                                                style={{
                                                    width: `${(company.count / topCompanies[0].count) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className="company-rank-count">{company.count}</span>
                                </div>
                            ))}
                            {topCompanies.length === 0 && (
                                <p className="empty-chart">No data available</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Monthly Applications Chart */}
                <div className="chart-card full-width">
                    <h3 className="chart-title">Applications Over Time</h3>
                    <div className="monthly-chart">
                        {monthlyData.map((data) => (
                            <div key={data.month} className="month-bar">
                                <div
                                    className="bar"
                                    style={{
                                        height: `${(data.count / maxMonthlyCount) * 200}px`
                                    }}
                                >
                                    <span className="bar-value">{data.count}</span>
                                </div>
                                <span className="month-label">{data.month}</span>
                            </div>
                        ))}
                        {monthlyData.length === 0 && (
                            <p className="empty-chart">No data available for selected time range</p>
                        )}
                    </div>
                </div>

                {/* Insights */}
                <div className="insights-section">
                    <h3 className="insights-title">📊 Key Insights</h3>
                    <div className="insights-grid">
                        <div className="insight-card">
                            <Clock size={20} />
                            <p>You've applied to <strong>{stats.total} positions</strong> in total</p>
                        </div>
                        <div className="insight-card">
                            <TrendingUp size={20} />
                            <p>Your interview rate is <strong>{interviewRate}%</strong></p>
                        </div>
                        <div className="insight-card">
                            <Award size={20} />
                            <p>You have <strong>{stats.offer} job offer(s)</strong> 🎉</p>
                        </div>
                        <div className="insight-card">
                            <Target size={20} />
                            <p><strong>{stats.applied + stats.interview}</strong> applications are still active</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;