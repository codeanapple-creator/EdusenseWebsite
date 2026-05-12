import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { api, formatApiErrorDetail } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import SentimentResultCard from "../components/SentimentResultCard";
import { toast } from "sonner";
import { BookOpen, Sparkles, Loader2, MessageSquareQuote, NotebookPen, Activity, Trash2 } from "lucide-react";

const SUBJECTS = ["Mathematics", "Science", "English", "Social Studies", "Coding", "Art", "Music", "Physical Education"];

const KIND_LABELS = {
  feedback: "Parent Feedback",
  journal: "Student Journal",
  teacher_note: "Teacher Note",
  standalone: "Standalone",
};

export default function Sentiment() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [kind, setKind] = useState("standalone");
  const [subjectName, setSubjectName] = useState("");
  const [subject, setSubject] = useState("");
  const [age, setAge] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [persist, setPersist] = useState(true);
  const [records, setRecords] = useState([]);
  const [filterKind, setFilterKind] = useState("all");

  // Configure available kinds per role
  const availableKinds = (() => {
    if (user.role === "parent") return ["standalone", "feedback", "journal"];
    if (user.role === "teacher") return ["standalone", "teacher_note", "journal"];
    return ["standalone", "feedback", "journal", "teacher_note"]; // principal
  })();

  const loadRecords = async () => {
    try {
      const params = filterKind === "all" ? {} : { kind: filterKind };
      const { data } = await api.get("/sentiment/records", { params });
      setRecords(data);
    } catch (e) {
      // silent
    }
  };

  useEffect(() => { loadRecords(); }, [filterKind]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const extras = (subject && age) ? { subject, age: Number(age) } : {};
    try {
      if (persist && kind !== "standalone") {
        const { data } = await api.post("/sentiment/records", {
          kind, text, subject_name: subjectName || null, ...extras,
        });
        setResult(data.result);
        toast.success("Saved & analyzed");
        loadRecords();
      } else {
        const { data } = await api.post("/sentiment/analyze", { text, ...extras });
        setResult(data);
        toast.success("Analysis ready");
      }
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setLoading(false);
    }
  };

  const removeRecord = async (id) => {
    try {
      await api.delete(`/sentiment/records/${id}`);
      toast.success("Record removed");
      loadRecords();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
  };

  const presets = {
    parent: "My daughter has been so excited about her science class this week. She came home today and immediately set up a little experiment with cups and water without anyone asking her to.",
    teacher: "The student is participating actively but seems anxious during math drills. Their handwriting has improved, and they share materials willingly with peers.",
    principal: "Overall feedback from term 2 is mixed: families appreciate the new digital portal but some are frustrated with the limited evening tech support.",
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.22em] font-bold text-indigo-600 mb-1">Sentiment lab</div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900" data-testid="sentiment-page-title">
            Sentiment Analyzer
          </h1>
          <p className="text-slate-600 mt-1 text-sm max-w-3xl">
            Hybrid lexicon + ML analyzer based on <span className="font-bold">Tiwari (2024) — "Sentimental Analysis approach to improve teaching and learning in primary education"</span>. NRC 8-emotion lexicon, aspect-based categories, polarity, Likert (0–5) and satisfaction/dissatisfaction scoring.
          </p>
        </div>

        <Tabs defaultValue="analyzer" className="space-y-6">
          <TabsList className="rounded-full bg-white border border-slate-200 p-1 h-auto">
            <TabsTrigger value="analyzer" className="rounded-full font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-5 py-2" data-testid="sentiment-tab-analyzer">Analyze</TabsTrigger>
            <TabsTrigger value="history" className="rounded-full font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-5 py-2" data-testid="sentiment-tab-history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="analyzer">
            <div className="grid lg:grid-cols-5 gap-6">
              <Card className="rounded-3xl p-6 bg-white border-slate-100 lg:col-span-2" data-testid="sentiment-form-card">
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Type</Label>
                    <Select value={kind} onValueChange={setKind}>
                      <SelectTrigger className="rounded-xl bg-white" data-testid="sentiment-kind-select"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {availableKinds.map((k) => (
                          <SelectItem key={k} value={k}>{KIND_LABELS[k]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(kind === "journal" || kind === "teacher_note") && (
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Student / subject name</Label>
                      <Input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="rounded-xl bg-white" placeholder="e.g., Aanya, Grade 4" data-testid="sentiment-subject-input" />
                    </div>
                  )}

                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
                    <div className="text-xs uppercase tracking-widest font-bold text-amber-700">Optional · subject-specific recommendations</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-600">Subject</Label>
                        <Select value={subject} onValueChange={setSubject}>
                          <SelectTrigger className="rounded-xl bg-white" data-testid="sentiment-rec-subject-select"><SelectValue placeholder="None" /></SelectTrigger>
                          <SelectContent>
                            {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-600">Child age</Label>
                        <Input type="number" min={3} max={18} value={age} onChange={(e) => setAge(e.target.value)} className="rounded-xl bg-white" placeholder="8" data-testid="sentiment-rec-age-input" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">When both filled, we'll attach age-appropriate books, links and activities for that subject.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Text to analyze</Label>
                    <Textarea
                      required
                      minLength={3}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={7}
                      className="rounded-xl bg-white"
                      placeholder="Paste feedback, journal entry, or notes…"
                      data-testid="sentiment-text-input"
                    />
                    <button type="button" onClick={() => setText(presets[user.role] || presets.parent)} className="text-xs text-sky-600 hover:underline font-bold" data-testid="sentiment-load-sample">Load sample text</button>
                  </div>

                  {kind !== "standalone" && (
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={persist} onChange={(e) => setPersist(e.target.checked)} className="rounded" data-testid="sentiment-persist-toggle" />
                      Save to my history
                    </label>
                  )}

                  <Button type="submit" disabled={loading} className="w-full rounded-full bg-indigo-600 hover:bg-indigo-500 font-bold py-6 btn-lift" data-testid="sentiment-analyze-btn">
                    {loading ? (<><Loader2 className="animate-spin mr-2" size={16} /> Analyzing…</>) : (<><Sparkles className="mr-2" size={16} strokeWidth={2.5} /> Analyze sentiment</>)}
                  </Button>
                </form>
              </Card>

              <div className="lg:col-span-3">
                {result ? (
                  <SentimentResultCard result={result} testid="sentiment-result-main" />
                ) : (
                  <Card className="rounded-3xl p-10 bg-white border-slate-100 h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
                      <Activity className="text-indigo-600" size={28} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Analyze any educational text</h3>
                    <p className="text-sm text-slate-600 max-w-sm">Submit text on the left to see polarity, NRC emotions, satisfaction scores, and aspect-based categories grounded in Tiwari (2024).</p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="rounded-3xl p-6 bg-white border-slate-100" data-testid="sentiment-history-card">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <h3 className="text-xl font-bold text-slate-900">My records {user.role === "principal" && "(school-wide)"}</h3>
                <Select value={filterKind} onValueChange={setFilterKind}>
                  <SelectTrigger className="w-[200px] rounded-xl bg-white" data-testid="sentiment-history-filter"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="feedback">Parent Feedback</SelectItem>
                    <SelectItem value="journal">Student Journal</SelectItem>
                    <SelectItem value="teacher_note">Teacher Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {records.length === 0 ? (
                <div className="text-center text-slate-500 py-14">
                  No records yet. Analyzed entries you save will appear here.
                </div>
              ) : (
                <div className="space-y-4">
                  {records.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-slate-200 p-4" data-testid={`sentiment-record-${r.id}`}>
                      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold px-3 py-1">{KIND_LABELS[r.kind] || r.kind}</span>
                          {r.subject_name && <span className="text-slate-600">· {r.subject_name}</span>}
                          <span className="text-slate-500">· by {r.user_name} ({r.user_role})</span>
                          <span className="text-slate-400">· {new Date(r.created_at).toLocaleString()}</span>
                        </div>
                        {(user.role === "principal" || r.user_id === user.id) && (
                          <Button variant="ghost" size="sm" onClick={() => removeRecord(r.id)} className="rounded-full" data-testid={`sentiment-record-delete-${r.id}`}>
                            <Trash2 size={14} className="text-red-500" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-slate-800 mb-3 italic">"{r.text}"</p>
                      <SentimentResultCard result={r.result} compact testid={`sentiment-result-${r.id}`} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
