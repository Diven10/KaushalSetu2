import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import OverviewPage from "./pages/OverviewPage";
import PostingsPage from "./pages/PostingsPage";
import PostingFormPage from "./pages/PostingFormPage";
import PostingDetailPage from "./pages/PostingDetailPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AssessmentsPage from "./pages/AssessmentsPage";
import AssessmentFormPage from "./pages/AssessmentFormPage";
import AssessmentDetailPage from "./pages/AssessmentDetailPage";
import VerificationPage from "./pages/VerificationPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
      <Route path="/postings" element={<ProtectedRoute><PostingsPage /></ProtectedRoute>} />
      <Route path="/postings/new" element={<ProtectedRoute><PostingFormPage /></ProtectedRoute>} />
      <Route path="/postings/:jobId/edit" element={<ProtectedRoute><PostingFormPage /></ProtectedRoute>} />
      <Route path="/postings/:jobId" element={<ProtectedRoute><PostingDetailPage /></ProtectedRoute>} />
      <Route path="/postings/:jobId/assessments/new" element={<ProtectedRoute><AssessmentFormPage /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
      <Route path="/assessments" element={<ProtectedRoute><AssessmentsPage /></ProtectedRoute>} />
      <Route path="/assessments/new" element={<ProtectedRoute><AssessmentFormPage /></ProtectedRoute>} />
      <Route path="/assessments/:assessmentId" element={<ProtectedRoute><AssessmentDetailPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/verification" element={<ProtectedRoute><VerificationPage /></ProtectedRoute>} />
    </Routes>
  );
}
