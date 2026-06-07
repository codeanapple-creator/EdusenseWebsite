import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { AlertCircle, Crown } from "lucide-react";
import { Link } from "react-router-dom";

export default function SubscriptionBanner() {
  const [school, setSchool] = useState(null);

  useEffect(() => {
    api.get("/schools/me").then((r) => setSchool(r.data)).catch(() => {});
  }, []);

  if (!school) return null;
  if (!["grace", "expired"].includes(school.subscription_status)) return null;

  const isGrace = school.subscription_status === "grace";
  const styles = isGrace
    ? "bg-orange-100 border-amber-300 text-amber-900"
    : "bg-rose-100 border-rose-300 text-rose-900";
  const icon = isGrace ? <AlertCircle size={18} strokeWidth={2.5} /> : <Crown size={18} strokeWidth={2.5} />;
  const message = isGrace
    ? `Your Pro plan ended. You're in a 7-day grace period until ${new Date(school.grace_until).toLocaleDateString()}.`
    : "Your Pro plan expired. You've been moved to Free - renew to lift the 30-student limit.";

  return (
    <div className={`rounded-2xl border ${styles} p-3 mb-6 flex items-center gap-3 flex-wrap`} data-testid="subscription-banner">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {icon}
        <span className="text-sm font-bold">{message}</span>
      </div>
      <Link to="/dashboard/principal#school">
        <button className="rounded-full bg-white text-slate-900 font-bold px-4 py-1.5 text-sm border border-slate-200 hover:shadow" data-testid="banner-renew-btn">
          Renew Pro
        </button>
      </Link>
    </div>
  );
}
