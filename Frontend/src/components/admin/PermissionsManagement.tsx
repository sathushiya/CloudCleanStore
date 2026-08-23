import { useEffect, useState } from "react";
import { Search, Shield, User } from "lucide-react";
import { staffService, StaffAccount } from "../../services/staffService";

// This screen is really a role switcher dressed up as "permissions": a
// staff account's capabilities in this app are entirely determined by its
// role (staff vs staffsupervisor), so "granting a permission" here just
// means changing that account's role via the existing staff update endpoint.
type StaffRole = "staff" | "staffsupervisor";

const ROLE_PRESETS: Array<{ role: StaffRole; label: string; description: string }> = [
  { role: "staff", label: "Handle Orders", description: "Assigned as Staff" },
  { role: "staffsupervisor", label: "Modify Products & Stock", description: "Assigned as Staff Supervisor" },
];

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function PermissionsManagement() {
  const [staff, setStaff] = useState<StaffAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<"all" | "admin" | StaffRole>("all");

  const loadStaff = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await staffService.list();
      setStaff(data);
    } catch {
      setError("Could not load staff accounts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (member: StaffAccount, newRole: StaffRole) => {
    if (member.role === newRole) return;
    setSavingId(member.id);
    try {
      const updated = await staffService.update(member.id, {
        name: member.name,
        email: member.email,
        phone_number: member.phone_number,
        role: newRole,
        is_active: member.is_active,
      });
      setStaff((prev) => prev.map((m) => (m.id === member.id ? { ...m, ...updated } : m)));
    } catch {
      alert("Failed to update this staff member's role. Please try again.");
    } finally {
      setSavingId(null);
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
        <h2 className="text-2xl font-bold bg-linear-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
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
              A staff member's access level in this app is determined by their role.
              Switching a role here updates their account immediately.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ROLE_PRESETS.map((preset) => (
                <div key={preset.role} className="bg-white/5 p-3 rounded-lg">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {preset.label}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {preset.description}
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
          onChange={(e) => setSelectedRole(e.target.value as "all" | "admin" | StaffRole)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="staffsupervisor">Staff Supervisor</option>
        </select>
      </div>

      {isLoading && <div className="text-center py-12 text-gray-400">Loading staff...</div>}
      {error && !isLoading && <div className="text-center py-12 text-red-400">{error}</div>}

      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredStaff.map((member) => (
            <div
              key={member.id}
              className="glass-effect p-6 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white font-bold text-lg">
                    {initials(member.name)}
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
                            : "Admin"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {member.role === "admin" ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Admin accounts have full access and don't use role presets.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ROLE_PRESETS.map((preset) => {
                    const isSelected = member.role === preset.role;
                    const isStaffPreset = preset.role === "staff";
                    return (
                      <button
                        key={preset.role}
                        onClick={() => handleRoleChange(member, preset.role)}
                        disabled={savingId === member.id}
                        className={`p-4 rounded-xl border transition-all text-left disabled:opacity-50 ${
                          isSelected
                            ? isStaffPreset
                              ? "bg-cyan-500/10 border-cyan-500/50"
                              : "bg-purple-500/10 border-purple-500/50"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              {preset.label}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {preset.description}
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected
                                ? isStaffPreset
                                  ? "border-cyan-500 bg-cyan-500"
                                  : "border-purple-500 bg-purple-500"
                                : "border-gray-500 bg-transparent"
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {filteredStaff.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No staff members found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
