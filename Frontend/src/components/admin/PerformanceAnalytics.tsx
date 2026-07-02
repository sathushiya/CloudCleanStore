import { useState } from 'react';
import { TrendingUp, Award, DollarSign, Target, Calculator, Users, Package, Star } from 'lucide-react';
import { StaffMember, staffMembers, deliveryTasks } from '../../data/admin';

export default function PerformanceAnalytics() {
  // Filter only delivery staff
  const deliveryStaff = staffMembers.filter(s => s.role === 'delivery');

  // Sort by tasks completed
  const sortedByTasks = [...deliveryStaff].sort((a, b) => b.performance.tasksCompleted - a.performance.tasksCompleted);

  const totalTasks = deliveryStaff.reduce((sum, s) => sum + s.performance.tasksCompleted, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          Delivery Staff Performance
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          View delivery staff task completion
        </p>
      </div>

      {/* Summary Card */}
      <div className="glass-effect p-6 rounded-xl border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-purple-400">{totalTasks}</div>
            <div className="text-sm text-gray-400 mt-1">Total Tasks Completed by Delivery Staff</div>
          </div>
          <Package className="w-16 h-16 text-purple-400" />
        </div>
      </div>

      {/* Delivery Staff List */}
      <div className="glass-effect p-6 rounded-xl border border-white/10">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Delivery Staff</h3>
        <div className="space-y-3">
          {sortedByTasks.length > 0 ? (
            sortedByTasks.map((staff, idx) => (
              <div
                key={staff.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-yellow-500 text-white' :
                    idx === 1 ? 'bg-gray-400 text-white' :
                    idx === 2 ? 'bg-orange-600 text-white' :
                    'bg-white/10 text-gray-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white font-bold">
                    {staff.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-lg">{staff.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{staff.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-400">{staff.performance.tasksCompleted}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Tasks Completed</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No delivery staff found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
