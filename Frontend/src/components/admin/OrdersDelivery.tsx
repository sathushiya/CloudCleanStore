import { useState } from 'react';
import { Search, Package, MapPin, Clock, User, CheckCircle, XCircle, AlertCircle, TrendingUp, RotateCcw } from 'lucide-react';
import { DeliveryTask, deliveryTasks as initialTasks, StaffMember, staffMembers, autoAssignDeliveryTask, handleTaskDecline } from '../../data/admin';

export default function OrdersDelivery() {
  const [tasks, setTasks] = useState<DeliveryTask[]>(initialTasks);
  const [staff] = useState<StaffMember[]>(staffMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | DeliveryTask['status']>('all');

  // Filter to show only completed and in_progress orders
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const isRelevantStatus = task.status === 'completed' || task.status === 'in_progress';
    return matchesSearch && matchesStatus && isRelevantStatus;
  });

  const handleMarkAsRead = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleAutoAssign = (task: DeliveryTask) => {
    const assigned = autoAssignDeliveryTask(task, staff);
    if (assigned) {
      setTasks(tasks.map((t) => t.id === task.id ? assigned : t));
    } else {
      alert('No available delivery staff at the moment');
    }
  };

  const handleManualAssign = (taskId: string, staffId: string) => {
    setTasks(tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: 'assigned',
            assignedTo: staffId,
            assignedAt: new Date().toISOString()
          }
        : t
    ));
  };

  const handleDecline = (task: DeliveryTask, staffId: string) => {
    const reassigned = handleTaskDecline(task, staffId, staff);
    if (reassigned) {
      setTasks(tasks.map((t) => t.id === task.id ? reassigned : t));
    } else {
      setTasks(tasks.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: 'pending',
              assignedTo: null,
              assignedAt: null,
              declinedBy: [...t.declinedBy, staffId]
            }
          : t
      ));
      alert('Task declined. No other staff available for auto-reassignment.');
    }
  };

  const handleComplete = (taskId: string) => {
    setTasks(tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: 'completed',
            completedAt: new Date().toISOString()
          }
        : t
    ));
  };

  const handleCancel = (taskId: string) => {
    if (confirm('Are you sure you want to cancel this delivery?')) {
      setTasks(tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: 'cancelled' }
          : t
      ));
    }
  };

  const getStatusColor = (status: DeliveryTask['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'assigned': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'declined': return 'bg-red-500/20 text-red-400 border-red-500/30';
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

  const getStaffName = (staffId: string | null) => {
    if (!staffId) return 'Unassigned';
    const staffMember = staff.find((s) => s.id === staffId);
    return staffMember?.name || 'Unknown';
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress' || t.status === 'assigned').length,
    completed: tasks.filter((t) => t.status === 'completed').length
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          Orders & Delivery Management
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-effect p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-400">Total Orders</div>
            </div>
            <Package className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="glass-effect p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
              <div className="text-sm text-gray-400">Pending</div>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="glass-effect p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-400">{stats.inProgress}</div>
              <div className="text-sm text-gray-400">In Progress</div>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="glass-effect p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
              <div className="text-sm text-gray-400">Completed</div>
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
            placeholder="Search by order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="glass-effect p-6 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{task.orderId}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(task.status)}`}>
                        {task.status === 'in_progress' ? 'In Progress' : 'Completed'}
                      </span>
                      {task.deliveryTime === 'express' && (
                        <span className="px-2 py-0.5 rounded-full text-xs border bg-orange-500/20 text-orange-400 border-orange-500/30">
                          Express
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {task.customerName}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {task.address}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Est. delivery: {task.estimatedTime}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-400">${task.total.toFixed(2)}</div>
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Products:</div>
                  <div className="space-y-1">
                    {task.products.map((product, idx) => (
                      <div key={idx} className="text-sm text-gray-400">
                        {product.name} × {product.quantity}
                      </div>
                    ))}
                  </div>
                </div>

                {task.assignedTo && (
                  <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-lg">
                    <div className="text-sm font-semibold text-purple-400 mb-1">Assigned to:</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">{getStaffName(task.assignedTo)}</div>
                    {task.assignedAt && (
                      <div className="text-xs text-gray-400 mt-1">
                        Assigned at: {new Date(task.assignedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}

                {task.declinedBy.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                    <div className="text-sm font-semibold text-red-400 mb-1">Declined by:</div>
                    <div className="text-sm text-gray-400">
                      {task.declinedBy.map((id) => getStaffName(id)).join(', ')}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:w-64 space-y-3">
                {task.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAutoAssign(task)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-[var(--glow-purple-strong)] transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Auto-Assign
                    </button>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleManualAssign(task.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                    >
                      <option value="">Manual Assign...</option>
                      {staff
                        .filter((s) => s.role === 'delivery' && s.status === 'active' && !task.declinedBy.includes(s.id))
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </>
                )}

                {task.status === 'assigned' && task.assignedTo && (
                  <>
                    <button
                      onClick={() => handleDecline(task, task.assignedTo!)}
                      className="w-full px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Decline Task
                    </button>
                    <button
                      onClick={() => setTasks(tasks.map((t) => t.id === task.id ? { ...t, status: 'in_progress' } : t))}
                      className="w-full px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Start Delivery
                    </button>
                  </>
                )}


                {(task.status === 'pending' || task.status === 'assigned') && (
                  <button
                    onClick={() => handleCancel(task.id)}
                    className="w-full px-4 py-2 bg-white/5 text-gray-400 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-sm"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No orders found</p>
        </div>
      )}
    </div>
  );
}
