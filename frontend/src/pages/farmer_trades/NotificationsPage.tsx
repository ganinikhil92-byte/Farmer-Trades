import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Tag,
  TrendingUp,
  Package,
  ShieldCheck,
  ExternalLink,
  Clock
} from 'lucide-react';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  AppNotification
} from '../../utils/farmerTradesStore';
import './NotificationsPage.css';

export const NotificationsPage: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');
  const [refreshState, setRefreshState] = useState(0);

  const notifications = getNotifications();

  const displayedNotifs = notifications.filter((n) => {
    if (filterType === 'unread') return !n.read;
    return true;
  });

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    setRefreshState((prev) => prev + 1);
  };

  const handleMarkRead = (id: string) => {
    markNotificationAsRead(id);
    setRefreshState((prev) => prev + 1);
  };

  const renderIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'offer':
        return <Tag size={18} className="text-amber-600" />;
      case 'price_alert':
        return <TrendingUp size={18} className="text-emerald-600" />;
      case 'order':
        return <Package size={18} className="text-blue-600" />;
      default:
        return <ShieldCheck size={18} className="text-purple-600" />;
    }
  };

  return (
    <div className="ft-notifs-page">
      {/* Banner */}
      <div className="ft-notifs-banner">
        <div className="ft-notifs-banner-inner">
          <div className="ft-notifs-badge">
            <Bell size={14} /> ALERTS & ACTIVITY
          </div>
          <h1>Trade Notifications & Alerts</h1>
          <p>
            Stay updated on buyer purchase proposals, APMC price surges, order dispatches, and verification milestones.
          </p>
        </div>
      </div>

      <div className="ft-notifs-container">
        <div className="ft-notifs-card">
          {/* Header Controls */}
          <div className="ft-notifs-card-header">
            <div className="ft-notifs-pills">
              <button
                className={`ft-notif-filter-pill ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                All Alerts ({notifications.length})
              </button>
              <button
                className={`ft-notif-filter-pill ${filterType === 'unread' ? 'active' : ''}`}
                onClick={() => setFilterType('unread')}
              >
                Unread ({notifications.filter((n) => !n.read).length})
              </button>
            </div>

            <button className="ft-btn-mark-all" onClick={handleMarkAllRead}>
              <CheckCheck size={16} /> Mark All as Read
            </button>
          </div>

          {/* List */}
          <div className="ft-notifs-list">
            {displayedNotifs.length === 0 ? (
              <div className="ft-notifs-empty">
                <Bell size={40} className="text-gray-300 mb-2" />
                <h3>No {filterType === 'unread' ? 'unread ' : ''}notifications</h3>
                <p>You’re all caught up with your agricultural trades and price alerts.</p>
              </div>
            ) : (
              displayedNotifs.map((n) => (
                <div
                  key={n.id}
                  className={`ft-notif-item ${!n.read ? 'unread' : 'read'}`}
                  onClick={() => handleMarkRead(n.id)}
                >
                  <div className="ft-notif-icon-wrap">
                    {renderIcon(n.type)}
                  </div>

                  <div className="ft-notif-content">
                    <div className="ft-notif-title-row">
                      <h4>{n.title}</h4>
                      <span className="ft-notif-time">
                        <Clock size={12} className="inline mr-1" /> {n.timestamp}
                      </span>
                    </div>

                    <p className="ft-notif-msg">{n.message}</p>

                    {n.link && (
                      <Link to={n.link} className="ft-notif-link">
                        View Details <ExternalLink size={12} className="inline ml-1" />
                      </Link>
                    )}
                  </div>

                  {!n.read && <span className="ft-notif-unread-dot" title="Unread"></span>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
