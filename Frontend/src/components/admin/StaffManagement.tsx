import { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Award,
  TrendingUp,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  StaffMember,
  staffMembers as initialStaffMembers,
  StaffPermissions,
} from "../../data/admin";

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaffMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<
    "all" | "admin" | "staff" | "staffsupervisor"
  >("all");
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleDeleteStaff = (id: string) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      setStaff(staff.filter((s) => s.id !== id));
    }
  };

  const handleSaveStaff = (updatedStaff: StaffMember) => {
    setStaff(staff.map((s) => (s.id === updatedStaff.id ? updatedStaff : s)));
    setEditingStaff(null);
  };

  const handleAddStaff = (newStaff: StaffMember) => {
    setStaff([...staff, newStaff]);
    setIsAddModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "busy":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "staff":
        return "Staff";
      case "staffsupervisor":
        return "Staff Supervisor";
      default:
        return "Admin";
    }
  };

  const getRoleBadgeLabel = (role: string) => {
    switch (role) {
      case "staff":
        return "Staff";
      case "staffsupervisor":
        return "Staff Supervisor";
      default:
        return "Admin";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "staff":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "staffsupervisor":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          Staff Management
        </h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-[var(--glow-purple-strong)] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as any)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-gray-900 dark:text-white"
        >
          <option value="all">All Roles</option>
          <option value="staff">Staff</option>
          <option value="staffsupervisor">Staff Supervisor</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredStaff.map((member) => (
          <div
            key={member.id}
            className="glass-effect p-6 rounded-xl border border-white/10 space-y-4 hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white font-bold text-lg">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getRoleLabel(member.role)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs border ${getRoleColor(member.role)}`}
                    >
                      {getRoleBadgeLabel(member.role)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(member.status)}`}
                    >
                      {member.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingStaff(member)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteStaff(member.id)}
                  className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4" />
                {member.email}
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4" />
                {member.phone}
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                Joined: {new Date(member.joinDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <DollarSign className="w-4 h-4" />
                Salary: ${member.salary.toLocaleString()}/month
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  {member.performance.tasksCompleted}
                </div>
                <div className="text-sm text-gray-400">Tasks Completed</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No staff members found</p>
        </div>
      )}

      {editingStaff && (
        <EditStaffModal
          staff={editingStaff}
          onClose={() => setEditingStaff(null)}
          onSave={handleSaveStaff}
        />
      )}

      {isAddModalOpen && (
        <AddStaffModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddStaff}
        />
      )}
    </div>
  );
}

function EditStaffModal({
  staff,
  onClose,
  onSave,
}: {
  staff: StaffMember;
  onClose: () => void;
  onSave: (staff: StaffMember) => void;
}) {
  const [formData, setFormData] = useState(staff);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const selectedPermission = formData.permissions.canManageOrders
    ? "staff"
    : formData.permissions.canEditProducts
      ? "staffsupervisor"
      : null;

  const handlePermissionSelect = (type: "staff" | "staffsupervisor") => {
    const isStaff = type === "staff";
    setFormData({
      ...formData,
      role: isStaff ? "staff" : "staffsupervisor",
      permissions: {
        canAddProducts: false,
        canEditProducts: !isStaff,
        canDeleteProducts: false,
        canManageStock: !isStaff,
        canManageStaff: false,
        canManageOrders: isStaff,
        canViewReports: false,
        canManagePermissions: false,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-effect border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 glass-effect border-b border-white/10 p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Edit Staff Member
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as any })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white"
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="staffsupervisor">Staff Supervisor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="busy">Busy</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Salary
              </label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) =>
                  setFormData({ ...formData, salary: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Permissions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPermission === "staff"
                    ? "bg-cyan-500/10 border-cyan-500/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <input
                  type="radio"
                  name="permission-edit"
                  checked={selectedPermission === "staff"}
                  onChange={() => handlePermissionSelect("staff")}
                  className="mt-0.5 accent-cyan-500"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Handle Orders
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Assigned as Staff
                  </p>
                </div>
              </label>
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPermission === "staffsupervisor"
                    ? "bg-purple-500/10 border-purple-500/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <input
                  type="radio"
                  name="permission-edit"
                  checked={selectedPermission === "staffsupervisor"}
                  onChange={() => handlePermissionSelect("staffsupervisor")}
                  className="mt-0.5 accent-purple-500"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Modify Products & Stock
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Assigned as Staff Supervisor
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-[var(--glow-purple-strong)] transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddStaffModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (staff: StaffMember) => void;
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Partial<StaffMember>>({
    name: "",
    email: "",
    phone: "",
    role: "staff",
    status: "active",
    salary: 3000,
    permissions: {
      canAddProducts: false,
      canEditProducts: false,
      canDeleteProducts: false,
      canManageStock: false,
      canManageStaff: false,
      canManageOrders: false,
      canViewReports: false,
      canManagePermissions: false,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: formData.name!,
      email: formData.email!,
      phone: formData.phone!,
      role: formData.role!,
      avatar: formData
        .name!.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      joinDate: new Date().toISOString().split("T")[0],
      status: formData.status!,
      permissions: formData.permissions!,
      performance: {
        tasksCompleted: 0,
        tasksDeclined: 0,
        points: 0,
        rating: 5.0,
        totalEarnings: 0,
        currentMonth: {
          tasks: 0,
          earnings: 0,
        },
      },
      salary: formData.salary!,
    };
    onAdd(newStaff);
  };

  const selectedPermission = formData.permissions?.canManageOrders
    ? "staff"
    : formData.permissions?.canEditProducts
      ? "staffsupervisor"
      : null;

  const handlePermissionSelect = (type: "staff" | "staffsupervisor") => {
    const isStaff = type === "staff";
    setFormData({
      ...formData,
      role: isStaff ? "staff" : "staffsupervisor",
      permissions: {
        canAddProducts: false,
        canEditProducts: !isStaff,
        canDeleteProducts: false,
        canManageStock: !isStaff,
        canManageStaff: false,
        canManageOrders: isStaff,
        canViewReports: false,
        canManagePermissions: false,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-effect border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 glass-effect border-b border-white/10 p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Add Staff Member
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as any })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white"
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="busy">Busy</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Salary
              </label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) =>
                  setFormData({ ...formData, salary: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set login password"
                  className="w-full px-4 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Permissions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPermission === "staff"
                    ? "bg-cyan-500/10 border-cyan-500/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <input
                  type="radio"
                  name="permission-add"
                  checked={selectedPermission === "staff"}
                  onChange={() => handlePermissionSelect("staff")}
                  className="mt-0.5 accent-cyan-500"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Handle Orders
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Assigned as Staff
                  </p>
                </div>
              </label>
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPermission === "staffsupervisor"
                    ? "bg-purple-500/10 border-purple-500/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <input
                  type="radio"
                  name="permission-add"
                  checked={selectedPermission === "staffsupervisor"}
                  onChange={() => handlePermissionSelect("staffsupervisor")}
                  className="mt-0.5 accent-purple-500"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Modify Products & Stock
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Assigned as Staff Supervisor
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-[var(--glow-purple-strong)] transition-all"
            >
              Add Staff Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
