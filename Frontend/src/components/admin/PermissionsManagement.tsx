import { useState } from "react";
import { Search, Shield, Check, X, User } from "lucide-react";
import {
  StaffMember,
  staffMembers as initialStaffMembers,
  StaffPermissions,
} from "../../data/admin";

export default function PermissionsManagement() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaffMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<
    "all" | "admin" | "staff" | "staffsupervisor"
  >("all");

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handlePermissionSelect = (
    staffId: string,
    type: "staff" | "staffsupervisor",
  ) => {
    const isStaff = type === "staff";
    setStaff(
      staff.map((member) => {
        if (member.id === staffId) {
          return {
            ...member,
            role: isStaff ? "staff" : "staffsupervisor",
            permissions: {
              ...member.permissions,
              canManageOrders: isStaff,
              canEditProducts: !isStaff,
              canManageStock: !isStaff,
              canAddProducts: false,
              canDeleteProducts: false,
            },
          };
        }
        return member;
      }),
    );
  };

  const permissionsList: Array<{
    key: keyof StaffPermissions;
    label: string;
    description: string;
  }> = [
    {
      key: "canManageOrders",
      label: "Handle Orders",
      description: "Assigned as Staff",
    },
    {
      key: "canEditProducts",
      label: "Modify Products & Stock",
      description: "Assigned as Staff Supervisor",
    },
  ];

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

  const countActivePermissions = (permissions: StaffPermissions): number => {
    return [permissions.canManageOrders, permissions.canEditProducts].filter(
      Boolean,
    ).length;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          Permissions Management
        </h2>
      </div>

      <div className="glass-effect p-6 rounded-xl border border-white/10">
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-purple-400 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Permission System Overview
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Manage what each staff member can do in the system. Different
              roles have different default permissions. Be careful when granting
              sensitive permissions like "Manage Permissions" or "Delete
              Products".
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {permissionsList.map((perm) => (
                <div key={perm.key} className="bg-white/5 p-3 rounded-lg">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {perm.label}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {perm.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as any)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="staffsupervisor">Staff Supervisor</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredStaff.map((member) => (
          <div
            key={member.id}
            className="glass-effect p-6 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white font-bold text-lg">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {member.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {member.email}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs border ${getRoleColor(member.role)}`}
                    >
                      {member.role === "staff"
                        ? "Staff"
                        : member.role === "staffsupervisor"
                          ? "Staff Supervisor"
                          : member.role}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">
                  {countActivePermissions(member.permissions)}/
                  {permissionsList.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Active Permissions
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(() => {
                const activePermission = member.permissions.canManageOrders
                  ? "staff"
                  : member.permissions.canEditProducts
                    ? "staffsupervisor"
                    : null;
                return permissionsList.map((perm) => {
                  const isStaffPerm = perm.key === "canManageOrders";
                  const permType = isStaffPerm ? "staff" : "staffsupervisor";
                  const isSelected = activePermission === permType;
                  return (
                    <button
                      key={perm.key}
                      onClick={() =>
                        handlePermissionSelect(member.id, permType)
                      }
                      className={`p-4 rounded-xl border transition-all text-left ${
                        isSelected
                          ? isDeliveryPerm
                            ? "bg-cyan-500/10 border-cyan-500/50"
                            : "bg-purple-500/10 border-purple-500/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            {perm.label}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {perm.description}
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isSelected
                              ? isStaffPerm
                                ? "border-cyan-500 bg-cyan-500"
                                : "border-purple-500 bg-purple-500"
                              : "border-gray-500 bg-transparent"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                });
              })()}
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
    </div>
  );
}
