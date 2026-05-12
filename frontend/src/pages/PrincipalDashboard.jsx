import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SentimentTrendChart from "../components/SentimentTrendChart";
import SchoolManager from "../components/SchoolManager";
import SubscriptionBanner from "../components/SubscriptionBanner";
import { useAuth } from "../context/AuthContext";
import { api, formatApiErrorDetail } from "../lib/api";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell, Legend } from "recharts";
import { Users, GraduationCap, ShieldCheck, Stars, BookOpen, TrendingUp, Activity, Smile, Frown, Meh, Baby } from "lucide-react";
import { toast } from "sonner";

const ROLE_COLORS = ["#0ea5e9", "#f59e0b", "#6366f1"];

export default function PrincipalDashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [students, setStudents] = useState([]);
  const [sentSummary, setSentSummary] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/analytics/overview"),
      api.get("/students"),
      api.get("/sentiment/summary"),
    ])
      .then(([a, b, c]) => { setOverview(a.data); setStudents(b.data); setSentSummary(c.data); })
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
        <SubscriptionBanner />
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] font-bold text-indigo-600 mb-1">Principal control room</div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900" data-testid="principal-dashboard-title">
              School pulse · {user.name}
            </h1>
          </div>
          <Link to="/sentiment">
            <Button variant="outline" className="rounded-full font-bold border-indigo-300 text-indigo-700 hover:bg-indigo-50 px-6 py-3 btn-lift" data-testid="principal-sentiment-btn">
              <Activity size={16} className="mr-1.5" strokeWidth={2.5} /> Sentiment Lab
            </Button>
          </Link>
        </div>

        {/* School management */}
        <div className="mb-6" id="school">
          <SchoolManager />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
          <Card className="rounded-3xl p-5 bg-white border-slate-100" data-testid="stat-children">
            <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-widest font-bold mb-2"><Baby size={14} strokeWidth={2.5} /> Children</div>
            <div className="text-3xl font-black text-slate-900">{overview.total_children ?? 0}</div>
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
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height={280}>
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
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height={280}>
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

        {/* Sentiment overview (Tiwari, 2025) */}
        <Card className="rounded-3xl p-6 bg-white border-slate-100 mb-6" data-testid="sentiment-overview-card">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center"><Activity className="text-indigo-600" size={20} strokeWidth={2.5} /></div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Sentiment overview</h3>
                <p className="text-xs text-slate-500">Hybrid lexicon + ML · Tiwari (2025) methodology</p>
              </div>
            </div>
            <Badge className="rounded-full bg-amber-100 text-amber-700 border-amber-200 font-bold">{sentSummary?.total_records ?? 0} records</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="flex items-center gap-2 text-emerald-700 text-xs uppercase tracking-widest font-bold mb-1"><Smile size={14} strokeWidth={2.5} /> Positive</div>
              <div className="text-2xl font-black text-emerald-700">{sentSummary?.overall?.positive ?? 0}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-700 text-xs uppercase tracking-widest font-bold mb-1"><Meh size={14} strokeWidth={2.5} /> Neutral</div>
              <div className="text-2xl font-black text-slate-700">{sentSummary?.overall?.neutral ?? 0}</div>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
              <div className="flex items-center gap-2 text-rose-700 text-xs uppercase tracking-widest font-bold mb-1"><Frown size={14} strokeWidth={2.5} /> Negative</div>
              <div className="text-2xl font-black text-rose-700">{sentSummary?.overall?.negative ?? 0}</div>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
              <div className="flex items-center gap-2 text-amber-700 text-xs uppercase tracking-widest font-bold mb-1"><Activity size={14} strokeWidth={2.5} /> Mixed</div>
              <div className="text-2xl font-black text-amber-700">{sentSummary?.overall?.mixed ?? 0}</div>
            </div>
          </div>
          {sentSummary?.by_kind && Object.keys(sentSummary.by_kind).length > 0 && (
            <div className="mt-5 grid md:grid-cols-3 gap-3">
              {Object.entries(sentSummary.by_kind).map(([kind, vals]) => (
                <div key={kind} className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-2 capitalize">{kind.replace("_", " ")}</div>
                  <div className="flex gap-3 text-sm">
                    <span className="font-bold text-emerald-700">+{vals.positive || 0}</span>
                    <span className="font-bold text-slate-600">·{vals.neutral || 0}</span>
                    <span className="font-bold text-rose-700">−{vals.negative || 0}</span>
                    <span className="font-bold text-amber-700">~{vals.mixed || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Sentiment trend over time */}
        <div className="mb-6">
          <SentimentTrendChart />
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
