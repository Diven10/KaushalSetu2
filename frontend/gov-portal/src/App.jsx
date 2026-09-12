import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GovernmentLayout from './layouts/GovernmentLayout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

const Overview = lazy(() => import('./pages/Overview'));
const DistrictIntelligence = lazy(() => import('./pages/DistrictIntelligence'));
const SkillIntelligence = lazy(() => import('./pages/SkillIntelligence'));
const CareerOutcomes = lazy(() => import('./pages/CareerOutcomes'));
const EarlyWarning = lazy(() => import('./pages/EarlyWarning'));
const EarlyWarningDetail = lazy(() => import('./pages/EarlyWarningDetail'));
const PolicySimulator = lazy(() => import('./pages/PolicySimulator'));
const ImpactReports = lazy(() => import('./pages/ImpactReports'));

function PageFallback() {
  return <div style={{ padding: 40, color: 'var(--grey-500)', fontSize: 13.5 }}>Loading…</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Everything below requires a signed-in government account. */}
            <Route element={<ProtectedRoute />}>
              <Route element={<GovernmentLayout />}>
                <Route path="/" element={<Navigate to="/overview" replace />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/districts" element={<DistrictIntelligence />} />
                <Route path="/districts/:district" element={<DistrictIntelligence />} />
                <Route path="/skills" element={<SkillIntelligence />} />
                <Route path="/career-outcomes" element={<CareerOutcomes />} />
                <Route path="/early-warning" element={<EarlyWarning />} />
                <Route path="/early-warning/:id" element={<EarlyWarningDetail />} />
                <Route path="/policy-simulator" element={<PolicySimulator />} />
                <Route path="/impact" element={<ImpactReports />} />
                <Route path="*" element={<Navigate to="/overview" replace />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
