import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SampleReadingCard from "../components/SampleReadingCard";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { SAMPLE_READINGS } from "../lib/sampleReadings";
import { Stars, Sparkles, ArrowRight, CheckCircle2, HeartHandshake, ScrollText, Crown, ShieldCheck, Compass, Quote } from "lucide-react";

const FEATURES = [
  { title: "Niche & career paths", desc: "A short, parent-friendly niche phrase plus 4-6 future-facing career directions grounded in the child's sun-sign profile.", icon: Compass },
  { title: "Behavioural traits", desc: "4-6 observations on how your child typically behaves - useful for school reports, parent-teacher meetings and home routines.", icon: Sparkles },
  { title: "Learning + social + emotional style", desc: "One-line, plain-language descriptions you can share with teachers and grandparents alike.", icon: ScrollText },
  { title: "Concrete parenting tips", desc: "4-6 actionable strategies you can use this week - not vague advice.", icon: HeartHandshake },
];

const FAQS = [
  {
    q: "Is BehaviourScope™ a substitute for child psychology?",
    a: "No. BehaviourScope™ is a western-astrology lens designed to spark reflection, not diagnose. For clinical concerns, please consult a qualified child psychologist or paediatrician.",
  },
  {
    q: "How accurate are the readings?",
    a: "The system generates each reading from your child's name, place and birth-date/time, combined with classical western-astrology sun-sign archetypes. Parents report it feels 'surprisingly aligned' but it is interpretive guidance, not a deterministic test.",
  },
  {
    q: "Do I need to know the exact time of birth?",
    a: "Yes - date and time of birth together give the most resonant reading. If the time is approximate, results will still be useful but a touch more generic.",
  },
  {
    q: "Who is BehaviourScope™ for?",
    a: "Parents of children aged 3-14 (the primary-school years), teachers wanting to understand a student's natural orientation, and principals running BehaviourScope™ as a value-added service for their school families.",
  },
  {
    q: "How does this relate to the Sentiment Lab?",
    a: "BehaviourScope™ tells you who the child is. Sentiment Lab tells you how the child is doing right now (via parent feedback, journals or teacher notes). Together they give you a 360° view, and the books/links/activities tie the two into an action plan.",
  },
  {
    q: "What about privacy?",
    a: "Birth details are stored only against your account. We don't share or sell child data. You can delete any reading from your dashboard at any time.",
  },
  {
    q: "Is there a free tier?",
    a: "Yes - Free plan supports a single child and up to 30 students for schools. Pro plan (₹1,499/month per school) unlocks unlimited students and priority support.",
  },
];

export default function ProductBehaviourScope() {
  useEffect(() => {
    document.title = "BehaviourScope™ Western Astrology - EDUSENSE by Codeanapple";
    const desc = "BehaviourScope™ - western astrology niche, behaviour scope and parenting tips for primary-school children, built by Codeanapple. Free for the first child.";
    let m = document.querySelector('meta[name="description"]');
    if (!m) {
      m = document.createElement("meta");
      m.name = "description";
      document.head.appendChild(m);
    }
    m.setAttribute("content", desc);

    // JSON-LD structured data
    const productLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "BehaviourScope™ Western Astrology",
      description: desc,
      brand: { "@type": "Brand", name: "EDUSENSE by Codeanapple" },
      category: "Educational SaaS",
      audience: { "@type": "PeopleAudience", suggestedMinAge: 3, suggestedMaxAge: 14 },
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          eligibleQuantity: { "@type": "QuantitativeValue", value: 1, unitText: "child" },
        },
        {
          "@type": "Offer",
          name: "Pro for schools",
          price: "1499",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "1499",
            priceCurrency: "INR",
            unitCode: "MON",
            billingDuration: "P1M",
          },
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "1",
        bestRating: "5",
        worstRating: "1",
      },
    };
    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };
    const tag1 = document.createElement("script");
    tag1.type = "application/ld+json";
    tag1.id = "ld-behaviourscope-product";
    tag1.textContent = JSON.stringify(productLd);
    document.head.appendChild(tag1);
    const tag2 = document.createElement("script");
    tag2.type = "application/ld+json";
    tag2.id = "ld-behaviourscope-faq";
    tag2.textContent = JSON.stringify(faqLd);
    document.head.appendChild(tag2);
    return () => {
      tag1.remove();
      tag2.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-amber-50 grid-pattern" data-testid="behaviourscope-marketing-page">
      <Navbar />

      {/* HERO */}
      <section className="cosmic-bg text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-4 py-1.5 text-xs uppercase tracking-[0.25em] font-bold text-indigo-200 mb-6">
              <Stars size={14} strokeWidth={2.5} /> a Codeanapple product
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-[1.02]" data-testid="bs-hero-title">
              <span className="shimmer-text">BehaviourScope™</span>
              <br />Western Astrology
            </h1>
            <p className="mt-6 text-base sm:text-lg text-indigo-100/80 max-w-2xl mx-auto leading-relaxed">
              A parent's compass - niche, behaviour scope, learning style and 4-6 concrete parenting tips, all generated from a single birth chart.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/register?role=parent">
                <Button className="rounded-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold px-7 py-6 text-base btn-lift" data-testid="bs-hero-cta">
                  Generate my child's scope <ArrowRight className="ml-1.5" size={18} strokeWidth={2.5} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="rounded-full font-bold px-7 py-6 text-base bg-transparent border-indigo-300/40 text-white hover:bg-white/10" data-testid="bs-hero-signin">
                  Sign in
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs text-indigo-200/80">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" strokeWidth={2.5} /> The system generates instantly</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" strokeWidth={2.5} /> 60-second reading</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" strokeWidth={2.5} /> Free for the first child</span>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="bs-features-section">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.22em] font-bold text-indigo-600 mb-3">What's in every reading</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">A complete behavioural snapshot.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="rounded-3xl p-6 bg-white border-slate-100">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-pink-500 flex items-center justify-center mb-4">
                  <Icon size={20} strokeWidth={2.5} className="text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* SAMPLE READINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="bs-samples-section">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.22em] font-bold text-amber-700 mb-3">Sample readings</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Three children. Three compasses.</h2>
          <p className="text-slate-600 mt-3 text-sm max-w-2xl mx-auto">
            Here's what a BehaviourScope™ reading looks like for three real-world sun-sign archetypes.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {SAMPLE_READINGS.map((r) => (
            <SampleReadingCard key={r.sign} reading={r} testid={`sample-${r.sign.toLowerCase()}`} />
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="bs-pricing-section">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.22em] font-bold text-indigo-600 mb-3">Pricing</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Simple. Honest. Scales with you.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="rounded-3xl p-8 bg-white border-slate-100" data-testid="pricing-free">
            <Badge className="rounded-full bg-slate-100 text-slate-700 border-slate-200 font-bold uppercase tracking-widest text-[10px]">Free forever</Badge>
            <div className="mt-4 mb-2 text-5xl font-black text-slate-900">₹0</div>
            <div className="text-sm text-slate-500 mb-6">For curious parents</div>
            <ul className="space-y-3 text-sm text-slate-700 mb-8">
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> 1 child profile</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> Unlimited BehaviourScope™ readings</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> Book, link &amp; activity recommendations</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> Sentiment Lab access</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> WhatsApp consultation link</li>
            </ul>
            <Link to="/register?role=parent">
              <Button variant="outline" className="w-full rounded-full font-bold py-6" data-testid="pricing-free-cta">Start free</Button>
            </Link>
          </Card>

          <Card className="rounded-3xl p-8 bg-gradient-to-br from-indigo-600 via-violet-500 to-pink-500 text-white border-0 relative overflow-hidden" data-testid="pricing-pro">
            <Badge className="rounded-full bg-yellow-400 text-slate-900 border-0 font-bold uppercase tracking-widest text-[10px]"><Crown size={11} className="mr-1" /> Pro for schools</Badge>
            <div className="mt-4 mb-2 text-5xl font-black">₹1,499<span className="text-base font-bold text-white/70">/mo</span></div>
            <div className="text-sm text-white/80 mb-6">Per school</div>
            <ul className="space-y-3 text-sm mb-8">
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-yellow-300 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> Unlimited students &amp; teachers</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-yellow-300 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> School-wide sentiment analytics</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-yellow-300 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> 7-day grace on lapse</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-yellow-300 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> Multi-child support for every parent</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-yellow-300 mt-0.5 flex-shrink-0" strokeWidth={2.5} /> Priority WhatsApp support</li>
            </ul>
            <Link to="/register?role=principal">
              <Button className="w-full rounded-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold py-6" data-testid="pricing-pro-cta">Upgrade my school</Button>
            </Link>
            <p className="text-[11px] text-white/70 mt-3 text-center">Billing via Razorpay (test mode). Real billing activates once keys are provided.</p>
          </Card>
        </div>
      </section>

      {/* AVAILABILITY */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="bs-availability-section">
        <Card className="rounded-3xl p-8 bg-gradient-to-br from-amber-50 via-white to-sky-50 border-amber-100">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-1 flex justify-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-pink-500 flex items-center justify-center shadow-xl">
                <ShieldCheck className="text-white" size={32} strokeWidth={2.5} />
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs uppercase tracking-widest font-bold text-emerald-700 mb-2">Availability</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Live across India · works for parents worldwide.</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                BehaviourScope™ is hosted on EDUSENSE's secure cloud. Available in <b>English and हिंदी</b> (toggle on the reading page); Marathi is on the roadmap. WhatsApp consultations are available in IST (9:00 - 19:00).
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* TESTIMONIAL */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="rounded-3xl p-8 lg:p-12 bg-white border-slate-100">
          <Quote className="text-indigo-300 mb-3" size={36} strokeWidth={2.5} />
          <p className="text-lg sm:text-xl text-slate-800 leading-relaxed mb-5 font-medium">
            "The behaviour scope nailed my daughter's 'needs to talk it out' learning style. The parenting tips alone saved me three months of trial-and-error."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold">S</div>
            <div>
              <div className="font-bold text-slate-900">Shilpa N.</div>
              <div className="text-xs text-slate-500">Parent · Bengaluru · Gemini child, age 9</div>
            </div>
          </div>
        </Card>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="bs-faq-section">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.22em] font-bold text-indigo-600 mb-3">FAQ</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Questions parents ask first.</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3" data-testid="bs-faq-accordion">
          {FAQS.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-2xl border border-slate-200 bg-white px-5"
              data-testid={`faq-item-${i}`}
            >
              <AccordionTrigger className="text-left font-bold text-slate-900 hover:no-underline">
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
      <section className="cosmic-bg text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
            Ready to meet your child's <span className="font-script text-yellow-400 text-5xl sm:text-6xl">compass</span>?
          </h2>
          <p className="mt-5 text-indigo-100/80 max-w-xl mx-auto">
            Free for your first child. 60 seconds to your first BehaviourScope™ reading.
          </p>
          <Link to="/register?role=parent" className="inline-block mt-7">
            <Button className="rounded-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold px-8 py-6 text-base btn-lift" data-testid="bs-final-cta">
              Start free <ArrowRight className="ml-1.5" size={18} strokeWidth={2.5} />
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-amber-50 border-t border-amber-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <img src="/codeanapple-logo.png" alt="Code An Apple" className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 border border-slate-200" data-testid="bs-footer-logo" />
            <span className="font-bold text-slate-900">EDUSENSE</span>
            <span className="text-slate-400">·</span>
            <span>by Code An Apple</span>
          </div>
          <div>BehaviourScope™ is a product of EDUSENSE · © {new Date().getFullYear()}</div>
        </div>
      </footer>
    </div>
  );
}
