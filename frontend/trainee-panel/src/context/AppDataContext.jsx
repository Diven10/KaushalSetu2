import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useProfile } from "./ProfileContext";
import {
  SEED_APPLICATIONS,
  SEED_ASSESSMENTS,
  APPLICATION_STAGES,
  OPPORTUNITY_DETAILS,
} from "../data/appData";
import { RECOMMENDED_OPPORTUNITIES } from "../data/mockData";
import {
  applyToJob as applyToJobApi,
  fetchApplications,
  fetchOpportunities,
} from "../services/api";

const AppDataContext = createContext(null);

let idCounter = 1000;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function AppDataProvider({ children }) {
  const { profile, overallCompleteness, isVerified } = useProfile();
  const [applications, setApplications] = useState(SEED_APPLICATIONS);
  // Opportunities and applications come from the backend when it's up; the
  // seeded copies above/below are what you see if it isn't (see services/api.js).
  const [opportunities, setOpportunities] = useState(() =>
    RECOMMENDED_OPPORTUNITIES.map((op) => ({ ...op, ...(OPPORTUNITY_DETAILS[op.id] || {}) }))
  );

  useEffect(() => {
    let cancelled = false;
    fetchOpportunities(12).then((list) => {
      if (!cancelled && Array.isArray(list) && list.length) setOpportunities(list);
    });
    fetchApplications().then((list) => {
      if (!cancelled && Array.isArray(list) && list.length) setApplications(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const [assessments, setAssessments] = useState(SEED_ASSESSMENTS);
  const [dismissedNotifications, setDismissedNotifications] = useState([]);

  // ---- Applications -------------------------------------------------
  const hasApplied = useCallback(
    (opportunityId) => applications.some((a) => a.opportunityId === opportunityId),
    [applications]
  );

  const applyToJob = useCallback(
    (opportunity) => {
      // Fire-and-forget: the optimistic row below is added either way, so a
      // backend that's down never blocks the trainee from applying.
      applyToJobApi(opportunity.job_id);
      setApplications((prev) => {
        if (prev.some((a) => a.opportunityId === opportunity.id)) return prev;
        const application = {
          id: nextId("app"),
          opportunityId: opportunity.id,
          role: opportunity.role,
          employer: opportunity.employer,
          location: opportunity.location,
          wage: opportunity.wage,
          stage: "Applied",
          rejected: false,
          appliedOn: todayISO(),
          history: [{ stage: "Applied", date: todayISO(), note: "Application submitted." }],
        };
        return [application, ...prev];
      });
    },
    []
  );

  const getApplication = useCallback((id) => applications.find((a) => a.id === id), [applications]);

  // ---- Assessments (Test & PS) ---------------------------------------
  const getAssessment = useCallback((id) => assessments.find((a) => a.id === id), [assessments]);

  const startAssessment = useCallback((id) => {
    setAssessments((prev) =>
      prev.map((a) => (a.id === id && a.status === "Assigned" ? { ...a, status: "In Progress" } : a))
    );
  }, []);

  const submitMcqAssessment = useCallback((id, answers) => {
    setAssessments((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const total = a.questions.length;
        const correct = a.questions.filter((q) => answers[q.id] === q.correctIndex).length;
        const score = Math.round((correct / total) * 100);
        return { ...a, status: "Evaluated", score, submittedOn: todayISO() };
      })
    );
  }, []);

  const submitPsAssessment = useCallback((id, submissionText) => {
    setAssessments((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: "Submitted", submissionText, submittedOn: todayISO() }
          : a
      )
    );
  }, []);

  // ---- Notifications (derived, Early-Warning-style nudges) -----------
  const notifications = useMemo(() => {
    const list = [];

    if (overallCompleteness < 100) {
      list.push({
        id: "n-profile-incomplete",
        severity: "Medium",
        signal: `Your profile is ${overallCompleteness}% complete.`,
        action: "Finish the remaining sections with Saathi to improve your match quality.",
        link: "/assistant",
      });
    }

    if (!isVerified) {
      list.push({
        id: "n-verification-pending",
        severity: "Medium",
        signal: "Identity and certificate verification are still pending.",
        action: "Verify instantly via DigiLocker, or complete manual verification with Saathi.",
        link: "/profile",
      });
    }

    assessments.forEach((a) => {
      if (a.status === "Assigned" || a.status === "In Progress") {
        const due = new Date(a.dueDate);
        const daysLeft = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 7) {
          list.push({
            id: `n-assess-${a.id}`,
            severity: daysLeft <= 2 ? "High" : "Medium",
            signal: `${a.title} from ${a.employer} is due in ${Math.max(daysLeft, 0)} day(s).`,
            action: "Open Assessments to start it now.",
            link: "/assessments",
          });
        }
      }
      if (a.status === "Evaluated" && a.score !== null) {
        list.push({
          id: `n-result-${a.id}`,
          severity: "Improving",
          signal: `Result is in for ${a.title}: ${a.score}%.`,
          action: a.score >= (a.passThreshold ?? 60) ? "You passed — the employer has been notified." : "Below the pass threshold this time — review the skill gap and try the next opportunity.",
          link: "/assessments",
        });
      }
    });

    applications.forEach((app) => {
      const last = app.history[app.history.length - 1];
      if (last && last.stage !== "Applied") {
        list.push({
          id: `n-app-${app.id}`,
          severity: "Improving",
          signal: `${app.employer} moved your application to "${last.stage}".`,
          action: "Check My Applications for details.",
          link: "/applications",
        });
      }
    });

    return list.filter((n) => !dismissedNotifications.includes(n.id));
  }, [overallCompleteness, isVerified, assessments, applications, dismissedNotifications]);

  const dismissNotification = useCallback((id) => {
    setDismissedNotifications((prev) => [...prev, id]);
  }, []);

  const value = {
    applications,
    getApplication,
    hasApplied,
    applyToJob,
    applicationStages: APPLICATION_STAGES,
    assessments,
    getAssessment,
    startAssessment,
    submitMcqAssessment,
    submitPsAssessment,
    notifications,
    dismissNotification,
    opportunities,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within an AppDataProvider");
  return ctx;
}
