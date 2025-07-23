import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import LoadingSpinner from "./LoadingSpinner";
import { getJobCandidates, shortlistCandidate } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function MatchedCandidatesModal({ jobId, onClose }) {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shortlisting, setShortlisting] = useState(null);

  useEffect(() => {
    async function fetchCandidates() {
      try {
        setLoading(true);
        const { data } = await getJobCandidates(jobId);
        setCandidates(data.candidates || data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCandidates();
  }, [jobId]);

  const handleShortlist = async (resumeId) => {
    setShortlisting(resumeId);
    try {
      await shortlistCandidate({ jobId, resumeId });
      toast.success("Candidate shortlisted and notified");
      setCandidates((prev) =>
        prev.map((c) =>
          c.resumeId === resumeId ? { ...c, shortlisted: true } : c
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to shortlist candidate");
    } finally {
      setShortlisting(null);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Matched Candidates</h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner size="medium" />
          </div>
        ) : (
          <ul className="space-y-4 max-h-96 overflow-y-auto">
            {candidates.map((c) => (
              <li
                key={c.resumeId}
                className="bg-gray-50 p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{c.student.name}</p>
                  <p className="text-sm text-gray-600">Score: {c.score}</p>
                </div>
                <button
                  disabled={c.shortlisted || shortlisting === c.resumeId}
                  onClick={() => handleShortlist(c.resumeId)}
                  className={`btn-primary ${
                    c.shortlisted ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {c.shortlisted
                    ? "Shortlisted"
                    : shortlisting === c.resumeId
                    ? "..."
                    : "Shortlist"}
                </button>
              </li>
            ))}
            {candidates.length === 0 && (
              <p className="text-center text-gray-500">No candidates found.</p>
            )}
          </ul>
        )}
      </div>
    </Dialog>
  );
}
