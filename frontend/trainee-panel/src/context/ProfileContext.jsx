import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { STAGES } from "../data/mockData";

const ProfileContext = createContext(null);

const emptyProfile = {
  identity: { fullName: "", dob: "", gender: "", state: "", district: "" },
  education: { qualification: "", field: "", yearCompleted: "" },
  training: { scheme: "", courseName: "", status: "", score: "" },
  employment: { status: "", employer: "", wageBand: "" },
  preferences: { roles: [], location: "", expectedSalary: "", relocate: "" },
  // method: "" | "Self-attested" | "DigiLocker" — provenance of the
  // verification, surfaced via ProvenanceBadge wherever status is shown.
  verification: { identity: "", certificate: "", method: "", documents: [] },
};

// Fields (per stage) that count toward the completeness score.
// "score" under training is intentionally excluded — it's an optional field
// in the chat script and shouldn't cap completeness below 100%.
const REQUIRED_FIELDS = {
  identity: ["fullName", "dob", "gender", "state", "district"],
  education: ["qualification", "field", "yearCompleted"],
  training: ["scheme", "courseName", "status"],
  employment: ["status", "employer", "wageBand"],
  preferences: ["roles", "location", "expectedSalary", "relocate"],
  verification: ["identity", "certificate"],
};

function countFilled(obj, keys) {
  return keys.filter((key) => {
    const v = obj[key];
    if (Array.isArray(v)) return v.length > 0;
    return Boolean(v);
  }).length;
}

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(emptyProfile);
  const [furthestStage, setFurthestStage] = useState("identity");

  const setField = useCallback((path, value) => {
    setProfile((prev) => {
      const [section, key] = path.split(".");
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      };
    });
  }, []);

  const markStageReached = useCallback((stageKey) => {
    setFurthestStage((prev) => {
      const prevIdx = STAGES.findIndex((s) => s.key === prev);
      const nextIdx = STAGES.findIndex((s) => s.key === stageKey);
      return nextIdx > prevIdx ? stageKey : prev;
    });
  }, []);

  // Marks both identity + certificate as Verified in one shot with a
  // "DigiLocker" provenance tag, and records which documents were pulled.
  const connectDigiLocker = useCallback((documents) => {
    setProfile((prev) => ({
      ...prev,
      verification: {
        identity: "Verified",
        certificate: "Verified",
        method: "DigiLocker",
        documents,
      },
    }));
  }, []);

  const stageCompleteness = useMemo(() => {
    const result = {};
    STAGES.forEach(({ key }) => {
      const keys = REQUIRED_FIELDS[key];
      const filled = countFilled(profile[key], keys);
      result[key] = Math.round((filled / keys.length) * 100);
    });
    return result;
  }, [profile]);

  const overallCompleteness = useMemo(() => {
    const totalFields = Object.values(REQUIRED_FIELDS).reduce((sum, keys) => sum + keys.length, 0);
    const filledFields = STAGES.reduce(
      (sum, { key }) => sum + countFilled(profile[key], REQUIRED_FIELDS[key]),
      0
    );
    return Math.round((filledFields / totalFields) * 100);
  }, [profile]);

  const isVerified = profile.verification.identity === "Verified" && profile.verification.certificate === "Verified";

  const value = {
    profile,
    setField,
    furthestStage,
    markStageReached,
    stageCompleteness,
    overallCompleteness,
    isVerified,
    connectDigiLocker,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
}
