import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { api, formatApiErrorDetail } from "../lib/api";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell, Legend } from "recharts";
import { Users, GraduationCap, ShieldCheck, Stars, BookOpen, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const ROLE_COLORS = ["#0ea5e9", "#f59e0b", "#6366f1"];

export default function PrincipalDashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/analytics/overview"), api.get("/students")])
      .then(([a, b]) => { setOverview(a.data); setStudents(b.data); })
      .catch((e) => toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message));
  }, []);

  if (!overview) {
    return (
      <div className="min-h-screen bg-amber-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500 animate-pulse">Loading analytics…</div>
      </div>
    );
  }

  const roleData = [
    { name: "Parents", value: overview.total_parents },
    { name: "Teachers", value: overview.total_teachers },
    { name: "Principals", value: overview.total_principals },
  ];

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.22em] font-bold text-indigo-600 mb-1">Principal control room</div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900" data-testid="principal-dashboard-title">
            School pulse · {user.name}
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-3xl p-5 bg-white border-slate-100" data-testid="stat-users">
            <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-widest font-bold mb-2"><Users size={14} strokeWidth={2.5} /> Total users</div>
            <div className="text-3xl font-black text-slate-900">{overview.total_users}</div>
          </Card>
          <Card className="rounded-3xl p-5 bg-white border-slate-100" data-testid="stat-students">
            <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-widest font-bold mb-2"><GraduationCap size={14} strokeWidth={2.5} /> Students</div>
            <div className="text-3xl font-black text-slate-900">{overview.total_students}</div>
          </Card>
          <Card className="rounded-3xl p-5 bg-white border-slate-100" data-testid="stat-teachers">
            <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-widest font-bold mb-2"><ShieldCheck size={14} strokeWidth={2.5} /> Teachers</div>
            <div className="text-3xl font-black text-slate-900">{overview.total_teachers}</div>
          </Card>
          <Card className="rounded-3xl p-5 bg-gradient-to-br from-indigo-600 to-violet-500 text-white border-0" data-testid="stat-astro">
            <div className="flex items-center gap-2 text-white/80 text-xs uppercase tracking-widest font-bold mb-2"><Stars size={14} strokeWidth={2.5} /> Astro consults</div>
            <div className="text-3xl font-black">{overview.total_astrology_consults}</div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="rounded-3xl p-6 bg-white border-slate-100" data-testid="chart-roles">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center"><Users className="text-sky-600" size={18} strokeWidth={2.5} /></div>
              <h3 className="text-lg font-bold text-slate-900">Users by role</h3>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {roleData.map((_, i) => <Cell key={i} fill={ROLE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="rounded-3xl p-6 bg-white border-slate-100" data-testid="chart-grades">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center"><TrendingUp className="text-amber-600" size={18} strokeWidth={2.5} /></div>
              <h3 className="text-lg font-bold text-slate-900">Students by grade</h3>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.grade_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="grade" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {overview.grade_distribution.length === 0 && (
              <div className="text-center text-sm text-slate-500 py-6">No student data yet — teachers can add students to populate this chart.</div>
            )}
          </Card>
        </div>

        {/* Students table */}
        <Card className="rounded-3xl p-6 bg-white border-slate-100" data-testid="principal-students-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center"><BookOpen className="text-indigo-600" size={18} strokeWidth={2.5} /></div>
            <h3 className="text-lg font-bold text-slate-900">All students (school-wide)</h3>
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-amber-50/60">
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">Grade</TableHead>
                  <TableHead className="font-bold">Age</TableHead>
                  <TableHead className="font-bold">Subject focus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-10">No students enrolled yet.</TableCell></TableRow>
                )}
                {students.map((s, i) => (
                  <TableRow key={s.id} className={i % 2 ? "bg-slate-50/60" : ""}>
                    <TableCell className="font-bold">{s.name}</TableCell>
                    <TableCell>{s.grade}</TableCell>
                    <TableCell>{s.age}</TableCell>
                    <TableCell><Badge className="rounded-full bg-sky-100 text-sky-700 border-sky-200 font-bold text-xs">{s.subject_focus}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
