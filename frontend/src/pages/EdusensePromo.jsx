import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import {
  ArrowUpRight,
  ArrowRight,
  MessageCircle,
  Phone,
  Mail,
  Star,
  PlayCircle,
  Quote,
} from "lucide-react";

const WHATSAPP_NUMBER = "+919755093999";
const WHATSAPP_TEXT = encodeURIComponent(
  "Hi! I'd like a free Edusense consultation for my child / school."
);
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${WHATSAPP_TEXT}`;

const MARQUEE_WORDS = [
  "Sentiment Lab",
  "Happiness Index",
  "Active Participation",
  "Learning Style",
  "Dr Bhawna Tiwari",
  "जिज्ञासु संवादक",
  "Sharing",
  "Self-initiation",
  "Curious Communicator",
  "Bold Initiator",
  "BehaviourScope™",
  "Empathic Caregiver",
  "Niche Finder",
  "Free for the first child",
];

const STEPS = [
  {
    num: "01",
    title: "Paste any note or journal",
    desc: "Parent feedback, child journal, teacher note - even a WhatsApp rant. The Sentiment Lab does the rest.",
  },
  {
    num: "02",
    title: "We read between the lines",
    desc: "Built on Dr Bhawna Tiwari's PhD research - 8 feelings, a 0-5 happiness score, polarity, and which part of school life it's about. In plain English.",
  },
  {
    num: "03",
    title: "You act, every week",
    desc: "Books, links, activities and weekly trends - so the insight doesn't sit in a PDF, it shapes Tuesdays.",
  },
];

const TESTIMONIALS = [
  {
    name: "Shilpa N.",
    role: "Parent · Bengaluru · Gemini child, age 9",
    quote:
      "The behaviour scope nailed my daughter's 'needs to talk it out' learning style. The parenting tips alone saved me three months of trial-and-error.",
  },
  {
    name: "Rohit P.",
    role: "Father of two · Pune",
    quote:
      "Finally an app that doesn't just tell me my child's marks. It tells me who he is and what to do about it.",
  },
  {
    name: "Anita Kulkarni",
    role: "Principal · Nashik",
    quote:
      "Sentiment Lab gave us a feelings-radar on the whole school. We caught burnout in two teachers before it spread. Worth every rupee.",
  },
  {
    name: "Priya M.",
    role: "Parent · Mumbai · Cancer child, age 7",
    quote:
      "Reading it felt like someone finally got my son. The Hindi version made my mother-in-law cry happy tears.",
  },
];

const FAQS = [
  { q: "Is this a substitute for child psychology?", a: "No. BehaviourScope™ is an interpretive western-astrology lens designed to spark reflection, not diagnose. For clinical concerns, please consult a qualified child psychologist." },
  { q: "Who is Edusense built for?", a: "Parents of children aged 3-14, teachers wanting to understand a student's natural orientation, and principals running a value-added service for their school families." },
  { q: "Which languages are supported?", a: "English and हिंदी today, with Marathi on the roadmap. Toggle on the reading page." },
  { q: "Is my child's data safe?", a: "Birth details are stored only against your account. We don't share or sell child data. Delete any reading from your dashboard at any time." },
  { q: "How is this 'research-backed'?", a: "Sentiment Lab implements Dr Bhawna Tiwari's PhD thesis 'Sentimental Analysis approach to improve teaching and learning in primary education' - in plain English a parent can act on." },
  { q: "Can I try without paying?", a: "Yes. Free plan supports 1 child and unlimited BehaviourScope™ readings, forever. No credit card needed." },
];

const Marquee = () => (
  <div className="overflow-hidden border-y-2 border-[#0a1f5c] bg-[#0a1f5c] text-white py-6">
    <div className="flex whitespace-nowrap animate-marquee">
      {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
        <span key={i} className="mx-8 text-2xl md:text-4xl font-black tracking-tight inline-flex items-center gap-8">
          {w}
          <Star size={16} className="text-[#f97316] fill-[#f97316]" />
        </span>
      ))}
    </div>
  </div>
);

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
    <div className="min-h-screen bg-[#fffaf5] text-[#0a1f5c] selection:bg-[#f97316] selection:text-white" data-testid="edusense-promo-page">
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 40s linear infinite; }
        .promo-grain {
          background-image:
            radial-gradient(circle at 1px 1px, rgba(10,31,92,0.06) 1px, transparent 0);
          background-size: 24px 24px;
        }
      `}</style>

      {/* ── ANNOUNCEMENT BAR ───────────────────────── */}
      <div className="bg-[#0a1f5c] text-white text-center text-xs md:text-sm py-2 px-4 font-medium">
        <span className="hidden sm:inline">Live in English &amp; हिंदी ·</span> Free for your first child. No card.
        <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="ml-3 underline decoration-[#f97316] decoration-2 underline-offset-4 hover:text-[#fdba74]">
          Chat on WhatsApp →
        </a>
      </div>

      {/* ── NAV ───────────────────────── */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#fffaf5]/85 border-b border-[#0a1f5c]/10">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group" data-testid="promo-brand-link">
            <img src="/edusense-logo.png" alt="Edusense" className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" />
            <div className="leading-tight">
              <div className="font-black text-xl tracking-tight">edusense<span className="text-[#f97316]">.</span></div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#0a1f5c]/60">edusense.co.in</div>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            <a href="#story" className="px-4 py-2 text-sm font-bold hover:text-[#f97316] transition-colors">Story</a>
            <a href="#how" className="px-4 py-2 text-sm font-bold hover:text-[#f97316] transition-colors">How it works</a>
            <a href="#research" className="px-4 py-2 text-sm font-bold hover:text-[#f97316] transition-colors">Research</a>
            <a href="#pricing" className="px-4 py-2 text-sm font-bold hover:text-[#f97316] transition-colors">Pricing</a>
            <a href="#faq" className="px-4 py-2 text-sm font-bold hover:text-[#f97316] transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" className="rounded-none font-bold hover:bg-transparent hover:text-[#f97316]" data-testid="promo-signin-btn">
                Sign in
              </Button>
            </Link>
            <Link to="/register?role=parent">
              <Button className="rounded-none bg-[#0a1f5c] hover:bg-[#f97316] text-white font-bold px-6 py-6 border-2 border-[#0a1f5c] hover:border-[#f97316] transition-colors" data-testid="promo-getstarted-btn">
                Get started <ArrowUpRight className="ml-1.5" size={16} strokeWidth={3} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO: editorial split with massive type ───────────────── */}
      <section id="story" className="relative overflow-hidden promo-grain">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 pt-12 lg:pt-20 pb-16 lg:pb-32">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            {/* LEFT — copy */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px flex-1 bg-[#0a1f5c]/30" />
                <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#0a1f5c]/70">Edusense · Issue 01 · 2026</span>
                <div className="h-px flex-1 bg-[#0a1f5c]/30" />
              </div>

              <h1 className="font-black tracking-[-0.04em] leading-[0.88] text-[#0a1f5c]" data-testid="promo-hero-title">
                <span className="block text-[15vw] sm:text-[11vw] lg:text-[9.5vw]">How is</span>
                <span className="block text-[15vw] sm:text-[11vw] lg:text-[9.5vw]">your child</span>
                <span className="block text-[15vw] sm:text-[11vw] lg:text-[9.5vw]">
                  <span className="font-script font-normal text-[#f97316] italic" style={{ letterSpacing: "-0.01em" }}>really </span>
                  doing?
                </span>
              </h1>

              <div className="mt-10 grid sm:grid-cols-2 gap-6 max-w-2xl">
                <p className="text-base lg:text-lg text-[#0a1f5c]/85 leading-relaxed">
                  <b>Edusense</b> reads the everyday signals - parent feedback, journals, teacher notes - and tells you, in plain English, how the child is feeling, what's working and what's hurting. Built on <b>Dr Bhawna Tiwari</b>'s PhD research in primary education. <span className="text-[#f97316]">Plus a bonus <b>BehaviourScope™</b> western-astrology niche reading for fun.</span>
                </p>
                <div className="flex flex-col gap-3 sm:items-start">
                  <Link to="/register?role=parent" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto rounded-none bg-[#f97316] hover:bg-[#0a1f5c] text-white font-bold px-8 py-7 text-base border-2 border-[#f97316] hover:border-[#0a1f5c]" data-testid="promo-hero-cta-parent">
                      Free for your first child <ArrowUpRight className="ml-2" size={18} strokeWidth={3} />
                    </Button>
                  </Link>
                  <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                    <Button variant="ghost" className="w-full sm:w-auto rounded-none font-bold px-2 py-2 text-[#0a1f5c] hover:text-[#f97316] hover:bg-transparent underline decoration-2 decoration-[#0a1f5c] hover:decoration-[#f97316] underline-offset-[6px]" data-testid="promo-hero-cta-school">
                      Or book a school demo
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* RIGHT — bird mascot with floating cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-square max-w-md mx-auto lg:ml-auto lg:mr-0">
                <div className="absolute inset-8 bg-[#f97316]" />
                <img
                  src="/edusense-logo.png"
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain p-12 mix-blend-multiply"
                  data-testid="promo-hero-bird"
                />
                {/* floating tag 1 */}
                <div className="absolute -top-2 -left-2 sm:-left-8 bg-white border-2 border-[#0a1f5c] px-4 py-3 shadow-[6px_6px_0_0_#0a1f5c] rotate-[-4deg]">
                  <div className="text-[9px] uppercase tracking-widest font-black text-[#f97316]">Happiness this week</div>
                  <div className="font-black text-lg">4.2 / 5 · trending up</div>
                </div>
                {/* floating tag 2 */}
                <div className="absolute -bottom-4 -right-2 sm:-right-6 bg-white border-2 border-[#0a1f5c] px-4 py-3 shadow-[-6px_6px_0_0_#f97316] rotate-[3deg]">
                  <div className="text-[9px] uppercase tracking-widest font-black text-[#0a1f5c]">Aspect</div>
                  <div className="font-bold text-sm max-w-[180px]">Active participation is dropping - try peer-pair days.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* mega number band */}
        <div className="border-t-2 border-[#0a1f5c]/15">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-2 lg:grid-cols-4 divide-x-2 divide-[#0a1f5c]/15">
            {[
              { n: "8", l: "feelings decoded" },
              { n: "0-5", l: "happiness score" },
              { n: "₹0", l: "to start" },
              { n: "2", l: "languages live" },
            ].map((s, i) => (
              <div key={i} className="py-8 lg:py-10 px-5 lg:px-8" data-testid={`promo-stat-${i}`}>
                <div className="text-5xl lg:text-7xl font-black tracking-tighter text-[#0a1f5c]">{s.n}</div>
                <div className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#0a1f5c]/60 mt-2">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────── */}
      <Marquee />

      {/* ── HOW IT WORKS — vertical timeline list ─────────────────── */}
      <section id="how" className="bg-[#fffaf5] py-20 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 mb-16">
            <div className="lg:col-span-5">
              <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#f97316]">How it works</span>
              <h2 className="mt-4 text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[0.92]">
                Three steps.<br />
                <span className="font-script font-normal italic text-[#f97316] text-7xl md:text-8xl lg:text-9xl">one ritual.</span>
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 self-end">
              <p className="text-base lg:text-lg text-[#0a1f5c]/85 leading-relaxed max-w-md">
                A reading isn't useful if it sits in a PDF. Edusense turns insight into a weekly habit.
              </p>
            </div>
          </div>

          <div className="divide-y-2 divide-[#0a1f5c]/15 border-y-2 border-[#0a1f5c]/15">
            {STEPS.map((s) => (
              <div key={s.num} className="grid lg:grid-cols-12 gap-6 py-10 lg:py-14 group hover:bg-white transition-colors" data-testid={`promo-step-${s.num}`}>
                <div className="lg:col-span-2">
                  <div className="text-6xl lg:text-7xl font-black text-[#f97316] tracking-tighter">{s.num}</div>
                </div>
                <div className="lg:col-span-6">
                  <h3 className="text-3xl lg:text-4xl font-black tracking-tight">{s.title}</h3>
                </div>
                <div className="lg:col-span-4">
                  <p className="text-base text-[#0a1f5c]/80 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESEARCH (Dr Bhawna Tiwari) — dark editorial spread ──────── */}
      <section id="research" className="bg-[#0a1f5c] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "16px 16px" }} />
        <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-20 lg:py-32">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#f97316]">Built on PhD research</span>
              <h2 className="mt-4 text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[0.92]">
                Dr Bhawna<br />
                <span className="font-script font-normal italic text-[#f97316] text-7xl md:text-8xl lg:text-9xl">Tiwari's </span><br />
                method.
              </h2>
              <p className="mt-8 text-base lg:text-lg text-white/80 leading-relaxed max-w-md">
                Edusense's Sentiment Lab implements her thesis - <i>"Sentimental Analysis approach to improve teaching and learning in primary education"</i> - giving you the same rigour academics use, in everyday language.
              </p>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              {/* Quote block */}
              <div className="bg-white text-[#0a1f5c] p-8 lg:p-10 border-4 border-[#f97316] mb-6 relative">
                <Quote className="absolute -top-5 -left-5 bg-[#f97316] text-white p-1.5" size={40} strokeWidth={2.5} />
                <p className="text-xl lg:text-2xl font-medium leading-snug">
                  "Sentimental analysis can move primary education from gut-feel to evidence - if it's translated into language parents and teachers actually use every day."
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#0a1f5c] text-white font-black grid place-items-center text-lg">BT</div>
                  <div>
                    <div className="font-black">Dr Bhawna Tiwari</div>
                    <div className="text-xs text-[#0a1f5c]/60">PhD · Primary Education Research</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  ["8", "NRC emotions"],
                  ["0-5", "happiness score"],
                  ["3", "polarity classes + mixed"],
                  ["8", "aspect categories"],
                ].map(([n, l], i) => (
                  <div key={i} className="border-2 border-white/20 p-5">
                    <div className="text-4xl lg:text-5xl font-black text-[#f97316] tracking-tighter">{n}</div>
                    <div className="text-[11px] uppercase tracking-[0.22em] font-bold text-white/70 mt-1">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BEHAVIOURSCOPE BONUS STRIP — astrology as add-on, not main ────── */}
      <section className="bg-[#fffaf5] py-16 lg:py-24 border-y-2 border-[#0a1f5c]/10" data-testid="promo-bonus-section">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-[#f97316]/15 border border-[#f97316]/30 px-3 py-1 mb-5">
                <Star size={12} className="text-[#f97316] fill-[#f97316]" />
                <span className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#f97316]">Plus, a fun bonus</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.03em] leading-[0.95]">
                BehaviourScope™ western<br />astrology - <span className="font-script font-normal italic text-[#f97316] text-5xl md:text-6xl lg:text-7xl">on the house.</span>
              </h2>
              <p className="mt-6 text-base lg:text-lg text-[#0a1f5c]/80 leading-relaxed max-w-xl">
                Every parent account also unlocks a one-tap western-astrology niche reading - sun-sign archetype, learning style and a few playful parenting tips. Not a science, just a delightful conversation-starter at the dinner table.
              </p>
              <div className="mt-7 flex flex-wrap gap-6 text-sm font-bold text-[#0a1f5c]/70">
                <span className="flex items-center gap-2"><Star size={14} className="text-[#f97316] fill-[#f97316]" /> Free with any plan</span>
                <span className="flex items-center gap-2"><Star size={14} className="text-[#f97316] fill-[#f97316]" /> English + हिंदी</span>
                <span className="flex items-center gap-2"><Star size={14} className="text-[#f97316] fill-[#f97316]" /> 60-second reading</span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative max-w-sm mx-auto">
                {/* Sample reading card mock */}
                <div className="bg-white border-2 border-[#0a1f5c] p-6 shadow-[8px_8px_0_0_#f97316]">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#0a1f5c]/15">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest font-black text-[#0a1f5c]/60">Sample · Gemini</div>
                      <div className="font-black text-lg">Aanya, 9</div>
                    </div>
                    <Star size={20} className="text-[#f97316] fill-[#f97316]" />
                  </div>
                  <div className="text-[10px] uppercase tracking-widest font-black text-[#f97316] mb-1">Niche</div>
                  <div className="text-2xl font-black mb-4">Curious Communicator</div>
                  <div className="text-xs text-[#0a1f5c]/70 leading-relaxed">
                    Learning style: <b className="text-[#0a1f5c]">visual + verbal pairings</b>. Tip: try 20-min "deep dive" rituals to convert curiosity into mastery.
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 bg-[#0a1f5c] text-white text-[10px] uppercase tracking-widest font-black px-3 py-1 rotate-[6deg]">
                  Bonus reading
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="pricing" className="bg-[#fffaf5] py-20 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 mb-16">
            <div className="lg:col-span-7">
              <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#f97316]">Pricing</span>
              <h2 className="mt-4 text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[0.92]">
                Simple.<br />
                <span className="font-script font-normal italic text-[#f97316] text-7xl md:text-8xl lg:text-9xl">Honest. </span><br />
                Scales with you.
              </h2>
            </div>
          </div>

          {/* Comparison row */}
          <div className="border-2 border-[#0a1f5c] bg-white">
            {/* Header row */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-b-2 border-[#0a1f5c]">
              <div className="hidden md:block p-6 lg:p-8 bg-[#fffaf5]" />
              <div className="p-6 lg:p-8 border-l-2 border-[#0a1f5c]/15 md:border-l-2">
                <div className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#0a1f5c]/60 mb-2">Free forever</div>
                <div className="text-5xl lg:text-6xl font-black tracking-tighter">₹0</div>
                <div className="text-sm text-[#0a1f5c]/60 mt-1">For curious parents</div>
              </div>
              <div className="p-6 lg:p-8 border-l-2 border-[#0a1f5c]/15 bg-[#0a1f5c] text-white relative">
                <div className="absolute -top-3 left-6 bg-[#f97316] text-white text-[10px] uppercase tracking-widest font-black px-3 py-1">Pro · for schools</div>
                <div className="text-[11px] uppercase tracking-[0.22em] font-bold text-white/70 mb-2">Pro</div>
                <div className="text-5xl lg:text-6xl font-black tracking-tighter">₹1,499<span className="text-base font-bold text-white/70">/mo</span></div>
                <div className="text-sm text-white/70 mt-1">Per school · Razorpay</div>
              </div>
            </div>

            {/* Rows */}
            {[
              ["Sentiment Lab access", "Yes", "Yes + school-wide analytics"],
              ["Book / link / activity recommendations", "Yes", "Yes"],
              ["Weekly happiness-trend chart", "Yes · 1 child", "Yes · all students"],
              ["Hindi (हिंदी) readings", "Yes", "Yes"],
              ["BehaviourScope™ astrology bonus", "Yes · 1 child", "Yes · all students"],
              ["Teachers & principals seats", "—", "Unlimited"],
              ["7-day grace on lapse", "—", "Yes"],
              ["WhatsApp support", "Standard", "Priority"],
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-3 border-b border-[#0a1f5c]/10 last:border-b-0" data-testid={`promo-pricing-row-${i}`}>
                <div className="p-5 lg:p-6 font-bold text-sm bg-[#fffaf5] md:bg-transparent">{row[0]}</div>
                <div className="p-5 lg:p-6 text-sm text-[#0a1f5c]/85 border-t md:border-t-0 md:border-l-2 border-[#0a1f5c]/15">{row[1]}</div>
                <div className="p-5 lg:p-6 text-sm text-[#0a1f5c]/85 border-t md:border-t-0 md:border-l-2 border-[#0a1f5c]/15">{row[2]}</div>
              </div>
            ))}

            {/* CTAs row */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-t-2 border-[#0a1f5c]">
              <div className="hidden md:block bg-[#fffaf5]" />
              <div className="p-5 lg:p-6 border-t md:border-t-0 md:border-l-2 border-[#0a1f5c]/15">
                <Link to="/register?role=parent">
                  <Button variant="outline" className="w-full rounded-none border-2 border-[#0a1f5c] hover:bg-[#0a1f5c] hover:text-white font-bold py-6" data-testid="promo-pricing-free-cta">
                    Start free <ArrowRight className="ml-2" size={16} strokeWidth={3} />
                  </Button>
                </Link>
              </div>
              <div className="p-5 lg:p-6 border-t md:border-t-0 md:border-l-2 border-[#0a1f5c]/15 bg-[#0a1f5c]">
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
                  <Button className="w-full rounded-none bg-[#f97316] hover:bg-white hover:text-[#0a1f5c] text-white font-bold py-6 border-2 border-[#f97316] hover:border-white" data-testid="promo-pricing-pro-cta">
                    Book a 15-min demo <ArrowRight className="ml-2" size={16} strokeWidth={3} />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — scrolling card row ─────────────────── */}
      <section className="bg-[#0a1f5c] py-20 lg:py-28 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 mb-12">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#f97316]">Loved by families &amp; schools</span>
              <h2 className="mt-4 text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[0.92] text-white">
                What they're<br />
                <span className="font-script font-normal italic text-[#f97316] text-7xl md:text-8xl lg:text-9xl">saying.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 flex items-center gap-2 text-white/80">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={20} className="text-[#f97316] fill-[#f97316]" />
              ))}
              <span className="ml-2 font-bold">4.9 / 5 · early parents</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white p-7 border-2 border-white relative" data-testid={`promo-testimonial-${i}`}>
              <Quote className="text-[#f97316] mb-3" size={28} strokeWidth={2.5} />
              <p className="text-[#0a1f5c] leading-relaxed text-base">"{t.quote}"</p>
              <div className="mt-6 pt-5 border-t-2 border-[#0a1f5c]/10">
                <div className="font-black text-[#0a1f5c]">{t.name}</div>
                <div className="text-xs text-[#0a1f5c]/60 mt-0.5">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHATSAPP STRIP ─────────────────── */}
      <section className="bg-[#f97316] text-white py-16 lg:py-20" data-testid="promo-whatsapp-strip">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <div className="text-[11px] uppercase tracking-[0.3em] font-bold text-white/80 mb-2">Free human consultation</div>
            <h3 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-[-0.03em] leading-[0.95]">
              Still unsure?<br />Talk to a real human.
            </h3>
            <p className="mt-4 text-white/90 max-w-xl text-base lg:text-lg">
              9 AM - 7 PM IST · private &amp; confidential. We'll walk you through your child's first BehaviourScope™ reading. No sales script.
            </p>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end">
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="w-full">
              <Button className="w-full rounded-none bg-white text-[#0a1f5c] hover:bg-[#0a1f5c] hover:text-white border-2 border-white hover:border-[#0a1f5c] font-bold py-8 text-base" data-testid="promo-whatsapp-cta">
                <MessageCircle className="mr-2" size={20} strokeWidth={3} /> Chat on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────── */}
      <section id="faq" className="bg-[#fffaf5] py-20 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#f97316]">FAQ</span>
            <h2 className="mt-4 text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[0.92]">
              Questions<br />parents<br />
              <span className="font-script font-normal italic text-[#f97316] text-7xl md:text-8xl lg:text-9xl">ask first.</span>
            </h2>
          </div>
          <div className="lg:col-span-7">
            <Accordion type="single" collapsible className="space-y-0 border-y-2 border-[#0a1f5c]" data-testid="promo-faq-accordion">
              {FAQS.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border-b border-[#0a1f5c]/15 last:border-b-0"
                  data-testid={`promo-faq-item-${i}`}
                >
                  <AccordionTrigger className="text-left font-black text-lg lg:text-xl text-[#0a1f5c] hover:no-underline hover:text-[#f97316] py-6">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-[#0a1f5c]/80 leading-relaxed pb-6">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ── BIG FINAL CTA ─────────────────── */}
      <section className="bg-[#0a1f5c] text-white py-24 lg:py-40 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-[#f97316] rounded-full blur-[120px] opacity-50" />
        <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#f97316] mb-6">edusense.co.in</div>
          <h2 className="font-black tracking-[-0.04em] leading-[0.88]">
            <span className="block text-[14vw] sm:text-[10vw] lg:text-[9vw]">Meet your</span>
            <span className="block text-[14vw] sm:text-[10vw] lg:text-[9vw]">
              child's <span className="font-script font-normal italic text-[#f97316]" style={{ letterSpacing: "-0.01em" }}>compass </span>
            </span>
            <span className="block text-[14vw] sm:text-[10vw] lg:text-[9vw]">today.</span>
          </h2>
          <p className="mt-10 text-white/70 max-w-xl mx-auto text-base lg:text-lg">
            Free for your first child. 60 seconds to your first BehaviourScope™ reading. No credit card required.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Link to="/register?role=parent">
              <Button className="rounded-none bg-[#f97316] hover:bg-white hover:text-[#0a1f5c] text-white font-bold px-10 py-7 text-base border-2 border-[#f97316] hover:border-white" data-testid="promo-final-cta-parent">
                Start free <ArrowUpRight className="ml-2" size={18} strokeWidth={3} />
              </Button>
            </Link>
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
              <Button variant="outline" className="rounded-none bg-transparent border-2 border-white hover:bg-white hover:text-[#0a1f5c] text-white font-bold px-10 py-7 text-base" data-testid="promo-final-cta-school">
                Book a school demo <MessageCircle className="ml-2" size={18} strokeWidth={3} />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────── */}
      <footer className="bg-[#050d2e] text-white/70 py-16">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid md:grid-cols-12 gap-8 mb-12 pb-12 border-b border-white/15">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-4">
                <img src="/edusense-logo.png" alt="Edusense" className="w-12 h-12 object-contain bg-white/5" />
                <div>
                  <div className="font-black text-2xl tracking-tight text-white">edusense<span className="text-[#f97316]">.</span></div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/50">by Code an Apple</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                The compass for the primary years. BehaviourScope™ western astrology + Sentiment Lab built on Dr Bhawna Tiwari's PhD research.
              </p>
            </div>
            <div className="md:col-span-2">
              <div className="text-[11px] uppercase tracking-[0.22em] font-bold text-white mb-4">Product</div>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/products/behaviourscope" className="hover:text-[#f97316] transition-colors">BehaviourScope™</Link></li>
                <li><a href="#pricing" className="hover:text-[#f97316] transition-colors">Pricing</a></li>
                <li><Link to="/login" className="hover:text-[#f97316] transition-colors">Sign in</Link></li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <div className="text-[11px] uppercase tracking-[0.22em] font-bold text-white mb-4">Company</div>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#research" className="hover:text-[#f97316] transition-colors">Research</a></li>
                <li><a href="#faq" className="hover:text-[#f97316] transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-[#f97316] transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-[#f97316] transition-colors">Terms</a></li>
              </ul>
            </div>
            <div className="md:col-span-3">
              <div className="text-[11px] uppercase tracking-[0.22em] font-bold text-white mb-4">Contact</div>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-2"><Mail size={14} /> contact@edusense.co.in</li>
                <li className="flex items-center gap-2"><Phone size={14} /> {WHATSAPP_NUMBER}</li>
                <li className="flex items-center gap-2"><MessageCircle size={14} /> <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="hover:text-[#f97316]">WhatsApp us</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div>© {new Date().getFullYear()} Edusense by Code an Apple. All rights reserved.</div>
            <div>BehaviourScope™ is a trademark of Code an Apple · Research by Dr Bhawna Tiwari</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
