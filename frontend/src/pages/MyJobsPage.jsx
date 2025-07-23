import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getRecruiterJobs, deleteJob, updateJob } from "../services/api";
import {
  Plus,
  Trash2,
  Eye,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function MyJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const res = await getRecruiterJobs();
      setJobs(res.data.jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this posting?")) return;
    setDeleting(id);
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const toggleStatus = async (id, isActive) => {
    try {
      await updateJob(id, { isActive: !isActive });
      setJobs((prev) =>
        prev.map((j) => (j._id === id ? { ...j, isActive: !isActive } : j))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Job Postings</h1>
          <a
            href="/create-job"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Create New Job
          </a>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg">No postings yet</h3>
            <a
              href="/create-job"
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create One
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white p-6 rounded-xl shadow flex flex-col lg:flex-row lg:justify-between"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                  <div className="flex gap-4 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" /> {job.location}
                    </div>
                    {job.salary?.min != null && job.salary?.max != null && (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />₹
                        {job.salary.min.toLocaleString()}–₹
                        {job.salary.max.toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />{" "}
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => toggleStatus(job._id, job.isActive)}
                    className="flex items-center px-3 py-2 border rounded hover:bg-gray-100 text-sm"
                  >
                    {job.isActive ? (
                      <ToggleRight className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-gray-400 mr-1" />
                    )}
                    {job.isActive ? "Active" : "Inactive"}
                  </button>
                  <a
                    href={`/candidates?job=${job._id}`}
                    className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                  >
                    <Users className="w-4 h-4 mr-1" /> View Candidates
                  </a>
                  <a
                    href={`/jobs/${job._id}`}
                    className="flex items-center px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" /> View
                  </a>
                  <button
                    onClick={() => handleDelete(job._id)}
                    disabled={deleting === job._id}
                    className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
