import { useEffect, useState } from "react";
import { Package, Users } from "lucide-react";
import { staffService, StaffPerformance } from "../../services/staffService";

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function PerformanceAnalytics() {
  const [staff, setStaff] = useState<StaffPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    staffService.performance()
      .then((data) => { if (!cancelled) setStaff(data); })
      .catch(() => { if (!cancelled) setError('Could not load staff performance.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Server already sorts by tasks_completed desc, but keep this as a safety net.
  const sortedByTasks = [...staff].sort((a, b) => b.tasks_completed - a.tasks_completed);
  const totalTasks = staff.reduce((sum, s) => sum + s.tasks_completed, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-linear-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          Staff Performance
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Deliveries completed per staff member, based on real order records
        </p>
      </div>

      {isLoading && <div className="text-center py-12 text-gray-400">Loading performance data...</div>}
      {error && !isLoading && <div className="text-center py-12 text-red-400">{error}</div>}

      {!isLoading && !error && (
        <>
          {/* Summary Card */}
          <div className="glass-effect p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-purple-400">
                  {totalTasks}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  Total Orders Delivered by Staff
                </div>
              </div>
              <Package className="w-16 h-16 text-purple-400" />
            </div>
          </div>

          {/* Staff List */}
          <div className="glass-effect p-6 rounded-xl border border-white/10">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
              Staff
            </h3>
            <div className="space-y-3">
              {sortedByTasks.length > 0 ? (
                sortedByTasks.map((member, idx) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          idx === 0
                            ? "bg-yellow-500 text-white"
                            : idx === 1
                              ? "bg-gray-400 text-white"
                              : idx === 2
                                ? "bg-orange-600 text-white"
                                : "bg-white/10 text-gray-400"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white font-bold">
                        {initials(member.name)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-lg">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {member.role === 'staffsupervisor' ? 'Staff Supervisor' : member.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-400">
                        {member.tasks_completed}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Orders Delivered
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No staff found</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
