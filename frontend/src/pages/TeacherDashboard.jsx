import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { api, formatApiErrorDetail } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Trash2, GraduationCap, BookOpen, Loader2, Sparkles, ExternalLink, Activity } from "lucide-react";
import { toast } from "sonner";
import SubscriptionBanner from "../components/SubscriptionBanner";

const SUBJECTS = ["Mathematics", "Science", "English", "Social Studies", "Coding", "Art", "Music", "Physical Education"];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: "", grade: "", age: 8, subject_focus: "Mathematics" });
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [recSubject, setRecSubject] = useState("Science");
  const [recAge, setRecAge] = useState(10);
  const [recs, setRecs] = useState(null);
  const [recLoading, setRecLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/students");
      setStudents(data);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const addStudent = async (e) => {
    e.preventDefault();
    setLoadingAdd(true);
    try {
      await api.post("/students", { ...form, age: Number(form.age) });
      setForm({ name: "", grade: "", age: 8, subject_focus: "Mathematics" });
      toast.success("Student added");
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setLoadingAdd(false);
    }
  };

  const removeStudent = async (id) => {
    try {
      await api.delete(`/students/${id}`);
      toast.success("Student removed");
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
  };

  const generateRecs = async () => {
    setRecLoading(true);
    setRecs(null);
    try {
      const { data } = await api.post("/recommendations", { subject: recSubject, age: Number(recAge) });
      setRecs(data);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SubscriptionBanner />
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] font-bold text-orange-700 mb-1">Teacher space</div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900" data-testid="teacher-dashboard-title">
              Welcome, {user.name.split(" ")[0]} 🍎
            </h1>
          </div>
          <Link to="/sentiment">
            <Button variant="outline" className="rounded-full font-bold border-indigo-300 text-[#0a1f5c] hover:bg-indigo-50 px-6 py-3 btn-lift" data-testid="teacher-sentiment-btn">
              <Activity size={16} className="mr-1.5" strokeWidth={2.5} /> Sentiment Lab
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="rounded-3xl p-6 bg-white border-slate-100">
            <div className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-1">My students</div>
            <div className="text-3xl font-black text-slate-900" data-testid="teacher-stat-students">{students.length}</div>
          </Card>
          <Card className="rounded-3xl p-6 bg-white border-slate-100">
            <div className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-1">Subjects covered</div>
            <div className="text-3xl font-black text-slate-900">{new Set(students.map((s) => s.subject_focus)).size}</div>
          </Card>
          <Card className="rounded-3xl p-6 bg-gradient-to-br from-sky-500 to-indigo-500 text-white border-0">
            <div className="text-xs uppercase tracking-widest font-bold text-white/80 mb-1">Average age</div>
            <div className="text-3xl font-black">{students.length ? Math.round(students.reduce((a, s) => a + s.age, 0) / students.length) : "-"}</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-3xl p-7 bg-white border-slate-100 lg:col-span-1" data-testid="add-student-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center"><GraduationCap className="text-orange-600" size={20} strokeWidth={2.5} /></div>
              <h2 className="text-xl font-bold text-slate-900">Add student</h2>
            </div>
            <form onSubmit={addStudent} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Name</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl bg-white" data-testid="add-student-name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Grade</Label>
                <Input required value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="rounded-xl bg-white" placeholder="e.g., 5A" data-testid="add-student-grade" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Age</Label>
                  <Input required type="number" min={3} max={18} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="rounded-xl bg-white" data-testid="add-student-age" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Subject</Label>
                  <Select value={form.subject_focus} onValueChange={(v) => setForm({ ...form, subject_focus: v })}>
                    <SelectTrigger className="rounded-xl bg-white" data-testid="add-student-subject"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={loadingAdd} className="w-full rounded-full bg-[#f97316] hover:bg-[#ea580c] font-bold py-6 btn-lift" data-testid="add-student-btn">
                {loadingAdd ? "Adding…" : "Add student"}
              </Button>
            </form>
          </Card>

          <Card className="rounded-3xl p-7 bg-white border-slate-100 lg:col-span-2" data-testid="students-table-card">
            <h2 className="text-xl font-bold text-slate-900 mb-4">My students</h2>
            <div className="rounded-2xl overflow-hidden border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/60">
                    <TableHead className="font-bold">Name</TableHead>
                    <TableHead className="font-bold">Grade</TableHead>
                    <TableHead className="font-bold">Age</TableHead>
                    <TableHead className="font-bold">Subject</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500 py-10">No students yet. Add your first student to begin.</TableCell>
                    </TableRow>
                  )}
                  {students.map((s, i) => (
                    <TableRow key={s.id} className={i % 2 ? "bg-slate-50/60" : ""} data-testid={`student-row-${s.id}`}>
                      <TableCell className="font-bold">{s.name}</TableCell>
                      <TableCell>{s.grade}</TableCell>
                      <TableCell>{s.age}</TableCell>
                      <TableCell><Badge className="rounded-full bg-orange-100 text-[#f97316] border-orange-200 font-bold text-xs">{s.subject_focus}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => removeStudent(s.id)} className="rounded-full" data-testid={`student-delete-${s.id}`}>
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        <Card className="rounded-3xl p-7 bg-white border-slate-100" data-testid="teacher-recommendations-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#0a1f5c]/10 flex items-center justify-center"><BookOpen className="text-[#0a1f5c]" size={20} strokeWidth={2.5} /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Share content with students</h2>
              <p className="text-sm text-slate-500">The system generates curated books, links and activities by subject and age.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Subject</Label>
              <Select value={recSubject} onValueChange={setRecSubject}>
                <SelectTrigger className="rounded-xl bg-white" data-testid="teacher-rec-subject"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Age group</Label>
              <Input type="number" min={3} max={18} value={recAge} onChange={(e) => setRecAge(e.target.value)} className="rounded-xl bg-white" data-testid="teacher-rec-age" />
            </div>
            <Button onClick={generateRecs} disabled={recLoading} className="rounded-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-6 btn-lift" data-testid="teacher-rec-btn">
              {recLoading ? (<><Loader2 className="animate-spin mr-2" size={16} /> Curating…</>) : (<><Sparkles className="mr-2" size={16} strokeWidth={2.5} /> Generate</>)}
            </Button>
          </div>
          {recs && (
            <div className="mt-6 grid lg:grid-cols-3 gap-4" data-testid="teacher-rec-result">
              <div>
                <div className="text-xs uppercase tracking-widest font-bold text-[#f97316] mb-2">Books</div>
                <ul className="space-y-2">
                  {recs.books.map((b, i) => (
                    <li key={i} className="bg-white/60 rounded-xl p-3 border border-orange-100"><div className="font-bold">{b.title}</div><div className="text-xs text-slate-600">{b.author}</div></li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest font-bold text-[#0a1f5c] mb-2">Links</div>
                <ul className="space-y-2">
                  {recs.links.map((l, i) => (
                    <li key={i} className="bg-indigo-50/60 rounded-xl p-3 border border-indigo-100">
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="font-bold text-[#0a1f5c] inline-flex items-center gap-1.5 hover:underline">{l.title} <ExternalLink size={12} /></a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest font-bold text-orange-600 mb-2">Activities</div>
                <ul className="space-y-2">
                  {recs.activities.map((a, i) => (
                    <li key={i} className="bg-sky-50/60 rounded-xl p-3 border border-sky-100"><div className="font-bold">{a.title}</div><div className="text-xs text-slate-600">{a.duration_minutes} min</div></li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
