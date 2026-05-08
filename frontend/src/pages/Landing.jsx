import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Sparkles, Users, GraduationCap, ShieldCheck, BookOpen, Stars, ArrowRight, Compass } from "lucide-react";

const HERO = "https://images.unsplash.com/photo-1765223085025-0405fcfbb338?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwzfHxraWQlMjByZWFkaW5nJTIwYm9vayUyMGVkdWNhdGlvbnxlbnwwfHx8fDE3NzgyMzY0MzB8MA&ixlib=rb-4.1.0&q=85";

const ROLES = [
  { key: "parent", title: "Parent", desc: "Discover your child's niche, get age-fit books & activities.", icon: Users, accent: "from-sky-500 to-cyan-400" },
  { key: "teacher", title: "Teacher", desc: "Manage students and share curated learning content.", icon: GraduationCap, accent: "from-amber-500 to-orange-400" },
  { key: "principal", title: "Principal", desc: "School-wide analytics and oversight, all in one place.", icon: ShieldCheck, accent: "from-indigo-500 to-violet-500" },
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
              Find your child's <span className="shimmer-text">cosmic niche</span>,
              <br />then nurture it with the right books.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              EDUSENSE blends western astrology with age-appropriate book recommendations, curated learning links and hands-on activities — for parents, teachers and principals.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button className="rounded-full bg-sky-500 hover:bg-sky-400 text-white font-bold px-7 py-6 text-base btn-lift shadow-md" data-testid="hero-get-started-btn">
                  Get Started <ArrowRight className="ml-1.5" size={18} strokeWidth={2.5} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="rounded-full font-bold px-7 py-6 text-base border-slate-300" data-testid="hero-signin-btn">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2"><Stars size={16} className="text-indigo-500" strokeWidth={2.5} /> Western astrology niche finder</div>
              <div className="flex items-center gap-2"><BookOpen size={16} className="text-sky-500" strokeWidth={2.5} /> Age-appropriate books & links</div>
              <div className="flex items-center gap-2"><Compass size={16} className="text-amber-600" strokeWidth={2.5} /> Subject-wise activities</div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-sky-200 to-amber-200 rounded-[2.5rem] blur-2xl opacity-60" />
              <div className="relative rounded-[2rem] overflow-hidden border border-amber-200 shadow-xl bg-white">
                <img src={HERO} alt="Child reading" className="w-full h-[440px] object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-amber-100 animate-float hidden md:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center"><Stars className="text-white" size={18} strokeWidth={2.5} /></div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's insight</div>
                  <div className="font-bold text-slate-900">Curiosity peaks at 7pm</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.22em] font-bold text-sky-600 mb-3">Three doors, one journey</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">A login crafted for everyone in the school</h2>
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

      {/* ASTROLOGY TEASER */}
      <section className="cosmic-bg text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] font-bold text-indigo-300 mb-4">Western Astrology</div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                Where the stars meet <span className="text-yellow-400 font-script text-5xl md:text-7xl">a child's calling</span>.
              </h2>
              <p className="mt-6 text-indigo-100/80 max-w-lg leading-relaxed">
                Enter your child's name, birth place and time. Our AI-guided western astrology lens reveals their natural niche — and you can connect on WhatsApp for a deeper, personalised reading.
              </p>
              <div className="mt-8">
                <Link to="/register?role=parent">
                  <Button className="rounded-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold px-7 py-6 text-base btn-lift" data-testid="astrology-cta-btn">
                    Find My Child's Niche <Stars className="ml-2" size={18} strokeWidth={2.5} />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="glass rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center">
                  <Stars className="text-yellow-400" size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-indigo-300 font-bold">Sample Reading</div>
                  <div className="font-bold">A Gemini child, age 9</div>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-indigo-500/20 pb-3">
                  <span className="text-indigo-300">Niche</span>
                  <span className="font-bold text-yellow-400">Curious Communicator</span>
                </div>
                <div className="flex justify-between border-b border-indigo-500/20 pb-3">
                  <span className="text-indigo-300">Traits</span>
                  <span className="font-bold">Quick-witted, social, adaptable</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-300">Career paths</span>
                  <span className="font-bold">Writer, journalist, designer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-amber-50 border-t border-amber-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center"><Sparkles className="text-white" size={14} strokeWidth={2.5} /></div>
            <span className="font-bold text-slate-900">EDUSENSE</span>
            <span className="text-slate-400">·</span>
            <span>by Codeanapple</span>
          </div>
          <div>© {new Date().getFullYear()} EDUSENSE. Crafted with curiosity.</div>
        </div>
      </footer>
    </div>
  );
}
