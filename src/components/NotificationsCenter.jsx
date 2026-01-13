import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Clock, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import './NotificationsCenter.css';

function NotificationsCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();

        // Refresh when opened
        if (isOpen) {
            fetchNotifications();
        }

        // Polling for new notifications every 30 seconds
        const pollInterval = setInterval(fetchNotifications, 30000);

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            clearInterval(pollInterval);
        };
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');

            if (response.data.success) {
                setNotifications(response.data.notifications);
                setUnreadCount(response.data.notifications.filter(n => !n.read).length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Don't use dummy data anymore, let it show empty if truly empty
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);

            // Update locally
            setNotifications(notifications.map(n =>
                n._id === notificationId ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');

            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await api.delete(`/notifications/${notificationId}`);

            const notification = notifications.find(n => n._id === notificationId);
            setNotifications(notifications.filter(n => n._id !== notificationId));
            if (!notification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'interview':
                return <Calendar size={18} />;
            case 'followup':
                return <Clock size={18} />;
            case 'status':
                return <AlertCircle size={18} />;
            case 'offer':
                return <CheckCircle size={18} />;
            case 'deadline':
                return <AlertCircle size={18} />;
            default:
                return <Bell size={18} />;
        }
    };

    const getNotificationColor = (type, priority) => {
        if (priority === 'high') return '#ef4444';
        if (type === 'offer') return '#10b981';
        if (type === 'interview') return '#3b82f6';
        return '#f59e0b';
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="notifications-center" ref={dropdownRef}>
            <button
                className="notifications-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notifications-dropdown">
                    <div className="notifications-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                className="mark-all-read"
                                onClick={markAllAsRead}
                            >
                                <Check size={14} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notifications-list">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                    onClick={() => !notification.read && markAsRead(notification._id)}
                                >
                                    <div
                                        className="notification-icon"
                                        style={{ color: getNotificationColor(notification.type, notification.priority) }}
                                    >
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    <div className="notification-content">
                                        <div className="notification-title">{notification.title}</div>
                                        <div className="notification-message">{notification.message}</div>
                                        <div className="notification-time">{formatTime(notification.createdAt)}</div>
                                    </div>

                                    <button
                                        className="notification-delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification._id);
                                        }}
                                    >
                                        <X size={16} />
                                    </button>

                                    {!notification.read && (
                                        <div className="unread-indicator"></div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="empty-notifications">
                                <Bell size={48} style={{ color: '#cbd5e0' }} />
                                <p>No notifications yet</p>
                                <span>We'll notify you when something happens</span>
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="notifications-footer">
                            <button className="view-all-btn">View All Notifications</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationsCenter;