import React from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { HeartHandshake, Brain, Smile, Sparkles, Users, TrendingUp, Target } from "lucide-react";

export default function BehaviourScopeCard({ scope, testid = "behaviour-scope-card" }) {
  if (!scope) return null;
  return (
    <Card className="rounded-3xl p-7 lg:p-10 bg-white border-amber-100 shadow-xl" data-testid={testid}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
          <HeartHandshake size={22} strokeWidth={2.5} className="text-white" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.22em] font-bold text-pink-600">Behaviour scope</div>
          <h3 className="text-2xl font-bold text-slate-900">A parent's compass</h3>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl bg-amber-50/60 border border-amber-100 p-4">
          <div className="flex items-center gap-2 text-amber-700 text-xs uppercase tracking-widest font-bold mb-2"><Users size={14} strokeWidth={2.5} /> Social</div>
          <p className="text-sm text-slate-800 leading-relaxed" data-testid="bs-social">{scope.social_style || "-"}</p>
        </div>
        <div className="rounded-2xl bg-sky-50/60 border border-sky-100 p-4">
          <div className="flex items-center gap-2 text-sky-700 text-xs uppercase tracking-widest font-bold mb-2"><Smile size={14} strokeWidth={2.5} /> Emotional</div>
          <p className="text-sm text-slate-800 leading-relaxed" data-testid="bs-emotional">{scope.emotional_pattern || "-"}</p>
        </div>
        <div className="rounded-2xl bg-indigo-50/60 border border-indigo-100 p-4">
          <div className="flex items-center gap-2 text-indigo-700 text-xs uppercase tracking-widest font-bold mb-2"><Brain size={14} strokeWidth={2.5} /> Learning</div>
          <p className="text-sm text-slate-800 leading-relaxed" data-testid="bs-learning">{scope.learning_style || "-"}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-500 mb-3"><TrendingUp size={14} strokeWidth={2.5} /> Behavioural traits</div>
          <div className="flex flex-wrap gap-2">
            {(scope.behavioural_traits || []).map((t, i) => (
              <Badge key={i} className="rounded-full bg-pink-100 text-pink-700 hover:bg-pink-100 border-pink-200 font-bold px-3 py-1.5">{t}</Badge>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-500 mb-3"><Sparkles size={14} strokeWidth={2.5} /> Strengths</div>
          <div className="flex flex-wrap gap-2">
            {(scope.strengths || []).map((s, i) => (
              <Badge key={i} className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 font-bold px-3 py-1.5">{s}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-500 mb-3"><Target size={14} strokeWidth={2.5} /> Growth areas</div>
        <div className="flex flex-wrap gap-2">
          {(scope.growth_areas || []).map((s, i) => (
            <Badge key={i} className="rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 font-bold px-3 py-1.5">{s}</Badge>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200/60 p-5">
        <div className="text-xs uppercase tracking-widest font-bold text-sky-700 mb-3">Parenting tips</div>
        <ul className="space-y-2" data-testid="bs-parenting-tips">
          {(scope.parenting_tips || []).map((tip, i) => (
            <li key={i} className="text-sm text-slate-800 flex items-start gap-2">
              <span className="text-sky-600 font-bold mt-0.5">{i + 1}.</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
