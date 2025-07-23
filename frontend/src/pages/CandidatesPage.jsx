import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { getJobCandidates } from "../services/api";

export default function CandidatesPage() {
  const { jobId = "" } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getJobCandidates(jobId);
        setCandidates(res.data.candidates || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load candidates");
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  if (loading) return <LoadingSpinner size="large" />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!candidates.length) return <p>No matched candidates yet.</p>;

  return (
    <div className="space-y-4 max-w-2xl mx-auto py-8">
      {candidates.map((c) => (
        <div
          key={c.resumeId}
          className="bg-white p-4 rounded shadow flex justify-between items-center"
        >
          <div>
            <h3 className="text-lg font-semibold">{c.student.name}</h3>
            <p className="text-sm text-gray-600">
              {c.student.university} • {c.student.major}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-xl">{c.score}/100</p>
            <p className="text-xs text-gray-500">ATS Score</p>
          </div>
        </div>
      ))}
    </div>
  );
}
