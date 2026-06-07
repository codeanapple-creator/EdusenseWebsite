import React from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Stars, Sparkles, Compass, HeartHandshake } from "lucide-react";

export default function SampleReadingCard({ reading, testid }) {
  return (
    <Card className="rounded-3xl p-6 bg-white border-slate-100 hover:shadow-xl transition-shadow relative overflow-hidden" data-testid={testid}>
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${reading.accent} opacity-20 blur-2xl`} />
      <div className="flex items-center justify-between mb-4 relative">
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${reading.accent} flex items-center justify-center shadow-md`}>
          <Stars size={20} strokeWidth={2.5} className="text-white" />
        </div>
        <Badge className="rounded-full bg-slate-100 text-slate-700 border-slate-200 font-bold text-xs" data-testid={`${testid}-sign`}>
          {reading.sign} · {reading.sun_sign_dates}
        </Badge>
      </div>

      <div className="text-xs uppercase tracking-widest font-bold text-[#0a1f5c] mb-1">Niche · age {reading.age}</div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4" data-testid={`${testid}-niche`}>{reading.niche}</h3>

      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Sparkles size={10} strokeWidth={2.5} /> Traits</div>
        <div className="flex flex-wrap gap-1.5">
          {reading.traits.map((t, i) => (
            <Badge key={i} className="rounded-full bg-orange-100 text-[#f97316] hover:bg-orange-100 border-orange-200 font-bold text-xs">{t}</Badge>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Compass size={10} strokeWidth={2.5} /> Career paths</div>
        <p className="text-sm text-slate-700">{reading.careers.join(" · ")}</p>
      </div>

      <div className="rounded-xl bg-white/60 border border-orange-100 p-3 mb-4">
        <div className="text-[10px] uppercase tracking-widest font-bold text-orange-700 mb-1">Learning style</div>
        <p className="text-sm text-slate-800 leading-snug">{reading.learning_style}</p>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-orange-200/60 p-3">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-[#f97316] mb-1"><HeartHandshake size={11} strokeWidth={2.5} /> Parenting tip</div>
        <p className="text-sm text-slate-800 leading-snug font-medium">{reading.parenting_tip}</p>
      </div>
    </Card>
  );
}
