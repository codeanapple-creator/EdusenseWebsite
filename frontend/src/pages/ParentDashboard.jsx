import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import WhatsAppButton from "../components/WhatsAppButton";
import ChildrenManager from "../components/ChildrenManager";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { api, formatApiErrorDetail } from "../lib/api";
import { Link } from "react-router-dom";
import { BookOpen, Stars, ExternalLink, Activity, Sparkles, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";

const SUBJECTS = ["Mathematics", "Science", "English", "Social Studies", "Coding", "Art", "Music", "Physical Education"];

export default function ParentDashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [subject, setSubject] = useState("Science");
  const [age, setAge] = useState(8);
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [whatsapp, setWhatsapp] = useState(null);

  useEffect(() => {
    api.get("/astrology/history").then((r) => setHistory(r.data || [])).catch(() => {});
    api.get("/whatsapp/contact").then((r) => setWhatsapp(r.data)).catch(() => {});
  }, []);

  const fetchRecs = async () => {
    setLoading(true);
    setRecs(null);
    try {
      const { data } = await api.post("/recommendations", { subject, age: Number(age) });
      setRecs(data);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setLoading(false);
    }
  };

  const lastReading = history[0]?.result;

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] font-bold text-sky-600 mb-1">Parent space</div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900" data-testid="parent-dashboard-title">Hello, {user.name.split(" ")[0]} 👋</h1>
          </div>
          <Link to="/astrology">
            <Button className="rounded-full bg-indigo-600 hover:bg-indigo-500 font-bold px-6 py-3 btn-lift" data-testid="parent-find-niche-btn">
              <Stars size={16} className="mr-1.5" strokeWidth={2.5} /> Find a child's niche
            </Button>
          </Link>
        </div>

        {/* Children manager */}
        <div className="mb-6">
          <ChildrenManager />
        </div>

        {/* Bento grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-3xl p-6 lg:col-span-2 cosmic-bg text-white border-0" data-testid="parent-niche-card">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs uppercase tracking-[0.22em] font-bold text-indigo-300">Latest niche reading</div>
              {history[0] && <Badge className="rounded-full bg-indigo-500/20 border-indigo-400/30 text-indigo-200 font-bold">{history[0].sun_sign}</Badge>}
            </div>
            {lastReading ? (
              <>
                <div className="text-3xl md:text-4xl font-black tracking-tight">{lastReading.niche}</div>
                <p className="text-indigo-100/80 mt-3 text-sm leading-relaxed">{lastReading.summary}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {(lastReading.traits || []).slice(0, 4).map((t, i) => (
                    <Badge key={i} className="rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 font-bold">{t}</Badge>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">No reading yet</div>
                <p className="text-indigo-100/70 mt-2 text-sm">Begin by entering your child's birth details to discover their niche.</p>
                <Link to="/astrology" className="inline-block mt-4">
                  <Button className="rounded-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold">Start reading</Button>
                </Link>
              </>
            )}
          </Card>

          <Card className="rounded-3xl p-6 bg-white border-slate-100">
            <div className="text-xs uppercase tracking-[0.22em] font-bold text-slate-500 mb-2">Need a deeper reading?</div>
            <div className="font-bold text-slate-900 text-xl mb-3">Talk to our team</div>
            <p className="text-sm text-slate-600 mb-4">Get a personalised guidance plan for your child over a quick WhatsApp chat.</p>
            {whatsapp && <WhatsAppButton link={whatsapp.link} label={`Chat on ${whatsapp.number}`} testid="parent-whatsapp-btn" />}
          </Card>
        </div>

        {/* Recommendations finder */}
        <Card className="rounded-3xl p-7 lg:p-9 bg-white border-slate-100 mb-8" data-testid="recommendations-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <BookOpen className="text-amber-600" size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Books, links & activities</h2>
              <p className="text-sm text-slate-500">AI-curated, age-appropriate, by subject.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="rounded-xl bg-white" data-testid="rec-subject-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => <SelectItem key={s} value={s} data-testid={`rec-subject-option-${s}`}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Child age</Label>
              <Input type="number" min={3} max={18} value={age} onChange={(e) => setAge(e.target.value)} className="rounded-xl bg-white" data-testid="rec-age-input" />
            </div>
            <Button onClick={fetchRecs} disabled={loading} className="rounded-full bg-sky-500 hover:bg-sky-400 font-bold py-6 btn-lift" data-testid="rec-generate-btn">
              {loading ? (<><Loader2 className="animate-spin mr-2" size={16} /> Curating…</>) : (<><Sparkles className="mr-2" size={16} strokeWidth={2.5} /> Get recommendations</>)}
            </Button>
          </div>

          {recs && (
            <div className="mt-8 grid lg:grid-cols-3 gap-6" data-testid="recommendations-result">
              <div>
                <div className="text-xs uppercase tracking-widest font-bold text-sky-600 mb-3 flex items-center gap-1.5"><BookOpen size={14} strokeWidth={2.5} /> Books</div>
                <ul className="space-y-3">
                  {recs.books.map((b, i) => (
                    <li key={i} className="bg-amber-50/60 rounded-2xl p-4 border border-amber-100">
                      <div className="font-bold text-slate-900">{b.title}</div>
                      <div className="text-xs text-slate-500 mb-1">by {b.author}</div>
                      <div className="text-sm text-slate-700">{b.description}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest font-bold text-indigo-600 mb-3 flex items-center gap-1.5"><ExternalLink size={14} strokeWidth={2.5} /> Links</div>
                <ul className="space-y-3">
                  {recs.links.map((l, i) => (
                    <li key={i} className="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100">
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="font-bold text-indigo-700 hover:underline inline-flex items-center gap-1.5">{l.title} <ExternalLink size={12} /></a>
                      <div className="text-sm text-slate-700 mt-1">{l.description}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest font-bold text-amber-600 mb-3 flex items-center gap-1.5"><Activity size={14} strokeWidth={2.5} /> Activities</div>
                <ul className="space-y-3">
                  {recs.activities.map((a, i) => (
                    <li key={i} className="bg-sky-50/60 rounded-2xl p-4 border border-sky-100">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-slate-900">{a.title}</div>
                        <Badge className="rounded-full bg-sky-100 text-sky-700 border-sky-200 font-bold text-xs"><Clock size={12} className="mr-1" /> {a.duration_minutes}m</Badge>
                      </div>
                      <div className="text-sm text-slate-700 mt-1">{a.description}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>

        {/* History */}
        {history.length > 0 && (
          <Card className="rounded-3xl p-7 bg-white border-slate-100" data-testid="parent-history-card">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Past niche readings</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((h) => (
                <div key={h.id} className="rounded-2xl border border-slate-200 p-4 bg-amber-50/40">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-slate-900">{h.request.name}</div>
                    <Badge className="rounded-full bg-indigo-100 text-indigo-700 border-indigo-200 font-bold text-xs">{h.sun_sign}</Badge>
                  </div>
                  <div className="text-sm font-bold text-sky-700">{h.result?.niche}</div>
                  <div className="text-xs text-slate-500 mt-1">{new Date(h.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
