import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import SampleReadingCard from "../components/SampleReadingCard";
import { SAMPLE_READINGS } from "../lib/sampleReadings";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Compass,
  Activity,
  BookOpen,
  ScrollText,
  Stars,
  GraduationCap,
  Users,
  Quote,
  MessageCircle,
  ShieldCheck,
  Crown,
  Clock,
  Heart,
} from "lucide-react";

const WHATSAPP_NUMBER = "+919999999999";
const WHATSAPP_TEXT = encodeURIComponent(
  "Hi! I'd like a free Edusense consultation for my child / school."
);
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${WHATSAPP_TEXT}`;

const STEPS = [
  {
    icon: Compass,
    title: "Tell us about your child",
    desc: "Name, place and time of birth - 30 seconds. No login needed for a sample.",
  },
  {
    icon: Sparkles,
    title: "Get the BehaviourScope™",
    desc: "Instant niche, behaviour traits, learning style, and 4-6 parenting tips - in plain English or हिंदी.",
  },
  {
    icon: BookOpen,
    title: "Act on it weekly",
    desc: "Subject-tied books, links and activities curated for your child's age. Track feelings with Sentiment Lab.",
  },
];

const TESTIMONIALS = [
  {
    name: "Shilpa N.",
    role: "Parent · Bengaluru",
    quote:
      "The behaviour scope nailed my daughter's 'needs to talk it out' learning style. The parenting tips alone saved me three months of trial-and-error.",
    accent: "bg-[#0a1f5c]",
  },
  {
    name: "Rohit P.",
    role: "Father of 2 · Pune",
    quote:
      "Finally an app that doesn't just tell me my child's marks. It tells me who he is and what to do about it.",
    accent: "bg-[#f97316]",
  },
  {
    name: "Mrs. Anita Kulkarni",
    role: "Principal · Nashik",
    quote:
      "Sentiment Lab gave us a feelings-radar on the whole school. We caught burnout in two teachers before it spread. Worth every rupee.",
    accent: "bg-[#0a1f5c]",
  },
];

const FAQS = [
  {
    q: "Is Edusense a substitute for child psychology?",
    a: "No. BehaviourScope™ is a western-astrology lens designed to spark reflection, not diagnose. For clinical concerns, please consult a qualified child psychologist.",
  },
  {
    q: "Who is this for - parents or schools?",
    a: "Both. Parents get free unlimited BehaviourScope™ readings for their first child plus subject-tied recommendations. Schools (Pro plan ₹1,499/month) unlock unlimited students, school-wide sentiment analytics and priority WhatsApp support.",
  },
  {
    q: "What languages are supported?",
    a: "English and हिंदी today. Marathi is on the roadmap.",
  },
  {
    q: "How is this 'research-backed'?",
    a: "Our Sentiment Lab implements the methodology from Dr Bhawna Tiwari's PhD thesis 'Sentimental Analysis approach to improve teaching and learning in primary education' - 8 NRC emotions, polarity, a 0-5 happiness score, and 8 aspect categories tuned for primary-school children.",
  },
  {
    q: "Is my child's data safe?",
    a: "Yes. Birth details are stored only against your account. We don't share or sell child data. You can delete any reading from your dashboard at any time.",
  },
  {
    q: "Can I try before I buy?",
    a: "Yes - the Free plan supports 1 child and unlimited BehaviourScope™ readings forever. No credit card needed.",
  },
];

const STATS = [
  { value: "60 sec", label: "to first reading" },
  { value: "₹0", label: "for parents to start" },
  { value: "EN + हिंदी", label: "languages live" },
  { value: "Dr Tiwari", label: "research-backed" },
];

export default function EdusensePromo() {
  useEffect(() => {
    document.title = "Edusense - The compass for the primary years | edusense.co.in";
    const desc =
      "Edusense by Code an Apple. BehaviourScope™ western astrology + research-backed sentiment lab. For parents, teachers and principals. Free for the first child.";
    let m = document.querySelector('meta[name="description"]');
    if (!m) {
      m = document.createElement("meta");
      m.name = "description";
      document.head.appendChild(m);
    }
    m.setAttribute("content", desc);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900" data-testid="edusense-promo-page">
      {/* TOP NAV (minimal, no logout/dashboard - this is a marketing page) */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group" data-testid="promo-brand-link">
            <img
              src="/edusense-logo.png"
              alt="Edusense by Code an Apple"
              className="w-11 h-11 object-contain group-hover:scale-105 transition-transform"
            />
            <div className="leading-tight">
              <div className="font-extrabold text-lg tracking-tight text-[#0a1f5c]">Edusense</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">by Code an Apple</div>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <a href="#parents" className="hidden md:inline-flex">
              <Button variant="ghost" className="rounded-full font-bold text-slate-700">For Parents</Button>
            </a>
            <a href="#schools" className="hidden md:inline-flex">
              <Button variant="ghost" className="rounded-full font-bold text-slate-700">For Schools</Button>
            </a>
            <a href="#pricing" className="hidden md:inline-flex">
              <Button variant="ghost" className="rounded-full font-bold text-slate-700">Pricing</Button>
            </a>
            <Link to="/login">
              <Button variant="outline" className="rounded-full font-bold border-slate-300" data-testid="promo-signin-btn">
                Sign in
              </Button>
            </Link>
            <Link to="/register?role=parent">
              <Button className="rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold btn-lift" data-testid="promo-getstarted-btn">
                Get started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-orange-50/40 to-blue-50/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-orange-200 px-4 py-1.5 text-xs uppercase tracking-[0.22em] font-bold text-orange-700 shadow-sm mb-6" data-testid="promo-eyebrow">
              <Sparkles size={14} strokeWidth={2.5} /> Edusense · edusense.co.in
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-[1.02] text-[#0a1f5c]" data-testid="promo-hero-title">
              See who your child <span className="shimmer-text">really is</span>.
            </h1>
            <p className="mt-7 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              A pocket-sized compass for the primary years. <b>BehaviourScope™</b> western astrology meets <b>research-backed sentiment analysis</b> by <b>Dr Bhawna Tiwari</b> - so parents, teachers and principals can nurture <i>who the child really is</i>.
            </p>

            {/* DUAL CTA */}
            <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto" data-testid="promo-hero-ctas">
              <Card className="rounded-2xl p-5 bg-white border-2 border-[#f97316]/30 hover:border-[#f97316] transition-colors shadow-sm text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Heart size={16} className="text-[#f97316]" strokeWidth={2.5} />
                  <div className="text-xs uppercase tracking-widest font-bold text-[#f97316]">For Parents</div>
                </div>
                <div className="font-bold text-[#0a1f5c] mb-3">Free for your first child</div>
                <Link to="/register?role=parent">
                  <Button className="w-full rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-5 btn-lift" data-testid="promo-cta-parent">
                    Try BehaviourScope <ArrowRight className="ml-1.5" size={16} strokeWidth={2.5} />
                  </Button>
                </Link>
              </Card>

              <Card className="rounded-2xl p-5 bg-white border-2 border-[#0a1f5c]/30 hover:border-[#0a1f5c] transition-colors shadow-sm text-left">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap size={16} className="text-[#0a1f5c]" strokeWidth={2.5} />
                  <div className="text-xs uppercase tracking-widest font-bold text-[#0a1f5c]">For Schools</div>
                </div>
                <div className="font-bold text-[#0a1f5c] mb-3">Pro plan ₹1,499/month</div>
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
                  <Button className="w-full rounded-full bg-[#0a1f5c] hover:bg-[#142c7a] text-white font-bold py-5 btn-lift" data-testid="promo-cta-school">
                    Book a demo <ArrowRight className="ml-1.5" size={16} strokeWidth={2.5} />
                  </Button>
                </a>
              </Card>
            </div>

            {/* STATS */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto" data-testid="promo-stats">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-2xl md:text-3xl font-black text-[#0a1f5c] tracking-tight">{s.value}</div>
                  <div className="text-[11px] uppercase tracking-widest font-bold text-slate-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" data-testid="promo-how-it-works">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-[0.22em] font-bold text-[#f97316] mb-3">How it works</div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0a1f5c]">Three steps. One daily ritual.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i} className="rounded-3xl p-7 bg-white border-slate-100 relative overflow-hidden hover:shadow-xl transition-shadow" data-testid={`promo-step-${i + 1}`}>
                <div className="absolute -top-6 -right-6 text-[140px] font-black text-orange-50 select-none">{i + 1}</div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0a1f5c] to-[#f97316] flex items-center justify-center mb-5 shadow-md">
                    <Icon className="text-white" size={22} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold text-[#0a1f5c] mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* DR BHAWNA TIWARI CREDIBILITY */}
      <section className="bg-gradient-to-br from-[#050d2e] via-[#0a1f5c] to-[#142c7a] text-white relative overflow-hidden" data-testid="promo-research-section">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#f97316] rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#fdba74] rounded-full blur-[150px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f97316]/20 border border-[#f97316]/40 px-4 py-1.5 text-xs uppercase tracking-[0.22em] font-bold text-orange-200 mb-6">
                <ScrollText size={14} strokeWidth={2.5} /> Research-backed
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">
                Built on the PhD research of <span className="shimmer-text">Dr Bhawna Tiwari</span>.
              </h2>
              <p className="mt-6 text-base sm:text-lg text-blue-100/80 leading-relaxed max-w-xl">
                Edusense's Sentiment Lab implements Dr Tiwari's thesis - <i>"Sentimental Analysis approach to improve teaching and learning in primary education"</i> - giving you the same rigour academics use, in everyday language a parent can act on.
              </p>
              <div className="mt-8 grid sm:grid-cols-2 gap-3 max-w-xl">
                {[
                  "8 NRC emotions: joy, trust, anger, fear & more",
                  "Polarity: positive · negative · mixed",
                  "0-5 happiness score, week-over-week",
                  "8 aspect categories: participation, sharing, motor, learning",
                ].map((line) => (
                  <div key={line} className="flex items-start gap-2 text-sm text-blue-100">
                    <CheckCircle2 size={16} className="text-orange-400 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="glass rounded-3xl p-8" data-testid="promo-research-card">
                <Quote className="text-orange-300 mb-3" size={36} strokeWidth={2.5} />
                <p className="text-base sm:text-lg leading-relaxed font-medium">
                  "Sentimental analysis can move primary education from gut-feel to evidence - if it's translated into language parents and teachers actually use every day."
                </p>
                <div className="mt-5 flex items-center gap-3 pt-5 border-t border-white/15">
                  <div className="w-11 h-11 rounded-full bg-[#f97316] flex items-center justify-center text-white font-bold">BT</div>
                  <div>
                    <div className="font-bold">Dr Bhawna Tiwari</div>
                    <div className="text-xs text-blue-200">PhD · Primary Education Research</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SAMPLE READINGS */}
      <section id="parents" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" data-testid="promo-samples-section">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-[0.22em] font-bold text-[#f97316] mb-3">Sample readings</div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0a1f5c]">Three children. Three compasses.</h2>
          <p className="text-slate-600 mt-4 text-base max-w-2xl mx-auto">
            A peek at what every BehaviourScope™ reading delivers - niche, traits, learning style and a concrete parenting tip you can use this week.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {SAMPLE_READINGS.map((r) => (
            <SampleReadingCard key={r.sign} reading={r} testid={`promo-sample-${r.sign.toLowerCase()}`} />
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-slate-50 border-y border-slate-200" data-testid="promo-pricing-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.22em] font-bold text-[#f97316] mb-3">Pricing</div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0a1f5c]">Simple. Honest. Scales with you.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="rounded-3xl p-8 bg-white border-slate-200" data-testid="promo-pricing-free">
              <Badge className="rounded-full bg-slate-100 text-slate-700 border-slate-200 font-bold uppercase tracking-widest text-[10px]">Free forever</Badge>
              <div className="mt-4 mb-2 text-5xl font-black text-[#0a1f5c]">₹0</div>
              <div className="text-sm text-slate-500 mb-6">For curious parents</div>
              <ul className="space-y-3 text-sm text-slate-700 mb-8">
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> 1 child profile</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> Unlimited BehaviourScope™ readings</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> Book / link / activity recommendations</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> Sentiment Lab access</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> WhatsApp consultation link</li>
              </ul>
              <Link to="/register?role=parent">
                <Button variant="outline" className="w-full rounded-full font-bold border-slate-300 py-6" data-testid="promo-pricing-free-cta">Start free</Button>
              </Link>
            </Card>

            <Card id="schools" className="rounded-3xl p-8 bg-gradient-to-br from-[#0a1f5c] via-[#142c7a] to-[#f97316] text-white border-0 relative overflow-hidden" data-testid="promo-pricing-pro">
              <Badge className="rounded-full bg-orange-400 text-[#0a1f5c] border-0 font-bold uppercase tracking-widest text-[10px]"><Crown size={11} className="mr-1" /> Pro for schools</Badge>
              <div className="mt-4 mb-2 text-5xl font-black">₹1,499<span className="text-base font-bold text-white/70">/mo</span></div>
              <div className="text-sm text-white/80 mb-6">Per school</div>
              <ul className="space-y-3 text-sm mb-8">
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-orange-300 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> Unlimited students &amp; teachers</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-orange-300 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> School-wide sentiment analytics</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-orange-300 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> 7-day grace on lapse</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-orange-300 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> Multi-child support for every parent</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-orange-300 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> Priority WhatsApp support</li>
              </ul>
              <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
                <Button className="w-full rounded-full bg-orange-400 hover:bg-orange-300 text-[#0a1f5c] font-bold py-6" data-testid="promo-pricing-pro-cta">
                  Book a 15-min demo <ArrowRight className="ml-1.5" size={16} strokeWidth={2.5} />
                </Button>
              </a>
              <p className="text-[11px] text-white/70 mt-3 text-center">Billing via Razorpay. Cancel anytime.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" data-testid="promo-testimonials-section">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-[0.22em] font-bold text-[#f97316] mb-3">Loved by families &amp; schools</div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0a1f5c]">What parents &amp; principals say.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Card key={i} className="rounded-3xl p-7 bg-white border-slate-100 hover:shadow-xl transition-shadow" data-testid={`promo-testimonial-${i}`}>
              <Quote className="text-orange-300 mb-3" size={28} strokeWidth={2.5} />
              <p className="text-slate-800 leading-relaxed mb-5">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                <div className={`w-10 h-10 rounded-full ${t.accent} flex items-center justify-center text-white font-bold`}>
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-bold text-[#0a1f5c]">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* WHATSAPP CONSULTATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20" data-testid="promo-whatsapp-section">
        <Card className="rounded-3xl p-8 lg:p-12 bg-gradient-to-br from-emerald-50 via-white to-orange-50 border-emerald-100">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-[10px] uppercase tracking-[0.22em] font-bold text-emerald-700 mb-4">
                <MessageCircle size={12} strokeWidth={2.5} /> Free human consultation
              </div>
              <h3 className="text-2xl md:text-4xl font-bold tracking-tight text-[#0a1f5c] mb-3">
                Still unsure? Talk to a real human on WhatsApp.
              </h3>
              <p className="text-slate-700 leading-relaxed text-base">
                We'll walk you through your child's first BehaviourScope™ reading and answer any questions about pricing, schools or research methodology. <span className="font-bold text-emerald-700">No obligation, no sales script.</span>
              </p>
              <div className="mt-5 flex items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1.5"><Clock size={14} strokeWidth={2.5} /> 9 AM - 7 PM IST</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} strokeWidth={2.5} /> Private &amp; confidential</span>
              </div>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="w-full">
                <Button className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-7 text-base btn-lift shadow-lg" data-testid="promo-whatsapp-cta">
                  <MessageCircle className="mr-2" size={20} strokeWidth={2.5} /> Chat on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </Card>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20" data-testid="promo-faq-section">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.22em] font-bold text-[#f97316] mb-3">Questions parents ask first</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0a1f5c]">FAQ.</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3" data-testid="promo-faq-accordion">
          {FAQS.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-2xl border border-slate-200 bg-white px-5"
              data-testid={`promo-faq-item-${i}`}
            >
              <AccordionTrigger className="text-left font-bold text-[#0a1f5c] hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-slate-700 leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050d2e] via-[#0a1f5c] to-[#142c7a]" />
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#f97316] rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#fdba74] rounded-full blur-[140px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center text-white">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tighter leading-tight">
            Meet your child's <span className="shimmer-text">compass</span> today.
          </h2>
          <p className="mt-6 text-base sm:text-lg text-blue-100/80 max-w-xl mx-auto">
            Free for your first child. 60 seconds to your first BehaviourScope™ reading. No credit card required.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/register?role=parent">
              <Button className="rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold px-8 py-7 text-base btn-lift" data-testid="promo-final-cta-parent">
                Start free as a parent <ArrowRight className="ml-1.5" size={18} strokeWidth={2.5} />
              </Button>
            </Link>
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
              <Button variant="outline" className="rounded-full font-bold px-8 py-7 text-base bg-transparent border-white/40 text-white hover:bg-white/10" data-testid="promo-final-cta-school">
                Book a school demo <MessageCircle className="ml-1.5" size={18} strokeWidth={2.5} />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <img src="/edusense-logo.png" alt="Edusense" className="w-10 h-10 object-contain" />
                <div className="leading-tight">
                  <div className="font-extrabold text-lg tracking-tight text-[#0a1f5c]">Edusense</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">by Code an Apple</div>
                </div>
              </div>
              <p className="text-sm text-slate-600 max-w-md leading-relaxed">
                The compass for the primary years. BehaviourScope™ western astrology + Sentiment Lab built on Dr Bhawna Tiwari's PhD research.
              </p>
              <p className="text-xs text-slate-500 mt-3">edusense.co.in · contact@edusense.co.in</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-[#0a1f5c] mb-3">Product</div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/products/behaviourscope" className="hover:text-[#f97316]">BehaviourScope™</Link></li>
                <li><a href="#pricing" className="hover:text-[#f97316]">Pricing</a></li>
                <li><Link to="/login" className="hover:text-[#f97316]">Sign in</Link></li>
                <li><Link to="/register?role=parent" className="hover:text-[#f97316]">Get started</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-[#0a1f5c] mb-3">Company</div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-[#f97316]">About</a></li>
                <li><a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="hover:text-[#f97316]">WhatsApp</a></li>
                <li><a href="#" className="hover:text-[#f97316]">Privacy</a></li>
                <li><a href="#" className="hover:text-[#f97316]">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>© {new Date().getFullYear()} Edusense by Code an Apple. All rights reserved.</div>
            <div>Sentiment research by Dr Bhawna Tiwari · BehaviourScope™ is a trademark of Code an Apple.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
