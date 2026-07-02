import { useState } from 'react';
import { Bell, Search, CheckCircle, Package, Users, AlertCircle, Settings, Trash2, Check } from 'lucide-react';
import { Notification, notifications as initialNotifications } from '../../data/admin';

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | Notification['type']>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || notif.type === selectedType;
    const matchesPriority = selectedPriority === 'all' || notif.priority === selectedPriority;
    const matchesRead = !showUnreadOnly || !notif.read;
    return matchesSearch && matchesType && matchesPriority && matchesRead;
  });

  const handleMarkAsRead = (id: string) => {
    // Remove the notification immediately when marked as read
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    // Remove all unread notifications immediately
    setNotifications(notifications.filter((n) => n.read));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order': return <Package className="w-5 h-5" />;
      case 'staff': return <Users className="w-5 h-5" />;
      case 'product': return <Package className="w-5 h-5" />;
      case 'system': return <Settings className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'order': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'staff': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'product': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'system': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Notifications Center
          </h2>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark All Read
            </button>
          )}
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-effect p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{notifications.length}</div>
              <div className="text-sm text-gray-400">Total</div>
            </div>
            <Bell className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="glass-effect p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-400">{unreadCount}</div>
              <div className="text-sm text-gray-400">Unread</div>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="glass-effect p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-400">
                {notifications.filter((n) => n.priority === 'high').length}
              </div>
              <div className="text-sm text-gray-400">High Priority</div>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="glass-effect p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {notifications.filter((n) => n.read).length}
              </div>
              <div className="text-sm text-gray-400">Read</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as any)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="all">All Types</option>
          <option value="order">Orders</option>
          <option value="staff">Staff</option>
          <option value="product">Products</option>
          <option value="system">System</option>
        </select>
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value as any)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <label className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
            className="w-4 h-4 accent-purple-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Unread Only</span>
        </label>
      </div>

      <div className="space-y-3">
        {filteredNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`glass-effect p-4 rounded-xl border transition-all ${
              notif.read
                ? 'border-white/10 opacity-60'
                : 'border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg border ${getTypeColor(notif.type)}`}>
                {getTypeIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{notif.title}</h3>
                      {!notif.read && (
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{notif.message}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${getPriorityColor(notif.priority)}`}>
                      {notif.priority}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${getTypeColor(notif.type)}`}>
                      {notif.type}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{formatTimestamp(notif.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-all text-xs flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No notifications found</p>
        </div>
      )}
    </div>
  );
}
