import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import AssistantPage from "./pages/AssistantPage";
import MyProfilePage from "./pages/MyProfilePage";
import CareerJourneyPage from "./pages/CareerJourneyPage";
import SkillsOpportunitiesPage from "./pages/SkillsOpportunitiesPage";
import OpportunityDetailPage from "./pages/OpportunityDetailPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import AssessmentsPage from "./pages/AssessmentsPage";
import AssessmentDetailPage from "./pages/AssessmentDetailPage";

// ProtectedRoute renders the AppShell, so the login screen stays outside the
// sidebar/top-bar chrome.
const guarded = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={guarded(<DashboardPage />)} />
      <Route path="/assistant" element={guarded(<AssistantPage />)} />
      <Route path="/profile" element={guarded(<MyProfilePage />)} />
      <Route path="/journey" element={guarded(<CareerJourneyPage />)} />
      <Route path="/skills" element={guarded(<SkillsOpportunitiesPage />)} />
      <Route path="/skills/:id" element={guarded(<OpportunityDetailPage />)} />
      <Route path="/applications" element={guarded(<ApplicationsPage />)} />
      <Route path="/assessments" element={guarded(<AssessmentsPage />)} />
      <Route path="/assessments/:id" element={guarded(<AssessmentDetailPage />)} />
    </Routes>
  );
}
