import React, { useState } from 'react';
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  Mail,
  KeyRound,
  Plus
} from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const [employees] = useState([
    {
      id: 'USR-01',
      name: 'Alex Vance',
      email: 'alex.vance@tracex.internal',
      role: 'ADMIN',
      badge: 'Director of Forensics',
      status: 'ACTIVE',
      lastActive: 'Just now'
    },
    {
      id: 'USR-02',
      name: 'Elena Rostova',
      email: 'elena.rostova@tracex.internal',
      role: 'SENIOR_ANALYST',
      badge: 'Senior Chain Sleuth',
      status: 'ACTIVE',
      lastActive: '12m ago'
    },
    {
      id: 'USR-03',
      name: 'David Chen',
      email: 'david.chen@tracex.internal',
      role: 'ANALYST',
      badge: 'Junior Forensic Investigator',
      status: 'ACTIVE',
      lastActive: '1h ago'
    },
    {
      id: 'USR-04',
      name: 'Sarah Connor',
      email: 'sarah.connor@tracex.internal',
      role: 'COMPLIANCE_OFFICER',
      badge: 'SAR & AML Compliance Auditor',
      status: 'ACTIVE',
      lastActive: '3h ago'
    },
    {
      id: 'USR-05',
      name: 'Marcus Brody',
      email: 'marcus.brody@tracex.internal',
      role: 'VIEWER',
      badge: 'External Counsel / Observer',
      status: 'OFFLINE',
      lastActive: '2d ago'
    }
  ]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono text-xs" id="employees-container">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-cyan-400 font-semibold tracking-wider uppercase">
            Team Governance
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Analyst Personnel & Access Credentials
          </h1>
          <p className="text-slate-400 mt-1">
            Role-Based Access Control (RBAC) roster and forensic signing authorities
          </p>
        </div>

        <button
          onClick={() => alert('Invite analyst link generated')}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold tracking-wider transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>INVITE ANALYST</span>
        </button>
      </div>

      {/* Employees Table */}
      <div className="rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3.5 px-4 font-medium">Employee Name</th>
                <th className="py-3.5 px-4 font-medium">Internal Email</th>
                <th className="py-3.5 px-4 font-medium">RBAC Security Role</th>
                <th className="py-3.5 px-4 font-medium">Title / Functional Badge</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Last Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-[10px]">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span>{emp.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {emp.email}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold text-[10px]">
                      {emp.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {emp.badge}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400">
                    {emp.lastActive}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
