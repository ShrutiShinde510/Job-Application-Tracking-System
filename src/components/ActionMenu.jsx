import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import './ActionMenu.css';

function ActionMenu({ application, onEdit, onDelete, onView }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = (action) => {
        setIsOpen(false);
        action();
    };

    return (
        <div className="action-menu" ref={menuRef}>
            <button
                className="action-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && (
                <div className="action-dropdown">
                    <button
                        className="action-item"
                        onClick={() => handleAction(() => onView(application))}
                    >
                        <Eye size={16} />
                        <span>View Details</span>
                    </button>
                    <button
                        className="action-item"
                        onClick={() => handleAction(() => onEdit(application))}
                    >
                        <Edit size={16} />
                        <span>Edit</span>
                    </button>
                    <button
                        className="action-item delete"
                        onClick={() => handleAction(() => onDelete(application))}
                    >
                        <Trash2 size={16} />
                        <span>Delete</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default ActionMenu;