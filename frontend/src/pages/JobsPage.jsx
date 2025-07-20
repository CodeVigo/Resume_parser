import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const JobsPage = () => {
  const { user } = useAuth();
  // … your jobs fetch logic …

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div key={job.id} className="bg-white p-4 rounded shadow">
          {/* … other job details … */}
          <div className="flex space-x-3">
            <button
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => saveJob(job.id)}
            >
              Save
            </button>
            <Link
              to={`/jobs/${job.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block text-center"
            >
              {user?.role === "student" ? "Apply Now" : "View Details"}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobsPage;
