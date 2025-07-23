import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import JobCard from "../components/JobCard";
import MatchedCandidatesModal from "../components/MatchedCandidatesModal";
import { getRecruiterJobs, createJob } from "../services/api";

export default function RecruiterJobsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModalFor, setShowModalFor] = useState(null);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    jobType: "full-time",
    requiredSkills: [],
    scoreThreshold: 60,
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      const { data } = await getRecruiterJobs();
      setJobs(data.jobs || data);
    } catch (err) {
      console.error(err);
      setError("Failed to load your jobs.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setNewJob((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await createJob({
        title: newJob.title,
        description: newJob.description,
        location: newJob.location,
        salary: { min: newJob.salaryMin, max: newJob.salaryMax },
        jobType: newJob.jobType,
        requiredSkills: newJob.requiredSkills.map((s) => ({
          skill: s,
          weight: 5,
        })),
        scoreThreshold: newJob.scoreThreshold,
      });
      setNewJob({
        title: "",
        description: "",
        location: "",
        salaryMin: "",
        salaryMax: "",
        jobType: "full-time",
        requiredSkills: [],
        scoreThreshold: 60,
      });
      fetchJobs();
    } catch {
      alert("Could not create job");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Job Postings</h1>

        {/* New Job Form */}
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 rounded-lg shadow mb-8 space-y-4"
        >
          <h2 className="text-xl font-semibold">Post a New Job</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="title"
              value={newJob.title}
              onChange={handleChange}
              placeholder="Title"
              className="input"
              required
            />
            <input
              name="location"
              value={newJob.location}
              onChange={handleChange}
              placeholder="Location"
              className="input"
              required
            />
            <select
              name="jobType"
              value={newJob.jobType}
              onChange={handleChange}
              className="input"
            >
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>
            <div className="flex space-x-2">
              <input
                name="salaryMin"
                value={newJob.salaryMin}
                onChange={handleChange}
                placeholder="Min Salary"
                className="input"
                required
              />
              <input
                name="salaryMax"
                value={newJob.salaryMax}
                onChange={handleChange}
                placeholder="Max Salary"
                className="input"
                required
              />
            </div>
            <input
              name="scoreThreshold"
              type="number"
              value={newJob.scoreThreshold}
              onChange={handleChange}
              placeholder="ATS Score Threshold"
              className="input"
              min={0}
              max={100}
              required
            />
          </div>
          <textarea
            name="description"
            value={newJob.description}
            onChange={handleChange}
            placeholder="Description"
            className="textarea"
            required
          />
          <input
            name="requiredSkills"
            value={newJob.requiredSkills}
            onChange={(e) =>
              setNewJob((prev) => ({
                ...prev,
                requiredSkills: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
            placeholder="Skills (comma-separated)"
            className="input"
          />
          <button type="submit" className="btn-primary">
            Create Job
          </button>
        </form>

        {/* Existing Jobs */}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="space-y-6">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job}>
              <button
                onClick={() => setShowModalFor(job._id)}
                className="mt-2 btn-secondary"
              >
                View Candidates
              </button>
            </JobCard>
          ))}
        </div>

        {/* Modal for candidates */}
        {showModalFor && (
          <MatchedCandidatesModal
            jobId={showModalFor}
            onClose={() => setShowModalFor(null)}
          />
        )}
      </div>
    </div>
  );
}
