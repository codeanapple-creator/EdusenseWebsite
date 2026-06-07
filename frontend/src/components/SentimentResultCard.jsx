import React from "react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Smile, Frown, Meh, Activity, BookOpen, ExternalLink, Clock } from "lucide-react";

const SENTIMENT_STYLES = {
  positive: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", Icon: Smile },
  negative: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200", Icon: Frown },
  neutral: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200", Icon: Meh },
  mixed: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", Icon: Activity },
};

const NRC_LABELS = {
  anger: "Anger", anticipation: "Anticipation", disgust: "Disgust", fear: "Fear",
  joy: "Joy", sadness: "Sadness", surprise: "Surprise", trust: "Trust",
};

const ASPECT_LABELS = {
  happiness_index: "Happiness Index",
  active_participation: "Active Participation",
  sharing: "Sharing",
  self_initiation: "Self-Initiation",
  gross_motors: "Gross Motors",
  fine_motors_cognitive: "Fine Motors & Cognitive",
  behaviour: "Behaviour",
  learning: "Learning",
  teaching_effectiveness: "Teaching Effectiveness",
  course_content: "Course Content",
  instructor_quality: "Instructor Quality",
};

export default function SentimentResultCard({ result, compact = false, testid = "sentiment-result" }) {
  if (!result) return null;
  const style = SENTIMENT_STYLES[result.sentiment] || SENTIMENT_STYLES.neutral;
  const Icon = style.Icon;
  const aspects = Object.entries(result.aspects || {});
  const nrcEntries = Object.entries(result.nrc_emotions || {});

  return (
    <div className={`rounded-2xl border ${style.border} bg-white p-5 ${compact ? "" : "p-6"}`} data-testid={testid}>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl ${style.bg} flex items-center justify-center`}>
            <Icon size={22} strokeWidth={2.5} className={style.text} />
          </div>
          <div>
            <Badge className={`rounded-full ${style.bg} ${style.text} ${style.border} font-bold capitalize text-sm px-3 py-1`} data-testid="sentiment-label">
              {result.sentiment}
            </Badge>
            <div className="text-xs text-slate-500 mt-1">Confidence {Math.round((result.confidence || 0) * 100)}%</div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Polarity</div>
            <div className="font-bold text-slate-900" data-testid="sentiment-polarity">{(result.polarity_score ?? 0).toFixed(2)}</div>
          </div>
          <div className="rounded-xl bg-white border border-orange-200 px-3 py-1.5">
            <div className="text-[10px] uppercase tracking-widest text-orange-700 font-bold">Happiness score (0-5)</div>
            <div className="font-bold text-amber-900" data-testid="sentiment-likert">{(result.likert_score ?? 0).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {result.summary && <p className="text-sm text-slate-700 leading-relaxed mb-5" data-testid="sentiment-summary">{result.summary}</p>}

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-4">
          <div className="text-xs uppercase tracking-widest font-bold text-emerald-700 mb-2">Satisfaction</div>
          <div className="flex items-center gap-3">
            <Progress value={(result.satisfaction_score ?? 0) * 100} className="h-2 [&>div]:bg-emerald-500" />
            <span className="text-sm font-bold text-emerald-700 min-w-[3rem] text-right">{Math.round((result.satisfaction_score ?? 0) * 100)}%</span>
          </div>
        </div>
        <div className="rounded-xl bg-rose-50/60 border border-rose-100 p-4">
          <div className="text-xs uppercase tracking-widest font-bold text-rose-700 mb-2">Dissatisfaction</div>
          <div className="flex items-center gap-3">
            <Progress value={(result.dissatisfaction_score ?? 0) * 100} className="h-2 [&>div]:bg-rose-500" />
            <span className="text-sm font-bold text-rose-700 min-w-[3rem] text-right">{Math.round((result.dissatisfaction_score ?? 0) * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-3">The 8 feelings we picked up</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {nrcEntries.map(([k, v]) => (
            <div key={k} className="rounded-lg border border-slate-200 p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700">{NRC_LABELS[k] || k}</span>
                <span className="text-xs text-slate-500 font-bold">{Math.round(v * 100)}%</span>
              </div>
              <Progress value={v * 100} className="h-1.5 [&>div]:bg-[#0a1f5c]" />
            </div>
          ))}
        </div>
      </div>

      {aspects.length > 0 && (
        <div className="mb-5">
          <div className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-3">Aspect-Based Sentiment</div>
          <div className="flex flex-wrap gap-2">
            {aspects.map(([key, val]) => {
              const s = SENTIMENT_STYLES[val.sentiment] || SENTIMENT_STYLES.neutral;
              return (
                <div key={key} className={`rounded-full border ${s.border} ${s.bg} px-3 py-1.5 text-xs font-bold ${s.text} flex items-center gap-1.5`}>
                  {ASPECT_LABELS[key] || key}
                  <span className="opacity-70">· {(val.score ?? 0).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {result.key_themes?.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">Key themes</div>
          <div className="flex flex-wrap gap-2">
            {result.key_themes.map((t, i) => (
              <Badge key={i} className="rounded-full bg-orange-100 text-[#f97316] border-orange-200 font-bold">{t}</Badge>
            ))}
          </div>
        </div>
      )}

      {result.recommendations && (
        <div className="mt-6 pt-5 border-t border-slate-200" data-testid="sentiment-recommendations">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
              <BookOpen className="text-orange-600" size={16} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-orange-700">Recommended · {result.recommendations.subject} · Age {result.recommendations.age}</div>
              <div className="font-bold text-slate-900 text-sm">Books, links & activities tailored to this analysis</div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-[#f97316] mb-2 flex items-center gap-1.5"><BookOpen size={12} strokeWidth={2.5} /> Books</div>
              <ul className="space-y-2">
                {result.recommendations.books.map((b, i) => (
                  <li key={i} className="bg-white/60 rounded-xl p-3 border border-orange-100" data-testid={`rec-book-${i}`}>
                    <div className="font-bold text-slate-900 text-sm">{b.title}</div>
                    <div className="text-xs text-slate-500 mb-1">{b.author}</div>
                    <div className="text-xs text-slate-700">{b.description}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-[#0a1f5c] mb-2 flex items-center gap-1.5"><ExternalLink size={12} strokeWidth={2.5} /> Links</div>
              <ul className="space-y-2">
                {result.recommendations.links.map((l, i) => (
                  <li key={i} className="bg-indigo-50/60 rounded-xl p-3 border border-indigo-100" data-testid={`rec-link-${i}`}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="font-bold text-[#0a1f5c] hover:underline inline-flex items-center gap-1 text-sm">{l.title} <ExternalLink size={11} /></a>
                    <div className="text-xs text-slate-700 mt-1">{l.description}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-orange-600 mb-2 flex items-center gap-1.5"><Activity size={12} strokeWidth={2.5} /> Activities</div>
              <ul className="space-y-2">
                {result.recommendations.activities.map((a, i) => (
                  <li key={i} className="bg-sky-50/60 rounded-xl p-3 border border-sky-100" data-testid={`rec-activity-${i}`}>
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="font-bold text-slate-900 text-sm">{a.title}</div>
                      <Badge className="rounded-full bg-orange-100 text-[#f97316] border-orange-200 font-bold text-[10px]"><Clock size={10} className="mr-0.5" /> {a.duration_minutes}m</Badge>
                    </div>
                    <div className="text-xs text-slate-700">{a.description}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
