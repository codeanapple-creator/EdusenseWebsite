import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Sparkles, LogOut, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-amber-50/80 border-b border-amber-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group" data-testid="brand-link">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Sparkles className="text-white" size={18} strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <div className="font-extrabold text-lg tracking-tight text-slate-900">EDUSENSE</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">by Codeanapple</div>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link to={`/dashboard/${user.role}`}>
                <Button variant="ghost" className="rounded-full font-bold" data-testid="nav-dashboard-btn">
                  <LayoutDashboard size={16} strokeWidth={2.5} className="mr-1.5" />
                  Dashboard
                </Button>
              </Link>
              <span className="hidden sm:inline text-xs uppercase tracking-wide font-bold text-slate-500 px-2">
                {user.role}
              </span>
              <Button onClick={handleLogout} variant="outline" className="rounded-full" data-testid="nav-logout-btn">
                <LogOut size={16} strokeWidth={2.5} className="mr-1.5" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="rounded-full font-bold" data-testid="nav-login-btn">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="rounded-full bg-sky-500 hover:bg-sky-400 font-bold btn-lift" data-testid="nav-register-btn">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
