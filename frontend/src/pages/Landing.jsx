import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Sparkles, Users, GraduationCap, ShieldCheck, BookOpen, Stars, ArrowRight, Compass, HeartHandshake, Activity, ScrollText } from "lucide-react";
import SampleReadingCard from "../components/SampleReadingCard";
import { SAMPLE_READINGS } from "../lib/sampleReadings";

const HERO = "https://images.unsplash.com/photo-1765223085025-0405fcfbb338?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwzfHxraWQlMjByZWFkaW5nJTIwYm9vayUyMGVkdWNhdGlvbnxlbnwwfHx8fDE3NzgyMzY0MzB8MA&ixlib=rb-4.1.0&q=85";

const PRODUCTS = [
  {
    key: "behaviourscope",
    flagship: true,
    title: "BehaviourScope™ Western Astrology",
    tagline: "A parent's compass — niche × behaviour × parenting",
    desc: "Enter your child's name, place and birth-time. Get their sun-sign, AI-suggested niche, career paths, behavioural traits, social/emotional/learning style and concrete parenting tips.",
    icon: Stars,
    accent: "from-indigo-600 via-violet-500 to-pink-500",
    cta: "Explore BehaviourScope",
    href: "/products/behaviourscope",
    testid: "product-behaviourscope",
  },
  {
    key: "sentiment",
    title: "Sentiment Lab",
    tagline: "Dr Bhawna Tiwari's methodology in your pocket",
    desc: "Decode parent feedback, student journals and teacher notes with NRC 8-emotion lexicon, polarity, Likert scoring and aspect-based categories from primary-education research.",
    icon: Activity,
    accent: "from-emerald-500 to-sky-500",
    cta: "Open Sentiment Lab",
    href: "/sentiment",
    testid: "product-sentiment",
  },
  {
    key: "curator",
    title: "Education Curator",
    tagline: "Age-appropriate books · links · activities",
    desc: "AI-curated reading lists, vetted learning links and hands-on activities — by subject and age — for every child in your care.",
    icon: BookOpen,
    accent: "from-amber-500 to-orange-400",
    cta: "Pick recommendations",
    href: "/dashboard",
    testid: "product-curator",
  },
];

const ROLES = [
  { key: "parent", title: "Parent", desc: "Discover your child's niche, behaviour scope, books & activities.", icon: Users, accent: "from-sky-500 to-cyan-400" },
  { key: "teacher", title: "Teacher", desc: "Manage students and capture sentiment-tagged classroom notes.", icon: GraduationCap, accent: "from-amber-500 to-orange-400" },
  { key: "principal", title: "Principal", desc: "School-wide analytics, sentiment trends and Pro plan controls.", icon: ShieldCheck, accent: "from-indigo-500 to-violet-500" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-amber-50 grid-pattern">
      <Navbar />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7" data-testid="hero-content">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-amber-200 px-3 py-1 text-xs uppercase tracking-widest font-bold text-amber-700 mb-6">
              <Sparkles size={14} strokeWidth={2.5} /> EDUSENSE • by Codeanapple
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 leading-[1.05]">
              <span className="shimmer-text">BehaviourScope™</span> — for the primary years.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              EDUSENSE blends <b>western astrology</b> with <b>research-backed sentiment analysis</b> by <b>Dr Bhawna Tiwari</b> to help parents, teachers and principals see <i>who the child really is</i> — and then nurture it with the right books, links and activities.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register?role=parent">
                <Button className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-7 py-6 text-base btn-lift shadow-md" data-testid="hero-get-started-btn">
                  Try BehaviourScope <ArrowRight className="ml-1.5" size={18} strokeWidth={2.5} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="rounded-full font-bold px-7 py-6 text-base border-slate-300" data-testid="hero-signin-btn">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2"><Stars size={16} className="text-indigo-500" strokeWidth={2.5} /> Western-astrology niche + behaviour scope</div>
              <div className="flex items-center gap-2"><ScrollText size={16} className="text-emerald-600" strokeWidth={2.5} /> NRC 8-emotion lexicon · Dr Bhawna Tiwari</div>
              <div className="flex items-center gap-2"><Compass size={16} className="text-amber-600" strokeWidth={2.5} /> Subject-tied activity recommendations</div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-indigo-200 via-pink-200 to-amber-200 rounded-[2.5rem] blur-2xl opacity-60" />
              <div className="relative rounded-[2rem] overflow-hidden border border-amber-200 shadow-xl bg-white">
                <img src={HERO} alt="Child reading" className="w-full h-[440px] object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-amber-100 animate-float hidden md:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-pink-500 flex items-center justify-center"><HeartHandshake className="text-white" size={18} strokeWidth={2.5} /></div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parent's compass</div>
                  <div className="font-bold text-slate-900">BehaviourScope™</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="products-section">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.22em] font-bold text-indigo-600 mb-3">The EDUSENSE product suite</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Three products, one daily ritual.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PRODUCTS.map((p) => {
            const Icon = p.icon;
            return (
              <Card
                key={p.key}
                className={`relative rounded-3xl p-7 border-slate-100 hover:shadow-xl transition-shadow bg-white overflow-hidden ${p.flagship ? "md:scale-[1.02] ring-2 ring-indigo-300" : ""}`}
                data-testid={p.testid}
              >
                {p.flagship && (
                  <Badge className="absolute top-4 right-4 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 text-white border-0 font-bold uppercase tracking-widest text-[10px]" data-testid="flagship-badge">
                    Flagship
                  </Badge>
                )}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.accent} flex items-center justify-center mb-5 shadow-md`}>
                  <Icon size={22} strokeWidth={2.5} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1 text-slate-900">{p.title}</h3>
                <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">{p.tagline}</div>
                <p className="text-slate-600 text-sm leading-relaxed mb-5">{p.desc}</p>
                <Link to={p.href}>
                  <Button variant="outline" className="rounded-full font-bold border-slate-300" data-testid={`${p.testid}-cta`}>
                    {p.cta} <ArrowRight size={16} className="ml-1.5" strokeWidth={2.5} />
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      </section>

      {/* SAMPLE READINGS GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14" data-testid="sample-readings-gallery">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] font-bold text-amber-700 mb-3">Sample BehaviourScope™ readings</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Three children. Three compasses.</h2>
            <p className="text-slate-600 mt-2 text-sm max-w-xl">A peek at what every BehaviourScope™ reading delivers — niche, traits, learning style and a concrete parenting tip.</p>
          </div>
          <Link to="/products/behaviourscope">
            <Button variant="outline" className="rounded-full font-bold border-slate-300" data-testid="see-all-readings-cta">
              See the full product <ArrowRight size={16} className="ml-1.5" strokeWidth={2.5} />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {SAMPLE_READINGS.map((r) => (
            <SampleReadingCard key={r.sign} reading={r} testid={`landing-sample-${r.sign.toLowerCase()}`} />
          ))}
        </div>
      </section>

      {/* BEHAVIOURSCOPE COSMIC TEASER */}
      <section className="cosmic-bg text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-4 py-1.5 text-xs uppercase tracking-[0.25em] font-bold text-indigo-200 mb-5">
                <Stars size={14} strokeWidth={2.5} /> BehaviourScope™ Western Astrology
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                Where the stars meet <span className="text-yellow-400 font-script text-5xl md:text-7xl">a child's calling</span>.
              </h2>
              <p className="mt-6 text-indigo-100/80 max-w-lg leading-relaxed">
                Birth-chart-driven niche + behaviour scope: behavioural traits, social style, emotional pattern, learning style, growth areas, and 4–6 concrete parenting tips you can use this week.
              </p>
              <div className="mt-8">
                <Link to="/register?role=parent">
                  <Button className="rounded-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold px-7 py-6 text-base btn-lift" data-testid="astrology-cta-btn">
                    Generate my child's scope <Stars className="ml-2" size={18} strokeWidth={2.5} />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="glass rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center">
                  <HeartHandshake className="text-pink-300" size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-indigo-300 font-bold">Sample reading</div>
                  <div className="font-bold">A Gemini child, age 9</div>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-indigo-500/20 pb-3">
                  <span className="text-indigo-300">Niche</span>
                  <span className="font-bold text-yellow-400">Curious Communicator</span>
                </div>
                <div className="flex justify-between border-b border-indigo-500/20 pb-3">
                  <span className="text-indigo-300">Learning style</span>
                  <span className="font-bold">Visual + verbal pairings</span>
                </div>
                <div className="flex justify-between border-b border-indigo-500/20 pb-3">
                  <span className="text-indigo-300">Growth area</span>
                  <span className="font-bold">Sustained focus</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-300">Parenting tip</span>
                  <span className="font-bold text-right text-yellow-200">Set 20-min "deep dive" rituals</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METHODOLOGY STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14" data-testid="methodology-strip">
        <Card className="rounded-3xl p-7 lg:p-10 bg-gradient-to-br from-emerald-50 via-white to-sky-50 border-emerald-100">
          <div className="grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center"><ScrollText className="text-white" size={26} strokeWidth={2.5} /></div>
            </div>
            <div className="md:col-span-7">
              <div className="text-xs uppercase tracking-widest font-bold text-emerald-700 mb-2">Built on peer-reviewed research</div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2">Sentiment Lab implements Dr Bhawna Tiwari's thesis.</h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                <i>"Sentimental Analysis approach to improve teaching and learning in primary education"</i> — NRC 8-emotion lexicon (anger, anticipation, disgust, fear, joy, sadness, surprise, trust), 3-class polarity + mixed, Likert (0–5), and 8 aspect categories (Happiness Index, Active Participation, Sharing, Self-initiation, Gross/Fine Motors, Behaviour, Learning).
              </p>
            </div>
            <div className="md:col-span-3 flex md:justify-end">
              <Link to="/sentiment">
                <Button variant="outline" className="rounded-full font-bold border-emerald-300 text-emerald-700 hover:bg-emerald-50" data-testid="methodology-cta">
                  Open the lab <ArrowRight size={16} className="ml-1.5" strokeWidth={2.5} />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* ROLES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.22em] font-bold text-sky-600 mb-3">Three doors, one journey</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">A login crafted for everyone in the school.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <Card key={r.key} className="rounded-3xl p-7 border-slate-100 hover:shadow-lg transition-shadow bg-white" data-testid={`role-card-${r.key}`}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${r.accent} flex items-center justify-center mb-5 shadow-md`}>
                  <Icon size={22} strokeWidth={2.5} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">{r.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-5">{r.desc}</p>
                <Link to={`/register?role=${r.key}`}>
                  <Button variant="outline" className="rounded-full font-bold border-slate-300" data-testid={`role-cta-${r.key}`}>
                    Sign up as {r.title} <ArrowRight size={16} className="ml-1.5" strokeWidth={2.5} />
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-amber-50 border-t border-amber-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <img src="/codeanapple-logo.png" alt="Code An Apple" className="w-8 h-8 rounded-lg object-cover bg-slate-900" data-testid="footer-logo" />
            <span className="font-bold text-slate-900">EDUSENSE</span>
            <span className="text-slate-400">·</span>
            <span>by Code An Apple</span>
            <span className="text-slate-400 hidden sm:inline">·</span>
            <span className="hidden sm:inline text-xs text-slate-500">Sentiment research by Dr Bhawna Tiwari</span>
          </div>
          <div>© {new Date().getFullYear()} EDUSENSE. Crafted with curiosity.</div>
        </div>
      </footer>
    </div>
  );
}
