import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card } from "../components/ui/card";
import { toast } from "sonner";
import { Users, GraduationCap, ShieldCheck } from "lucide-react";

const ROLES = [
  { key: "parent", label: "Parent", icon: Users },
  { key: "teacher", label: "Teacher", icon: GraduationCap },
  { key: "principal", label: "Principal", icon: ShieldCheck },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get("role") || "parent");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const r = params.get("role");
    if (r && ["parent", "teacher", "principal"].includes(r)) setRole(r);
  }, [params]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await register({ name, email, password, role });
    if (!res.ok) {
      setSubmitting(false);
      setError(res.error);
      toast.error(res.error);
      return;
    }
    // Auto-join school for non-principals if code provided
    if (role !== "principal" && schoolCode.trim()) {
      try {
        const { api } = await import("../lib/api");
        await api.post("/schools/join", { code: schoolCode.trim().toUpperCase() });
      } catch (err) {
        toast.message("Account created — could not join school: " + (err.response?.data?.detail || err.message));
      }
    }
    setSubmitting(false);
    toast.success(`Welcome, ${res.user.name}!`);
    navigate(`/dashboard/${res.user.role}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="hidden lg:block">
            <div className="cosmic-bg rounded-3xl p-10 text-white relative overflow-hidden h-[600px] flex flex-col justify-end">
              <div className="text-xs uppercase tracking-[0.25em] text-indigo-300 font-bold mb-3">Begin the journey</div>
              <h2 className="text-4xl font-black tracking-tight leading-tight">Three roles. <span className="text-yellow-400 font-script text-6xl">One</span> sky of possibilities.</h2>
              <p className="mt-4 text-indigo-100/80 max-w-md">Sign up as a parent, teacher, or principal to unlock niche guidance, books, links and activities.</p>
            </div>
          </div>
          <Card className="rounded-3xl p-8 lg:p-10 border-slate-100 bg-white shadow-sm" data-testid="register-card">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Create account</h1>
            <p className="text-slate-500 mb-6 text-sm">Pick your role to get started.</p>

            <Tabs value={role} onValueChange={setRole} className="mb-6">
              <TabsList className="grid grid-cols-3 rounded-full bg-amber-100 p-1 h-auto">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  return (
                    <TabsTrigger
                      key={r.key}
                      value={r.key}
                      data-testid={`register-role-${r.key}`}
                      className="rounded-full font-bold data-[state=active]:bg-white data-[state=active]:text-sky-600 data-[state=active]:shadow-sm py-2"
                    >
                      <Icon size={14} strokeWidth={2.5} className="mr-1.5" /> {r.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-bold">Full name</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl bg-white" data-testid="register-name-input" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-bold">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl bg-white" data-testid="register-email-input" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-bold">Password</Label>
                <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl bg-white" data-testid="register-password-input" />
                <p className="text-xs text-slate-500">Minimum 6 characters.</p>
              </div>
              {role !== "principal" && (
                <div className="space-y-1.5">
                  <Label htmlFor="school-code" className="text-sm font-bold">School code <span className="text-slate-400 font-normal">(optional)</span></Label>
                  <Input id="school-code" value={schoolCode} onChange={(e) => setSchoolCode(e.target.value.toUpperCase())} className="rounded-xl bg-white uppercase tracking-widest" placeholder="e.g., DEMO01" data-testid="register-school-code-input" maxLength={12} />
                  <p className="text-xs text-slate-500">Get this 6-char code from your school's principal.</p>
                </div>
              )}
              {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3" data-testid="register-error">{error}</div>}
              <Button type="submit" disabled={submitting} className="w-full rounded-full bg-sky-500 hover:bg-sky-400 font-bold py-6 btn-lift" data-testid="register-submit-btn">
                {submitting ? "Creating account…" : `Sign up as ${role}`}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-slate-600">
              Already a member?{" "}
              <Link to="/login" className="text-sky-600 font-bold hover:underline" data-testid="register-to-login-link">Sign in</Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
