import React, { useEffect, useState } from "react";
import { api, formatApiErrorDetail } from "../lib/api";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "./ui/dialog";
import { School as SchoolIcon, Sparkles, Users, GraduationCap, Crown, Copy, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const PLAN_STYLES = {
  free: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  pro: { bg: "bg-gradient-to-br from-amber-100 to-yellow-100", text: "text-amber-700", border: "border-amber-200" },
};

export default function SchoolManager() {
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/schools/me");
      setSchool(data);
    } catch (e) {
      if (e.response?.status === 404) setSchool(null);
      else toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/schools", { name });
      toast.success("School created");
      setOpenCreate(false);
      setName("");
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setCreating(false);
    }
  };

  const subscribePro = async () => {
    setSubscribing(true);
    try {
      const { data } = await api.post("/schools/subscribe");
      setSchool({ ...school, ...data });
      toast.success("Pro plan activated (MOCKED - Razorpay pending)");
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setSubscribing(false);
    }
  };

  const copyCode = () => {
    if (!school?.code) return;
    navigator.clipboard.writeText(school.code);
    toast.success(`Code ${school.code} copied`);
  };

  if (loading) {
    return <Card className="rounded-3xl p-7 bg-white border-slate-100 animate-pulse h-44" />;
  }

  if (!school) {
    return (
      <Card className="rounded-3xl p-7 bg-white border-slate-100" data-testid="school-empty-card">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest font-bold text-indigo-600 mb-1">Get started</div>
            <h2 className="text-xl font-bold text-slate-900">Create your school</h2>
            <p className="text-sm text-slate-500 mt-1">Spin up a workspace and share the join code with teachers and parents.</p>
          </div>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-sky-500 hover:bg-sky-400 font-bold btn-lift" data-testid="create-school-btn">
                <SchoolIcon size={16} strokeWidth={2.5} className="mr-1.5" /> Create school
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Name your school</DialogTitle>
                <DialogDescription>You'll receive a 6-character join code teachers and parents can use to register.</DialogDescription>
              </DialogHeader>
              <form onSubmit={create} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">School name</Label>
                  <Input required value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" data-testid="school-name-input" />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={creating} className="rounded-full bg-sky-500 hover:bg-sky-400 font-bold" data-testid="school-save-btn">
                    {creating ? "Creating…" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    );
  }

  const plan = school.plan || "free";
  const planStyle = PLAN_STYLES[plan];
  const inGrace = school.subscription_status === "grace";
  const expired = school.subscription_status === "expired";

  return (
    <Card className="rounded-3xl p-7 bg-white border-slate-100" data-testid="school-card">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 flex items-center justify-center">
            <SchoolIcon className="text-white" size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-0.5">School</div>
            <h2 className="text-xl font-bold text-slate-900" data-testid="school-name">{school.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <button onClick={copyCode} className="inline-flex items-center gap-1.5 text-xs font-bold rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-200 px-2.5 py-1" data-testid="school-code-btn">
                <span data-testid="school-code">{school.code}</span> <Copy size={11} strokeWidth={2.5} />
              </button>
              <Badge className={`rounded-full font-bold capitalize ${planStyle.bg} ${planStyle.text} ${planStyle.border}`} data-testid="school-plan-badge">
                {plan === "pro" && <Crown size={12} strokeWidth={2.5} className="mr-1" />} {plan}
              </Badge>
              {inGrace && <Badge className="rounded-full bg-amber-100 text-amber-800 border-amber-300 font-bold">Grace period</Badge>}
              {expired && <Badge className="rounded-full bg-rose-100 text-rose-700 border-rose-200 font-bold">Expired</Badge>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {plan === "free" ? (
            <Button onClick={subscribePro} disabled={subscribing} className="rounded-full bg-amber-500 hover:bg-amber-400 text-white font-bold btn-lift" data-testid="subscribe-pro-btn">
              <Crown size={16} strokeWidth={2.5} className="mr-1.5" /> {subscribing ? "Activating…" : "Upgrade to Pro · ₹1,499/mo"}
            </Button>
          ) : (
            <Button onClick={subscribePro} disabled={subscribing} variant="outline" className="rounded-full font-bold" data-testid="renew-pro-btn">
              <Crown size={16} strokeWidth={2.5} className="mr-1.5" /> Renew Pro
            </Button>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-500 mb-1"><Users size={14} strokeWidth={2.5} /> Members</div>
          <div className="text-2xl font-black text-slate-900" data-testid="school-member-count">{school.member_count ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-500 mb-1"><GraduationCap size={14} strokeWidth={2.5} /> Students</div>
          <div className="text-2xl font-black text-slate-900" data-testid="school-student-count">{school.student_count ?? 0}</div>
          <div className="text-xs text-slate-500 mt-0.5">limit {school.student_limit}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-500 mb-1"><ShieldCheck size={14} strokeWidth={2.5} /> Renews on</div>
          <div className="text-base font-bold text-slate-900" data-testid="school-renew-date">
            {school.current_period_end ? new Date(school.current_period_end).toLocaleDateString() : "-"}
          </div>
        </div>
      </div>

      {plan === "pro" && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-800 flex items-start gap-2" data-testid="mock-notice">
          <Sparkles size={14} strokeWidth={2.5} className="mt-0.5 flex-shrink-0" />
          <span><b>MOCKED:</b> Pro subscription is currently mocked for testing. Razorpay payment integration will be wired in once API keys are provided.</span>
        </div>
      )}
    </Card>
  );
}
