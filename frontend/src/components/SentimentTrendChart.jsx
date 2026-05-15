import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Activity, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Line, LineChart } from "recharts";

const KIND_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "feedback", label: "Parent feedback" },
  { value: "journal", label: "Student journal" },
  { value: "teacher_note", label: "Teacher note" },
  { value: "standalone", label: "Standalone" },
];

export default function SentimentTrendChart({ showChildFilter = false }) {
  const [days, setDays] = useState("30");
  const [kind, setKind] = useState("all");
  const [childId, setChildId] = useState("all");
  const [children, setChildren] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!showChildFilter) return;
    api.get("/children").then((r) => setChildren(r.data || [])).catch(() => {});
  }, [showChildFilter]);

  useEffect(() => {
    let cancelled = false;
    const params = { days: Number(days) };
    if (kind !== "all") params.kind = kind;
    if (childId !== "all") params.child_id = childId;
    api.get(`/sentiment/trend`, { params })
      .then((r) => { if (!cancelled) setData(r.data.series || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [days, kind, childId]);

  const formatTick = (d) => {
    const dt = new Date(d);
    return `${dt.toLocaleString("default", { month: "short" })} ${dt.getDate()}`;
  };

  return (
    <Card className="rounded-3xl p-6 bg-white border-slate-100" data-testid="sentiment-trend-card">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <TrendingUp className="text-emerald-600" size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Sentiment trend over time</h3>
            <p className="text-xs text-slate-500">Daily volume by polarity · Dr Bhawna Tiwari</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger className="w-[160px] rounded-full bg-white" data-testid="trend-kind-select"><SelectValue /></SelectTrigger>
            <SelectContent>
              {KIND_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {showChildFilter && children.length > 0 && (
            <Select value={childId} onValueChange={setChildId}>
              <SelectTrigger className="w-[160px] rounded-full bg-white" data-testid="trend-child-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All children</SelectItem>
                {children.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[140px] rounded-full bg-white" data-testid="trend-range-select"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="neuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="mixGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tickFormatter={formatTick} fontSize={12} />
            <YAxis allowDecimals={false} fontSize={12} />
            <Tooltip labelFormatter={formatTick} />
            <Legend />
            <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="url(#posGrad)" name="Positive" />
            <Area type="monotone" dataKey="neutral" stackId="1" stroke="#94a3b8" fill="url(#neuGrad)" name="Neutral" />
            <Area type="monotone" dataKey="mixed" stackId="1" stroke="#f59e0b" fill="url(#mixGrad)" name="Mixed" />
            <Area type="monotone" dataKey="negative" stackId="1" stroke="#f43f5e" fill="url(#negGrad)" name="Negative" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-500 mb-3">
          <Activity size={12} strokeWidth={2.5} /> Avg Likert score (0-5)
        </div>
        <div style={{ width: "100%", height: 140 }}>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tickFormatter={formatTick} fontSize={11} />
              <YAxis domain={[0, 5]} fontSize={11} />
              <Tooltip labelFormatter={formatTick} />
              <Line type="monotone" dataKey="avg_likert" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} name="Avg Likert" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data.every((d) => d.total === 0) && (
        <div className="text-center text-sm text-slate-500 mt-3" data-testid="trend-empty">No sentiment records in this range yet.</div>
      )}
    </Card>
  );
}
