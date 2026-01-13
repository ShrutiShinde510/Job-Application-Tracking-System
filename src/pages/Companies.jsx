import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, MapPin, Briefcase, TrendingUp, Edit, Trash2, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './Companies.css';

function Companies({ setCurrentPage }) {
    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        website: '',
        location: '',
        industry: '',
        size: '',
        notes: ''
    });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const response = await api.get('/applications');
            const uniqueCompanies = extractCompanies(response.data.applications);
            setCompanies(uniqueCompanies);
        } catch (error) {
            console.error('Error:', error);
            useDummyData();
        } finally {
            setLoading(false);
        }
    };

    const extractCompanies = (applications) => {
        const companyMap = new Map();

        applications.forEach(app => {
            if (!companyMap.has(app.company)) {
                companyMap.set(app.company, {
                    id: app.company.toLowerCase().replace(/\s+/g, '-'),
                    name: app.company,
                    logo: app.logo || '🏢',
                    location: app.location || 'Location not specified',
                    totalApplications: 1,
                    activeApplications: app.status === 'Applied' || app.status === 'Interview' ? 1 : 0,
                    offers: app.status === 'Offer' ? 1 : 0
                });
            } else {
                const company = companyMap.get(app.company);
                company.totalApplications += 1;
                if (app.status === 'Applied' || app.status === 'Interview') {
                    company.activeApplications += 1;
                }
                if (app.status === 'Offer') {
                    company.offers += 1;
                }
            }
        });

        return Array.from(companyMap.values());
    };

    const useDummyData = () => {
        setCompanies([
            {
                id: 'google',
                name: 'Google',
                logo: '🔍',
                location: 'Mountain View, CA',
                industry: 'Technology',
                size: '100,000+ employees',
                totalApplications: 3,
                activeApplications: 2,
                offers: 1,
                website: 'https://careers.google.com'
            },
            {
                id: 'microsoft',
                name: 'Microsoft',
                logo: '💻',
                location: 'Redmond, WA',
                industry: 'Technology',
                size: '50,000+ employees',
                totalApplications: 2,
                activeApplications: 1,
                offers: 0,
                website: 'https://careers.microsoft.com'
            },
            {
                id: 'amazon',
                name: 'Amazon',
                logo: '📦',
                location: 'Seattle, WA',
                industry: 'E-commerce',
                size: '1,000,000+ employees',
                totalApplications: 4,
                activeApplications: 3,
                offers: 0,
                website: 'https://amazon.jobs'
            },
            {
                id: 'meta',
                name: 'Meta',
                logo: '👍',
                location: 'Menlo Park, CA',
                industry: 'Social Media',
                size: '50,000+ employees',
                totalApplications: 1,
                activeApplications: 0,
                offers: 1,
                website: 'https://metacareers.com'
            },
            {
                id: 'apple',
                name: 'Apple',
                logo: '🍎',
                location: 'Cupertino, CA',
                industry: 'Technology',
                size: '100,000+ employees',
                totalApplications: 2,
                activeApplications: 1,
                offers: 0,
                website: 'https://jobs.apple.com'
            }
        ]);
    };

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        totalCompanies: companies.length,
        totalApplications: companies.reduce((sum, c) => sum + c.totalApplications, 0),
        activeCompanies: companies.filter(c => c.activeApplications > 0).length,
        totalOffers: companies.reduce((sum, c) => sum + c.offers, 0)
    };

    if (loading) {
        return (
            <div className="companies-page">
                <Navbar setCurrentPage={setCurrentPage} currentPage="companies" />
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading companies...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="companies-page">
            <Navbar setCurrentPage={setCurrentPage} currentPage="companies" />

            <div className="companies-container">
                {/* Header */}
                <div className="companies-header">
                    <div>
                        <h1 className="page-title">Companies</h1>
                        <p className="page-subtitle">Track companies you've applied to</p>
                    </div>
                    <div className="header-actions">
                        <div className="search-box-companies">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search companies..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="companies-stats">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#667eea15', color: '#667eea' }}>
                            <Building2 size={24} />
                        </div>
                        <div>
                            <p className="stat-label">Total Companies</p>
                            <h3 className="stat-value">{stats.totalCompanies}</h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <p className="stat-label">Total Applications</p>
                            <h3 className="stat-value">{stats.totalApplications}</h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="stat-label">Active Companies</p>
                            <h3 className="stat-value">{stats.activeCompanies}</h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#10b98115', color: '#10b981' }}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="stat-label">Total Offers</p>
                            <h3 className="stat-value">{stats.totalOffers}</h3>
                        </div>
                    </div>
                </div>

                {/* Companies Grid */}
                <div className="companies-grid">
                    {filteredCompanies.map((company) => (
                        <div key={company.id} className="company-card">
                            <div className="company-card-header">
                                <div className="company-logo-large">{company.logo}</div>
                                {company.website && (
                                    <a
                                        href={company.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="company-link"
                                    >
                                        <ExternalLink size={18} />
                                    </a>
                                )}
                            </div>

                            <h3 className="company-name">{company.name}</h3>

                            <div className="company-info">
                                {company.location && (
                                    <div className="info-item">
                                        <MapPin size={14} />
                                        <span>{company.location}</span>
                                    </div>
                                )}
                                {company.industry && (
                                    <div className="info-item">
                                        <Building2 size={14} />
                                        <span>{company.industry}</span>
                                    </div>
                                )}
                            </div>

                            <div className="company-metrics">
                                <div className="metric">
                                    <span className="metric-value">{company.totalApplications}</span>
                                    <span className="metric-label">Applications</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-value">{company.activeApplications}</span>
                                    <span className="metric-label">Active</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-value">{company.offers}</span>
                                    <span className="metric-label">Offers</span>
                                </div>
                            </div>

                            <button
                                className="view-applications-btn"
                                onClick={() => setCurrentPage('dashboard')}
                            >
                                View Applications
                            </button>
                        </div>
                    ))}
                </div>

                {filteredCompanies.length === 0 && (
                    <div className="empty-state">
                        <Building2 size={64} style={{ color: '#cbd5e0' }} />
                        <h3>No companies found</h3>
                        <p>Start adding job applications to see companies here</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Companies;