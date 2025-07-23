// frontend/src/components/JobCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Users, Calendar, MapPin, DollarSign, Clock } from "lucide-react";

/**
 * Reusable job card component
 * Props:
 *  - job: job object
 *  - userRole: 'student' | 'recruiter'
 *  - onViewCandidates?: () => void (for recruiter)
 *  - onApply?: () => void (for student)
 */
export default function JobCard({ job, userRole, onViewCandidates, onApply }) {
  const postedDate = new Date(job.createdAt).toLocaleDateString();

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {job.title}
          </h3>
          <div className="flex items-center text-gray-600 space-x-3 mb-3">
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> {job.location}
            </span>
            {job.salary?.min && job.salary?.max && (
              <span className="flex items-center">
                {job.salary.currency === "INR" ? (
                  <>
                    <span className="mr-1">₹</span>
                    {job.salary.min.toLocaleString()} - ₹
                    {job.salary.max.toLocaleString()}
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-1" />$
                    {job.salary.min.toLocaleString()} - $
                    {job.salary.max.toLocaleString()}
                  </>
                )}
              </span>
            )}
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" /> {postedDate}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((s, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                {s.skill}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          {userRole === "student" && onApply && (
            <button
              onClick={onApply}
              className="btn-primary px-4 py-2 flex items-center"
            >
              Apply Now
            </button>
          )}
          {userRole === "recruiter" && onViewCandidates && (
            <button
              onClick={onViewCandidates}
              className="btn-secondary px-4 py-2 flex items-center"
            >
              View Candidates
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
