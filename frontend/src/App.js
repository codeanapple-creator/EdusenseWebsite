import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Astrology from "./pages/Astrology";
import ParentDashboard from "./pages/ParentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import PrincipalDashboard from "./pages/PrincipalDashboard";
import Sentiment from "./pages/Sentiment";
import ProductBehaviourScope from "./pages/ProductBehaviourScope";

function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/dashboard/${user.role}`} replace />;
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/products/behaviourscope" element={<ProductBehaviourScope />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route
              path="/astrology"
              element={
                <ProtectedRoute roles={["parent", "teacher", "principal"]}>
                  <Astrology />
                </ProtectedRoute>
              }
            />
            <Route
              path="/behaviourscope"
              element={
                <ProtectedRoute roles={["parent", "teacher", "principal"]}>
                  <Astrology />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sentiment"
              element={
                <ProtectedRoute roles={["parent", "teacher", "principal"]}>
                  <Sentiment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/parent"
              element={
                <ProtectedRoute roles={["parent"]}>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/teacher"
              element={
                <ProtectedRoute roles={["teacher"]}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/principal"
              element={
                <ProtectedRoute roles={["principal"]}>
                  <PrincipalDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </div>
  );
}

export default App;
