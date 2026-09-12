import React, { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import Spinner from "../components/common/Spinner";
import ErrorState from "../components/common/ErrorState";
import JobPostingForm from "../components/postings/JobPostingForm";
import { useAsync } from "../hooks/useAsync";
import { fetchJob, createJob, updateJob } from "../services/api";

export default function PostingFormPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(jobId);

  const { data, loading, error } = useAsync(
    useCallback(() => (isEdit ? fetchJob(jobId) : Promise.resolve(null)), [jobId, isEdit])
  );

  const handleSubmit = async (payload) => {
    if (isEdit) {
      await updateJob(jobId, payload);
    } else {
      await createJob(payload);
    }
    navigate("/postings");
  };

  return (
    <>
      <TopBar
        title={isEdit ? "Edit posting" : "New posting"}
        subtitle={isEdit ? "Update this job or internship" : "Post a new job or internship"}
      />
      <div className="flex-1 p-8">
        <div className="mx-auto max-w-2xl">
          {isEdit && loading ? (
            <Spinner label="Loading posting…" />
          ) : isEdit && error ? (
            <ErrorState error={error} />
          ) : (
            <JobPostingForm
              initialValue={
                data
                  ? {
                      ...data,
                      required_skills: (data.required_skills || []).join(", "),
                      preferred_skills: (data.preferred_skills || []).join(", "),
                    }
                  : undefined
              }
              onSubmit={handleSubmit}
              submitLabel={isEdit ? "Save changes" : "Publish posting"}
            />
          )}
        </div>
      </div>
    </>
  );
}
