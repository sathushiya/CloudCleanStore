import { useState, useEffect } from "react";
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  MapPin,
  User,
  LogOut,
  Menu,
  X,
  AlertCircle,
  Edit,
  Camera,
  Navigation,
  Map,
  Phone,
  Mail,
  Save,
  Settings,
  Bell,
  Volume2,
  Eye,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  DeliveryTask,
  deliveryTasks as initialTasks,
  staffMembers as initialStaffMembers,
  StaffMember,
  autoAssignDeliveryTask,
} from "../data/admin";
import OrderNotificationPopup from "../components/OrderNotificationPopup";

interface StaffDashboardProps {
  onLogout: () => void;
}

type StaffSettings = {
  notifications: boolean;
  autoAcceptTasks: boolean;
  soundAlerts: boolean;
  showCompleted: boolean;
  darkMode: boolean;
};

export default function StaffDashboard({ onLogout }: StaffDashboardProps) {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<DeliveryTask[]>(initialTasks);
  const [staffMembers, setStaffMembers] =
    useState<StaffMember[]>(initialStaffMembers);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [mapViewTask, setMapViewTask] = useState<DeliveryTask | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showOrderNotification, setShowOrderNotification] = useState(false);

  // Settings toggles
  const [settings, setSettings] = useState({
    notifications: true,
    autoAcceptTasks: false,
    soundAlerts: true,
    showCompleted: true,
    darkMode: false,
  });

  const currentStaff = staffMembers.find((s) => s.email === user?.email);

  // Sync availability state with staff status
  useEffect(() => {
    if (currentStaff) {
      setIsAvailable(currentStaff.status === "active");
    }
  }, [currentStaff?.status]);

  // Poll localStorage for new tasks created after payment confirmation
  useEffect(() => {
    const poll = setInterval(() => {
      const newTasks: DeliveryTask[] = JSON.parse(
        localStorage.getItem("newDeliveryTasks") || "[]",
      );
      if (newTasks.length > 0) {
        setTasks((prev) => {
          const existingIds = new Set(prev.map((t) => t.id));
          const toAdd = newTasks.filter((t) => !existingIds.has(t.id));
          return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
        });
        localStorage.removeItem("newDeliveryTasks");
      }
    }, 2000);
    return () => clearInterval(poll);
  }, []);

  // Auto-accept tasks if setting is enabled
  useEffect(() => {
    if (settings.autoAcceptTasks && currentStaff) {
      const newlyAssignedTasks = tasks.filter(
        (t) => t.status === "assigned" && t.assignedTo === currentStaff.id,
      );

      if (newlyAssignedTasks.length > 0) {
        setTasks(
          tasks.map((t) =>
            newlyAssignedTasks.some((nat) => nat.id === t.id)
              ? { ...t, status: "in_progress" }
              : t,
          ),
        );
      }
    }
  }, [tasks, settings.autoAcceptTasks, currentStaff]);

  // Show notification for new pending orders (only if available)
  useEffect(() => {
    // Only show notifications to available staff
    if (settings.notifications && isAvailable) {
      const pendingOrders = tasks.filter(
        (t) => t.status === "pending" && !t.assignedTo,
      );
      if (pendingOrders.length > 0 && !showOrderNotification) {
        // Show notification with a slight delay to avoid instant pop-up
        const timer = setTimeout(() => {
          setShowOrderNotification(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    } else {
      // If staff goes unavailable, dismiss any open notifications
      if (showOrderNotification) {
        setShowOrderNotification(false);
      }
    }
  }, [tasks, settings.notifications, isAvailable]);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  // Get pending orders that are completely unassigned
  const pendingOrders = tasks.filter(
    (t) => t.status === "pending" && !t.assignedTo,
  );

  // Filter tasks based on user role
  const myTasks =
    user?.role === "staff"
      ? tasks.filter((t) => t.assignedTo === currentStaff?.id)
      : tasks;

  const assignedToMe = myTasks.filter(
    (t) =>
      t.status === "assigned" &&
      t.assignedTo === currentStaff?.id &&
      (!currentStaff || !t.declinedBy.includes(currentStaff.id)), // Exclude declined tasks
  );
  const inProgress = myTasks.filter(
    (t) => t.status === "in_progress" && t.assignedTo === currentStaff?.id,
  );
  const completed = myTasks.filter(
    (t) => t.status === "completed" && t.assignedTo === currentStaff?.id,
  );
  const tasksAwaiting = tasks.filter(
    (t) =>
      t.status === "pending" &&
      currentStaff &&
      t.declinedBy.includes(currentStaff.id),
  );

  const handleAvailabilityToggle = () => {
    if (!currentStaff) return;

    // Check if going from available to unavailable
    const goingOffline = isAvailable;

    // If going unavailable, confirm with user
    if (goingOffline && currentStaff.role === "staff") {
      const myActiveTasks = tasks.filter(
        (t) =>
          t.assignedTo === currentStaff.id &&
          (t.status === "assigned" || t.status === "in_progress"),
      );

      if (myActiveTasks.length > 0) {
        if (
          !confirm(
            `You have ${myActiveTasks.length} active task(s). Going offline will auto-reassign them to other staff. Continue?`,
          )
        ) {
          return;
        }
      }
    }

    // Toggle availability
    const newStatus = isAvailable ? "inactive" : "active";
    const newAvailability = !isAvailable;

    setIsAvailable(newAvailability);

    // Update staff status
    setStaffMembers(
      staffMembers.map((s) =>
        s.id === currentStaff.id ? { ...s, status: newStatus } : s,
      ),
    );

    // If going unavailable, reassign all assigned tasks
    if (goingOffline && currentStaff.role === "staff") {
      const myAssignedTasks = tasks.filter(
        (t) =>
          t.assignedTo === currentStaff.id &&
          (t.status === "assigned" || t.status === "in_progress"),
      );

      if (myAssignedTasks.length > 0) {
        let updatedTasks = [...tasks];

        myAssignedTasks.forEach((task) => {
          const reassigned = autoAssignDeliveryTask(
            {
              ...task,
              status: "pending",
              assignedTo: null,
              assignedAt: null,
              declinedBy: [...task.declinedBy, currentStaff.id],
            },
            staffMembers.filter(
              (s) => s.id !== currentStaff.id && s.status === "active",
            ),
          );

          if (reassigned) {
            updatedTasks = updatedTasks.map((t) =>
              t.id === task.id ? reassigned : t,
            );
          } else {
            updatedTasks = updatedTasks.map((t) =>
              t.id === task.id
                ? {
                    ...t,
                    status: "pending",
                    assignedTo: null,
                    assignedAt: null,
                  }
                : t,
            );
          }
        });

        setTasks(updatedTasks);
      }
    }
  };

  const handleAcceptTask = (taskId: string) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, status: "in_progress" } : t)),
    );
  };

  // Handle claiming order from notification popup
  const handleClaimOrder = (taskId: string) => {
    if (!currentStaff) return;

    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "assigned" as const,
              assignedTo: currentStaff.id,
              assignedAt: new Date().toISOString(),
            }
          : t,
      ),
    );

    setShowOrderNotification(false);
  };

  // Handle re-accepting a previously declined task
  const handleReAcceptTask = (taskId: string) => {
    if (!currentStaff) return;

    if (
      confirm(
        "You previously declined this task. Are you sure you want to accept it now?",
      )
    ) {
      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "assigned" as const,
                assignedTo: currentStaff.id,
                assignedAt: new Date().toISOString(),
                declinedBy: t.declinedBy.filter((id) => id !== currentStaff.id), // Remove from declined list
              }
            : t,
        ),
      );
    }
  };

  const handleDeclineTask = (taskId: string) => {
    if (
      currentStaff &&
      confirm("Are you sure you want to decline this task?")
    ) {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const reassigned = autoAssignDeliveryTask(
        {
          ...task,
          status: "pending",
          assignedTo: null,
          assignedAt: null,
          declinedBy: [...task.declinedBy, currentStaff.id],
        },
        staffMembers.filter((s) => s.id !== currentStaff.id),
      );

      if (reassigned) {
        setTasks(tasks.map((t) => (t.id === taskId ? reassigned : t)));
      } else {
        setTasks(
          tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: "pending",
                  assignedTo: null,
                  assignedAt: null,
                  declinedBy: [...t.declinedBy, currentStaff.id],
                }
              : t,
          ),
        );
      }
    }
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: "completed", completedAt: new Date().toISOString() }
          : t,
      ),
    );

    // Update staff performance
    if (currentStaff) {
      setStaffMembers(
        staffMembers.map((s) =>
          s.id === currentStaff.id
            ? {
                ...s,
                performance: {
                  ...s.performance,
                  tasksCompleted: s.performance.tasksCompleted + 1,
                  points: s.performance.points + 10,
                  currentMonth: {
                    tasks: s.performance.currentMonth.tasks + 1,
                    earnings: s.performance.currentMonth.earnings + 50,
                  },
                },
              }
            : s,
        ),
      );
    }
  };

  const handleStartNavigation = (task: DeliveryTask) => {
    // Open map view with GPS navigation
    setMapViewTask(task);
  };

  const getStatusColor = (status: DeliveryTask["status"]) => {
    switch (status) {
      case "assigned":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "in_progress":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0a1e]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#1a1425] border-b border-gray-200 dark:border-purple-700/20 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Staff Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      <div className="flex pt-16 lg:pt-0">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white dark:bg-[#1a1425] border-r border-gray-200 dark:border-purple-700/20 transform transition-transform duration-300 overflow-y-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Profile Header */}
            <div className="p-6 border-b border-gray-200 dark:border-purple-700/20">
              {/* Settings and Logout at Top */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {currentStaff?.avatar ||
                      user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={() => setEditProfileOpen(true)}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-lg">{user?.name}</h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {user?.role}
                  </p>
                  <button
                    onClick={() => setEditProfileOpen(true)}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-1"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Availability Toggle */}
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Toggle clicked, current state:", isAvailable);
                  handleAvailabilityToggle();
                }}
                className={`rounded-xl p-4 border-2 transition-all cursor-pointer hover:shadow-lg select-none active:scale-95 ${
                  isAvailable
                    ? "bg-green-50 dark:bg-green-900/20 border-green-500/30 hover:border-green-500/50"
                    : "bg-gray-50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-700 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center justify-between mb-3 pointer-events-none">
                  <span className="text-sm font-semibold">
                    Availability Status
                  </span>
                  <div
                    className={`relative w-14 h-7 rounded-full transition-all shadow-lg ${
                      isAvailable ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform shadow-md ${
                        isAvailable ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pointer-events-none">
                  <div
                    className={`w-2 h-2 rounded-full ${isAvailable ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
                  ></div>
                  <p
                    className={`text-xs font-bold ${isAvailable ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}`}
                  >
                    {isAvailable
                      ? "ONLINE - Ready for Tasks"
                      : "OFFLINE - Unavailable"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="p-6 border-b border-gray-200 dark:border-purple-700/20">
              <h3 className="font-semibold mb-4">Quick Navigation</h3>
              <div className="space-y-2">
                {/* Tasks Assigned to You */}
                <button
                  onClick={() => {
                    document
                      .getElementById("assigned-tasks-section")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium">Assigned to You</span>
                  </div>
                  {assignedToMe.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                        {assignedToMe.length}
                      </span>
                      <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-bounce" />
                    </div>
                  )}
                </button>

                {/* In Progress */}
                <button
                  onClick={() => {
                    document
                      .getElementById("in-progress-section")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-medium">In Progress</span>
                  </div>
                  {inProgress.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                        {inProgress.length}
                      </span>
                      <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-bounce" />
                    </div>
                  )}
                </button>

                {/* Tasks Awaiting */}
                <button
                  onClick={() => {
                    document
                      .getElementById("awaiting-tasks-section")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="text-sm font-medium">Tasks Awaiting</span>
                  </div>
                  {tasksAwaiting.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                        {tasksAwaiting.length}
                      </span>
                      <Bell className="w-4 h-4 text-yellow-600 dark:text-yellow-400 animate-bounce" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Logout */}
            <div className="mt-auto p-4 border-t border-gray-200 dark:border-purple-700/20">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.name?.split(" ")[0]}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {user?.role === "staff"
                    ? "Manage your staff tasks"
                    : "View system tasks and orders"}
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-purple-700/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {assignedToMe.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Assigned to You
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-purple-700/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {inProgress.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  In Progress
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-purple-700/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {completed.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completed Today
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-purple-700/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {currentStaff
                    ? currentStaff.performance.currentMonth.tasks
                    : 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Tasks This Month
                </div>
              </div>
            </div>

            {/* Assigned Tasks */}
            {assignedToMe.length > 0 && (
              <div id="assigned-tasks-section">
                <h2 className="text-2xl font-bold mb-4">
                  Tasks Assigned to You
                </h2>
                <div className="space-y-4">
                  {assignedToMe.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-purple-700/20"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">
                                  {task.orderId}
                                </h3>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(task.status)}`}
                                >
                                  {task.status}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs border ${getPriorityColor(task.priority)}`}
                                >
                                  {task.priority}
                                </span>
                                {task.deliveryTime === "express" && (
                                  <span className="px-2 py-0.5 rounded-full text-xs border bg-orange-500/20 text-orange-400 border-orange-500/30">
                                    Express
                                  </span>
                                )}
                                {task.manuallyAssignedBySupervisor && (
                                  <span className="px-2 py-0.5 rounded-full text-xs border bg-red-500/20 text-red-400 border-red-500/30 font-semibold">
                                    Assigned by Supervisor
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  {task.customerName}
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {task.customerAddress}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  Est. delivery: {task.estimatedTime}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                LKR {task.total.toFixed(2)}
                              </div>
                            </div>
                          </div>

                          {/* Delivery Routing Logic */}
                          {task.customerDistrict === task.shopDistrict ? (
                            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <div className="font-bold text-green-700 dark:text-green-300">
                                  In-District Delivery
                                </div>
                              </div>
                              <div className="text-sm text-green-700 dark:text-green-300">
                                <strong>Instruction:</strong> Perform
                                Door-to-Door Delivery
                              </div>
                            </div>
                          ) : (
                            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                <div className="font-bold text-orange-700 dark:text-orange-300">
                                  Out-of-District Delivery
                                </div>
                              </div>
                              <div className="text-sm text-orange-700 dark:text-orange-300">
                                <strong>Instruction:</strong> Hand over to
                                Nearest Courier Service
                              </div>
                              <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                Customer District: {task.customerDistrict}
                              </div>
                            </div>
                          )}

                          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                            <div className="text-sm font-semibold mb-2">
                              Products:
                            </div>
                            <div className="space-y-1">
                              {task.products.map((product, idx) => (
                                <div
                                  key={idx}
                                  className="text-sm text-gray-600 dark:text-gray-400"
                                >
                                  {product.name} × {product.quantity}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="lg:w-64 space-y-3">
                          <button
                            onClick={() => handleAcceptTask(task.id)}
                            className="w-full px-4 py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-(--glow-purple-strong) transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Accept & Start
                          </button>
                          <button
                            onClick={() => handleStartNavigation(task)}
                            className="w-full px-4 py-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2"
                          >
                            <Map className="w-5 h-5" />
                            View Map
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* In Progress Tasks */}
            {inProgress.length > 0 && (
              <div id="in-progress-section">
                <h2 className="text-2xl font-bold mb-4">In Progress</h2>
                <div className="space-y-4">
                  {inProgress.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-purple-500/30"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">
                                  {task.orderId}
                                </h3>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(task.status)}`}
                                >
                                  {task.status}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  {task.customerName}
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {task.customerAddress}
                                </div>
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              LKR {task.total.toFixed(2)}
                            </div>
                          </div>

                          {/* Delivery Routing Logic */}
                          {task.customerDistrict === task.shopDistrict ? (
                            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <div className="font-bold text-green-700 dark:text-green-300">
                                  In-District Delivery
                                </div>
                              </div>
                              <div className="text-sm text-green-700 dark:text-green-300">
                                <strong>Instruction:</strong> Perform
                                Door-to-Door Delivery
                              </div>
                            </div>
                          ) : (
                            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                <div className="font-bold text-orange-700 dark:text-orange-300">
                                  Out-of-District Delivery
                                </div>
                              </div>
                              <div className="text-sm text-orange-700 dark:text-orange-300">
                                <strong>Instruction:</strong> Hand over to
                                Nearest Courier Service
                              </div>
                              <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                Customer District: {task.customerDistrict}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="lg:w-64 space-y-3">
                          <button
                            onClick={() => handleStartNavigation(task)}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                          >
                            <Navigation className="w-5 h-5" />
                            Start GPS Navigation
                          </button>
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className="w-full px-4 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Mark as Completed
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks Awaiting */}
            <div id="awaiting-tasks-section">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                Tasks Awaiting
                {tasksAwaiting.length > 0 && (
                  <span className="px-3 py-1 rounded-full text-sm bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    {tasksAwaiting.length}{" "}
                    {tasksAwaiting.length === 1 ? "task" : "tasks"}
                  </span>
                )}
              </h2>

              {tasksAwaiting.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    These are tasks you previously declined. They will disappear
                    once another staff member accepts them.
                  </p>
                  <div className="space-y-4">
                    {tasksAwaiting.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-yellow-500/30"
                      >
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold">
                                    {task.orderId}
                                  </h3>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(task.status)}`}
                                  >
                                    awaiting acceptance
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs border ${getPriorityColor(task.priority)}`}
                                  >
                                    {task.priority}
                                  </span>
                                  {task.deliveryTime === "express" && (
                                    <span className="px-2 py-0.5 rounded-full text-xs border bg-orange-500/20 text-orange-400 border-orange-500/30">
                                      Express
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {task.customerName}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {task.customerAddress}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Est. delivery: {task.estimatedTime}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                  LKR {task.total.toFixed(2)}
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                              <div className="text-sm font-semibold mb-2">
                                Products:
                              </div>
                              <div className="space-y-1">
                                {task.products.map((product, idx) => (
                                  <div
                                    key={idx}
                                    className="text-sm text-gray-600 dark:text-gray-400"
                                  >
                                    {product.name} × {product.quantity}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500/30 p-3 rounded-lg">
                              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                <strong>Status:</strong> Waiting for another
                                staff member to accept this task.
                              </div>
                            </div>
                          </div>

                          <div className="lg:w-64 space-y-3">
                            <button
                              onClick={() => handleReAcceptTask(task.id)}
                              className="w-full px-4 py-3 bg-linear-to-r from-green-600 to-green-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 hover:scale-105"
                              style={{
                                boxShadow: "0 0 20px rgba(22, 163, 74, 0.3)",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.boxShadow =
                                  "0 0 40px rgba(22, 163, 74, 0.6)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.boxShadow =
                                  "0 0 20px rgba(22, 163, 74, 0.3)")
                              }
                            >
                              <CheckCircle className="w-5 h-5" />
                              Accept Anyway
                            </button>
                            <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                              Changed your mind? You can still accept this task.
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-white dark:bg-white/5 rounded-2xl p-12 border border-gray-200 dark:border-purple-700/20 text-center">
                  <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No Awaiting Tasks</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    You haven't declined any tasks recently. Dismissed tasks
                    will appear here until they're accepted by other staff
                    members.
                  </p>
                </div>
              )}
            </div>

            {assignedToMe.length === 0 && inProgress.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h2 className="text-2xl font-bold mb-2">No Active Tasks</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  You're all caught up! New tasks will appear here when
                  assigned.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      {/* Edit Profile Modal */}
      {editProfileOpen && currentStaff && (
        <EditProfileModal
          staff={currentStaff}
          onClose={() => setEditProfileOpen(false)}
          onSave={(updatedStaff) => {
            setStaffMembers(
              staffMembers.map((s) =>
                s.id === updatedStaff.id ? updatedStaff : s,
              ),
            );
            setEditProfileOpen(false);
          }}
        />
      )}

      {/* Map View Modal */}
      {mapViewTask && (
        <MapViewModal
          task={mapViewTask}
          onClose={() => setMapViewTask(null)}
          onStartNavigation={() => {
            window.open(
              `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapViewTask.address)}`,
              "_blank",
            );
          }}
        />
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onSave={(newSettings) => {
            setSettings(newSettings);
            setSettingsOpen(false);
          }}
        />
      )}

      {/* Order Notification Popup */}
      {showOrderNotification && pendingOrders.length > 0 && (
        <OrderNotificationPopup
          pendingOrders={pendingOrders}
          onAcceptOrder={handleClaimOrder}
          onDismiss={() => setShowOrderNotification(false)}
        />
      )}
    </div>
  );
}

function EditProfileModal({
  staff,
  onClose,
  onSave,
}: {
  staff: StaffMember;
  onClose: () => void;
  onSave: (staff: StaffMember) => void;
}) {
  const [formData, setFormData] = useState(staff);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-effect border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 glass-effect border-b border-white/10 p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold">Edit Profile</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-linear-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-4xl">
                  {staff.avatar}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click camera icon to upload photo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="flex-1 bg-transparent focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                <Phone className="w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="flex-1 bg-transparent focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <input
                type="text"
                value={formData.role}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg capitalize"
                disabled
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-(--glow-purple-strong) transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MapViewModal({
  task,
  onClose,
  onStartNavigation,
}: {
  task: DeliveryTask;
  onClose: () => void;
  onStartNavigation: () => void;
}) {
  const getStatusColor = (status: DeliveryTask["status"]) => {
    switch (status) {
      case "assigned":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "in_progress":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-500/20";
      case "medium":
        return "text-orange-400 bg-orange-500/20";
      case "low":
        return "text-green-400 bg-green-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-effect border border-white/10 rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 glass-effect border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-linear-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                <Map className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">{task.orderId}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(task.status)}`}
                  >
                    {task.status.replace("_", " ").toUpperCase()}
                  </span>
                  {task.deliveryTime === "express" && (
                    <span className="px-3 py-1 rounded-full text-xs border bg-orange-500/20 text-orange-400 border-orange-500/30">
                      EXPRESS
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Customer: {task.customerName} • Priority:{" "}
                  <span
                    className={`font-semibold ${getPriorityColor(task.priority).split(" ")[0]}`}
                  >
                    {task.priority.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {/* Enhanced Map Placeholder */}
          <div className="relative h-100 bg-linear-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900/20 rounded-xl overflow-hidden border-2 border-purple-200 dark:border-purple-700/30 shadow-2xl">
            {/* Street grid pattern */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern
                    id="grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Route visualization */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient
                  id="routeGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "#8b5cf6", stopOpacity: 1 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#06b6d4", stopOpacity: 1 }}
                  />
                </linearGradient>
              </defs>
              <path
                d="M 50 350 Q 200 300, 350 250 T 650 150"
                stroke="url(#routeGradient)"
                strokeWidth="4"
                fill="none"
                strokeDasharray="10,5"
                className="animate-pulse"
              />
            </svg>

            {/* Starting point marker */}
            <div className="absolute left-12 bottom-12 flex flex-col items-center">
              <div className="relative">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800 animate-pulse">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div className="mt-2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                Your Location
              </div>
            </div>

            {/* Destination marker */}
            <div className="absolute right-12 top-12 flex flex-col items-center">
              <div className="relative">
                <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl border-4 border-white dark:border-gray-800">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-400 rounded-full animate-ping"></div>
              </div>
              <div className="mt-2 px-4 py-2 bg-linear-to-r from-purple-600 to-purple-700 text-white text-sm font-bold rounded-full shadow-lg max-w-xs text-center">
                Delivery Destination
              </div>
            </div>

            {/* Distance and time overlay */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    Estimated Time
                  </span>
                </div>
                <div className="text-3xl font-bold">{task.estimatedTime}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {new Date(task.assignedAt || Date.now()).toLocaleTimeString(
                    [],
                    { hour: "2-digit", minute: "2-digit" },
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    Distance
                  </span>
                </div>
                <div className="text-3xl font-bold">2.4 mi</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  via Main St
                </div>
              </div>
            </div>

            {/* Address banner at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-r from-purple-600/95 to-blue-600/95 backdrop-blur-sm p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-white mt-0.5" />
                <div className="flex-1">
                  <div className="text-white font-semibold mb-1">
                    Delivery Address
                  </div>
                  <div className="text-white/90 text-sm">{task.address}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Order Details */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Customer Info */}
            <div className="bg-linear-to-br from-blue-500/10 to-purple-500/10 p-6 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Customer
                  </div>
                  <div className="font-bold text-lg">{task.customerName}</div>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>customer@email.com</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-linear-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h4 className="font-bold text-lg">Order Items</h4>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {task.products.map((product, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-sm bg-white/5 p-2 rounded-lg"
                  >
                    <span className="flex-1">{product.name}</span>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold">
                      ×{product.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-linear-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-xl border border-green-500/20">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-bold text-lg">Order Summary</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Order ID
                  </span>
                  <span className="font-semibold">{task.orderId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Items
                  </span>
                  <span className="font-semibold">
                    {task.products.reduce((sum, p) => sum + p.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Assigned
                  </span>
                  <span className="font-semibold">
                    {new Date(task.assignedAt || Date.now()).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" },
                    )}
                  </span>
                </div>
                <div className="pt-3 border-t border-white/20 flex justify-between">
                  <span className="font-bold">Total Amount</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${task.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Instructions */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h4 className="font-bold">Delivery Instructions</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• Ring doorbell upon arrival</p>
              <p>• Leave packages at front door if no answer</p>
              <p>• Contact customer if unable to deliver: +1 (555) 123-4567</p>
              {task.deliveryTime === "express" && (
                <p className="text-orange-600 dark:text-orange-400 font-semibold">
                  ⚡ EXPRESS DELIVERY - Handle with priority!
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onStartNavigation}
              className="px-6 py-4 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-2 font-semibold text-lg"
            >
              <Navigation className="w-6 h-6" />
              Start GPS Navigation
            </button>
            <button
              onClick={() => {
                if (confirm("Call customer?")) {
                  window.open("tel:+15551234567");
                }
              }}
              className="px-6 py-4 bg-linear-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-[0_0_40px_rgba(22,163,74,0.6)] transition-all flex items-center justify-center gap-2 font-semibold text-lg"
            >
              <Phone className="w-6 h-6" />
              Call Customer
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
          >
            Close Map View
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({
  settings,
  onClose,
  onSave,
}: {
  settings: StaffSettings;
  onClose: () => void;
  onSave: (settings: StaffSettings) => void;
}) {
  const [formData, setFormData] = useState(settings);

  const handleToggle = (key: keyof typeof formData) => {
    setFormData({ ...formData, [key]: !formData[key] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDarkModeToggle = () => {
    const newValue = !formData.darkMode;
    setFormData({ ...formData, darkMode: newValue });
    if (newValue) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-effect border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 glass-effect border-b border-white/10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold">Settings & Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Notifications Toggle */}
          <div
            onClick={() => handleToggle("notifications")}
            className="bg-white/5 p-4 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Push Notifications</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive notifications for new tasks
                  </p>
                </div>
              </div>
              <div
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  formData.notifications ? "bg-purple-600" : "bg-gray-400"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                    formData.notifications ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Auto Accept Tasks Toggle */}
          <div
            onClick={() => handleToggle("autoAcceptTasks")}
            className="bg-white/5 p-4 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Auto-Accept Tasks</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically accept assigned tasks
                  </p>
                </div>
              </div>
              <div
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  formData.autoAcceptTasks ? "bg-purple-600" : "bg-gray-400"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                    formData.autoAcceptTasks ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Sound Alerts Toggle */}
          <div
            onClick={() => handleToggle("soundAlerts")}
            className="bg-white/5 p-4 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Sound Alerts</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Play sound for task notifications
                  </p>
                </div>
              </div>
              <div
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  formData.soundAlerts ? "bg-purple-600" : "bg-gray-400"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                    formData.soundAlerts ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Show Completed Tasks Toggle */}
          <div
            onClick={() => handleToggle("showCompleted")}
            className="bg-white/5 p-4 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Show Completed Tasks</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Display completed tasks in main view
                  </p>
                </div>
              </div>
              <div
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  formData.showCompleted ? "bg-purple-600" : "bg-gray-400"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                    formData.showCompleted ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div
            onClick={handleDarkModeToggle}
            className="bg-white/5 p-4 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  {formData.darkMode ? (
                    <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">Dark Mode</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Switch between light and dark theme
                  </p>
                </div>
              </div>
              <div
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  formData.darkMode ? "bg-purple-600" : "bg-gray-400"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                    formData.darkMode ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-(--glow-purple-strong) transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
