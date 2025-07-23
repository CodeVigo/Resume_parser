// frontend/src/pages/JobsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  getMyShortlists,
  saveJob,
  applyJob,
  getSavedJobs,
  getParsedResume,
} from "../services/api";
import api from "../services/api";

export default function JobsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shortlistedIds, setShortlistedIds] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [scores, setScores] = useState({}); // { jobId: score }
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // fetch paginated jobs, shortlists and saved jobs
        const [jobsRes, shortRes, savedRes] = await Promise.all([
          api.get("/jobs?page=1&limit=10"),
          getMyShortlists(),
          getSavedJobs(),
        ]);

        // jobsRes.data = { jobs: [...], total } OR array
        const list = Array.isArray(jobsRes.data)
          ? jobsRes.data
          : jobsRes.data.jobs || [];
        setJobs(list);

        // shortlisted IDs from scores payload
        setShortlistedIds((shortRes.data.scores || []).map((s) => s.job._id));

        // saved IDs from auth/me
        setSavedIds(Array.isArray(savedRes.data) ? savedRes.data : []);

        // compute ATS scores for student
        if (user.role === "student" && shortRes.data.resumeId) {
          const scoreMap = {};
          const resumeId = shortRes.data.resumeId;
          await Promise.all(
            list.map(async (job) => {
              try {
                const { data } = await getParsedResume(resumeId, job._id);
                scoreMap[job._id] = data.jobScore?.score || 0;
              } catch {
                scoreMap[job._id] = 0;
              }
            })
          );
          setScores(scoreMap);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user.role]);

  const handleSave = async (jobId) => {
    setActionLoading((prev) => ({ ...prev, [jobId]: true }));
    try {
      await saveJob(jobId);
      setSavedIds((prev) => [...prev, jobId]);
    } catch {
      console.error("Save failed");
    } finally {
      setActionLoading((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const handleApply = async (jobId) => {
    setActionLoading((prev) => ({ ...prev, [jobId]: true }));
    try {
      await applyJob(jobId);
      setShortlistedIds((prev) => [...prev, jobId]);
    } catch {
      console.error("Apply failed");
    } finally {
      setActionLoading((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  if (loading) return <LoadingSpinner size="large" />;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">All Jobs</h1>
      {jobs.map((job) => {
        const isSaved = savedIds.includes(job._id);
        const isApplied = shortlistedIds.includes(job._id);
        const atsScore = scores[job._id];

        return (
          <div key={job._id} className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{job.title}</h2>
                <p className="text-gray-600">
                  {job.company} — {job.location}
                </p>
                {user.role === "student" && (
                  <p className="text-sm mt-1">
                    ATS Score:{" "}
                    <span className="font-medium text-blue-600">
                      {atsScore}/100
                    </span>
                  </p>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleSave(job._id)}
                  disabled={actionLoading[job._id] || isSaved}
                  className={`px-4 py-2 rounded ${
                    isSaved
                      ? "bg-gray-300 text-gray-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isSaved
                    ? "Saved"
                    : actionLoading[job._id]
                    ? "Saving..."
                    : "Save"}
                </button>

                {user.role === "student" ? (
                  <button
                    onClick={() => handleApply(job._id)}
                    disabled={actionLoading[job._id] || isApplied}
                    className={`px-4 py-2 rounded text-white ${
                      isApplied
                        ? "bg-green-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isApplied
                      ? "Applied"
                      : actionLoading[job._id]
                      ? "Applying..."
                      : "Apply"}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/create-job")}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create Job
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
