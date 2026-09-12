// Purely derived from data the Overview page already has in hand (jobs,
// assessments summary, employer profile) — no new endpoint needed for this.
// Same idea as the Government Portal's Early Warning system and the Trainee
// Panel's notification bell, scaled to one employer's postings.
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function deriveNudges({ jobs = [], assessmentsSummary, employerVerified }) {
  const nudges = [];

  jobs
    .filter((j) => j.status === "open")
    .forEach((job) => {
      const applicantCount = job.applicant_count ?? job.applicants_count ?? 0;
      const daysLeft = daysUntil(job.application_deadline);

      if (applicantCount === 0) {
        nudges.push({
          id: `nudge-zero-${job.id}`,
          severity: "Medium",
          signal: `"${job.title}" has no applicants yet.`,
          action: "Consider widening the required skills or reviewing the wage band.",
          link: `/postings/${job.id}/edit`,
        });
      } else if (daysLeft != null && daysLeft <= 5 && daysLeft >= 0 && applicantCount < 3) {
        nudges.push({
          id: `nudge-closing-${job.id}`,
          severity: "High",
          signal: `"${job.title}" closes in ${daysLeft} day(s) with only ${applicantCount} applicant(s).`,
          action: "Extend the deadline or promote the posting to reach more trainees.",
          link: `/postings/${job.id}`,
        });
      }
    });

  const pendingReview = assessmentsSummary?.pending_review_count ?? assessmentsSummary?.pendingReviewCount;
  if (pendingReview) {
    nudges.push({
      id: "nudge-pending-review",
      severity: pendingReview >= 5 ? "High" : "Medium",
      signal: `${pendingReview} assessment submission(s) are awaiting your review.`,
      action: "Open Test & PS to score them before candidates move further in your pipeline.",
      link: "/assessments",
    });
  }

  if (employerVerified === false) {
    nudges.push({
      id: "nudge-not-verified",
      severity: "Medium",
      signal: "Your company isn't verified yet.",
      action: "Verify via DigiLocker so trainees see a trusted badge on your postings.",
      link: "/verification",
    });
  }

  return nudges;
}

// Short, human-readable recommendations built from the same signals — the
// employer-panel equivalent of the Government Portal's per-district
// "Recommendations" section.
export function deriveRecommendations(nudges) {
  return nudges.map((n) => n.action);
}
