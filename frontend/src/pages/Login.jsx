import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("parent");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await login({ email, password, role });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      toast.error(res.error);
      return;
    }
    toast.success(`Welcome back, ${res.user.name}!`);
    const dest = location.state?.from?.pathname || `/dashboard/${res.user.role}`;
    navigate(dest, { replace: true });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="hidden lg:block">
            <div className="cosmic-bg rounded-3xl p-10 text-white relative overflow-hidden h-[560px] flex flex-col justify-end">
              <div className="text-xs uppercase tracking-[0.25em] text-orange-300 font-bold mb-3">Welcome back</div>
              <h2 className="text-4xl font-black tracking-tight leading-tight">Continue your <span className="text-[#fdba74] font-script text-6xl">cosmic</span> journey.</h2>
              <p className="mt-4 text-blue-100/80 max-w-md">Pick up where you left off - niche insights, books, and activities tailored to your child or class.</p>
            </div>
          </div>
          <Card className="rounded-3xl p-8 lg:p-10 border-slate-100 bg-white shadow-sm" data-testid="login-card">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Sign in</h1>
            <p className="text-slate-500 mb-6 text-sm">Choose your role and enter your credentials.</p>

            <Tabs value={role} onValueChange={setRole} className="mb-6">
              <TabsList className="grid grid-cols-3 rounded-full bg-orange-100 p-1 h-auto">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  return (
                    <TabsTrigger
                      key={r.key}
                      value={r.key}
                      data-testid={`login-role-${r.key}`}
                      className="rounded-full font-bold data-[state=active]:bg-white data-[state=active]:text-[#f97316] data-[state=active]:shadow-sm py-2"
                    >
                      <Icon size={14} strokeWidth={2.5} className="mr-1.5" /> {r.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-bold">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl bg-white" data-testid="login-email-input" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-bold">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl bg-white" data-testid="login-password-input" />
              </div>
              {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3" data-testid="login-error">{error}</div>}
              <Button type="submit" disabled={submitting} className="w-full rounded-full bg-[#f97316] hover:bg-[#ea580c] font-bold py-6 btn-lift" data-testid="login-submit-btn">
                {submitting ? "Signing in…" : `Sign in as ${role}`}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#f97316] font-bold hover:underline" data-testid="login-to-register-link">Create one</Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
