import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import api, { getParsedResume, getMyShortlists } from "../services/api";
import { Eye, FileText, Download } from "lucide-react";

export default function ResumeDetailsPage() {
  const { id: resumeId } = useParams();
  const { user } = useAuth();
  const [parsedResp, setParsedResp] = useState(null);
  const [scoresResp, setScoresResp] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [{ data: parsed }, { data: scores }] = await Promise.all([
          getParsedResume(resumeId),
          getMyShortlists(),
        ]);
        setParsedResp(parsed);
        setScoresResp(scores.scores || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load resume details.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [resumeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/dashboard" className="btn-primary">
          Back
        </Link>
      </div>
    );
  }

  const { parsedData, jobScores, filename } = parsedResp;
  // Find the current jobScore if coming via job link
  const jobScore = parsedResp.jobScore;
  // Compute overall
  const overall = jobScores.length
    ? Math.round(
        jobScores.reduce((sum, js) => sum + js.score, 0) / jobScores.length
      )
    : 0;

  const handleDownload = async () => {
    try {
      const res = await api.get(`/upload/resume/${resumeId}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", filename);
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      alert("Download failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Resume Details</h1>
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
        </div>

        {/* Scores */}
        <div className="flex space-x-6">
          <div>
            <p className="text-sm text-gray-600">This Job Score</p>
            <p className="text-xl font-semibold">
              {jobScore?.score ?? "N/A"}/100
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Overall Score</p>
            <p className="text-xl font-semibold">{overall}/100</p>
          </div>
        </div>

        {/* Parsed Data */}
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Parsed Data</h2>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(parsedData, null, 2)}
          </pre>
        </section>

        {/* Past Applications */}
        {scoresResp.length > 0 && (
          <section className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
            <ul className="space-y-2">
              {scoresResp.map((s) => (
                <li key={s.job._id} className="flex justify-between">
                  <span>{s.job.title}</span>
                  <span
                    className={`font-semibold ${
                      s.meetsThreshold ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {s.score}%
                  </span>
                  <Link
                    to={`/jobs/${s.job._id}`}
                    className="flex items-center text-sm text-blue-600"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
