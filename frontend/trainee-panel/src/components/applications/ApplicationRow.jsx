import React from "react";
import { MapPin, Banknote, CalendarClock } from "lucide-react";
import ApplicationStatusTrack from "./ApplicationStatusTrack";
import { APPLICATION_STAGES } from "../../data/appData";

export default function ApplicationRow({ application }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{application.role}</p>
          <p className="text-xs text-ink-soft">{application.employer}</p>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs text-ink-faint">
          <span className="flex items-center gap-1.5">
            <MapPin size={12} /> {application.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Banknote size={12} /> {application.wage}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <ApplicationStatusTrack
          stages={APPLICATION_STAGES}
          currentStage={application.stage}
          rejected={application.rejected}
        />
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-[11px] text-ink-faint">
        <CalendarClock size={12} />
        Applied {application.appliedOn} · Last update: {application.history[application.history.length - 1]?.note}
      </div>
    </div>
  );
}
