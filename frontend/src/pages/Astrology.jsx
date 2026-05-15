import React, { useState } from "react";
import Navbar from "../components/Navbar";
import WhatsAppButton from "../components/WhatsAppButton";
import BehaviourScopeCard from "../components/BehaviourScopeCard";
import ShareScopeButton from "../components/ShareScopeButton";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import DatePicker from "../components/DatePicker";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import { Stars, Sparkles, Compass, Loader2, Languages } from "lucide-react";

export default function Astrology() {
  const [form, setForm] = useState({ name: "", place: "", date_of_birth: "", time_of_birth: "", language: "en" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post("/astrology/niche", form);
      setResult(data);
      toast.success("Your child's niche is ready!");
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      <section className="cosmic-bg relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-white">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-4 py-1.5 text-xs uppercase tracking-[0.22em] font-bold text-indigo-200 mb-5">
              <Stars size={14} strokeWidth={2.5} /> BehaviourScope™ Western Astrology · a Codeanapple product
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight">
              Decode your child's <span className="font-script text-yellow-400 text-5xl md:text-7xl">calling</span>.
            </h1>
            <p className="mt-4 text-indigo-100/80 max-w-2xl mx-auto">
              Enter the birth details below. Get niche, career paths, behavioural traits, learning style and concrete parenting tips — all in one reading.
            </p>
          </div>

          <div className="glass rounded-3xl p-7 md:p-10" data-testid="astrology-form-card">
            <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-indigo-200 text-xs uppercase tracking-widest font-bold">Child's name</Label>
                <Input required value={form.name} onChange={onChange("name")} className="bg-slate-900/60 border-indigo-500/30 text-white rounded-xl placeholder:text-indigo-300/50" placeholder="e.g., Aanya Sharma" data-testid="astro-name-input" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-indigo-200 text-xs uppercase tracking-widest font-bold">Place of birth</Label>
                <Input required value={form.place} onChange={onChange("place")} className="bg-slate-900/60 border-indigo-500/30 text-white rounded-xl placeholder:text-indigo-300/50" placeholder="City, Country" data-testid="astro-place-input" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-indigo-200 text-xs uppercase tracking-widest font-bold">Date of birth</Label>
                <DatePicker
                  value={form.date_of_birth}
                  onChange={(v) => setForm({ ...form, date_of_birth: v })}
                  placeholder="Select date of birth"
                  className="bg-slate-900/60 border-indigo-500/30 text-white hover:bg-slate-900/80 hover:text-white"
                  testid="astro-dob-input"
                  fromYear={1980}
                  toYear={new Date().getFullYear()}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-indigo-200 text-xs uppercase tracking-widest font-bold">Time of birth</Label>
                <Input required type="time" value={form.time_of_birth} onChange={onChange("time_of_birth")} className="bg-slate-900/60 border-indigo-500/30 text-white rounded-xl" data-testid="astro-tob-input" />
              </div>
              <div className="md:col-span-2 flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-indigo-500/30 bg-slate-900/40 px-4 py-3" data-testid="astro-language-toggle">
                <div className="flex items-center gap-2 text-indigo-200">
                  <Languages size={16} strokeWidth={2.5} />
                  <span className="text-xs uppercase tracking-widest font-bold">Reading language</span>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-slate-950/60 border border-indigo-500/30 p-1">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, language: "en" })}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${form.language === "en" ? "bg-yellow-400 text-slate-900" : "text-indigo-200 hover:text-white"}`}
                    data-testid="astro-lang-en"
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, language: "hi" })}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold tracking-wider transition-colors ${form.language === "hi" ? "bg-yellow-400 text-slate-900" : "text-indigo-200 hover:text-white"}`}
                    data-testid="astro-lang-hi"
                  >
                    हिंदी
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 mt-2">
                <Button type="submit" disabled={loading} className="w-full rounded-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold py-6 btn-lift" data-testid="astrology-submit-btn">
                  {loading ? (<><Loader2 className="animate-spin mr-2" size={18} /> Reading the stars…</>) : (<><Sparkles className="mr-2" size={18} strokeWidth={2.5} /> Reveal my child's niche</>)}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {result && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14" data-testid="astrology-result">
          <Card className="rounded-3xl p-8 lg:p-12 bg-white border-amber-100 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] font-bold text-sky-600 mb-1">Niche reading for</div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{result.name}</h2>
              </div>
              <Badge className="rounded-full bg-indigo-100 text-indigo-700 border-indigo-200 font-bold text-sm px-4 py-1.5" data-testid="astro-sun-sign">
                <Compass size={14} className="mr-1.5" strokeWidth={2.5} /> {result.sun_sign}
              </Badge>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-sky-50 border border-amber-200/60 rounded-2xl p-7 mb-7">
              <div className="text-xs uppercase tracking-widest font-bold text-amber-700 mb-2">Suggested niche</div>
              <div className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight" data-testid="astro-niche">{result.niche}</div>
              <p className="mt-4 text-slate-700 leading-relaxed" data-testid="astro-summary">{result.summary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <div className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-3">Key traits</div>
                <div className="flex flex-wrap gap-2">
                  {result.traits.map((t, i) => (
                    <Badge key={i} className="rounded-full bg-sky-100 text-sky-700 hover:bg-sky-100 border-sky-200 font-bold px-3 py-1.5">{t}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-3">Career paths to explore</div>
                <ul className="space-y-1.5">
                  {result.career_paths.map((c, i) => (
                    <li key={i} className="text-slate-800 flex items-center gap-2"><Stars size={14} className="text-yellow-500" strokeWidth={2.5} /> {c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-1">For a deeper, personalised reading</div>
                <div className="font-bold text-slate-900">Connect with our team on WhatsApp</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <ShareScopeButton result={result} />
                <WhatsAppButton link={result.whatsapp_link} label={`Chat on WhatsApp ${result.whatsapp_number}`} />
              </div>
            </div>
          </Card>

          {/* Behaviour scope card */}
          <div className="mt-8">
            <BehaviourScopeCard scope={result.behaviour_scope} />
          </div>
        </section>
      )}
    </div>
  );
}
