

import React, { useState } from 'react';
import { Briefcase, LayoutDashboard, Trello, Building2, BarChart3, Calendar, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationsCenter from './NotificationsCenter';
import './Navbar.css';

function Navbar({ setCurrentPage, currentPage }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban', label: 'Kanban', icon: Trello },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => handleNavClick('dashboard')}>
          <div className="navbar-brand-icon">
            <Briefcase size={20} />
          </div>
          <span className="navbar-brand-text">JobTracker</span>
        </div>

        <div className="navbar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="navbar-right">
          <NotificationsCenter />

          <button
            className="nav-icon-btn"
            onClick={() => handleNavClick('settings')}
          >
            <Settings size={20} />
          </button>

          <div className="navbar-user">
            <div className="navbar-avatar">{getInitials(user?.name || user?.email)}</div>
            <span className="navbar-username">{user?.name || user?.email?.split('@')[0] || 'User'}</span>
          </div>

          <button
            className="btn-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>

          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`mobile-nav-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            className="mobile-nav-link"
            onClick={() => handleNavClick('settings')}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button
            className="mobile-nav-link logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
