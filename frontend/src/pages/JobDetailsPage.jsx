import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../services/api'
import { 
  Building, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  Award,
  ArrowLeft,
  Bookmark,
  Send
} from 'lucide-react'

const JobDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchJobDetails()
  }, [id])

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${id}`)
      setJob(response.data)
    } catch (error) {
      setError('Failed to load job details')
      console.error('Error fetching job:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    setApplying(true)
    // Mock application process
    setTimeout(() => {
      setApplying(false)
      alert('Application submitted successfully!')
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => navigate('/jobs')}
              className="btn-primary"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </button>

        {/* Job Header */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Building className="w-5 h-5 mr-2" />
                  <span className="font-medium">{job.company}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span>{job.salary?.min && job.salary?.max 
                    ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`
                    : 'Competitive salary'
                  }</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`badge ${
                  job.jobType === 'internship' ? 'badge-primary' :
                  job.jobType === 'full-time' ? 'badge-success' :
                  job.jobType === 'part-time' ? 'badge-warning' : 'badge-secondary'
                }`}>
                  {job.jobType}
                </span>
                {job.isActive && (
                  <span className="badge badge-success">Active</span>
                )}
              </div>
            </div>

            {user?.role === 'student' && (
              <div className="flex flex-col sm:flex-row gap-3 lg:ml-8">
                <button className="btn-secondary flex items-center">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save Job
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="btn-primary flex items-center"
                >
                  {applying ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Apply Now
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
              </div>
            </div>

            {/* Required Skills */}
            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
                    >
                      {skill.skill}
                      {skill.weight && (
                        <span className="ml-2 text-xs bg-primary-200 px-2 py-0.5 rounded-full">
                          Weight: {skill.weight}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Company</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Building className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{job.company}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">{job.location}</span>
                </div>
                {job.recruiter && (
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Posted by {job.recruiter.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Job Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Applications</span>
                  <span className="font-medium">{job.applicationsCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Score Threshold</span>
                  <span className="font-medium">{job.scoreThreshold}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Job Type</span>
                  <span className="font-medium capitalize">{job.jobType}</span>
                </div>
                {job.deadlineDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deadline</span>
                    <span className="font-medium">
                      {new Date(job.deadlineDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Similar Jobs */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Jobs</h3>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium text-gray-900">Frontend Developer</h4>
                  <p className="text-sm text-gray-600">Tech Corp • Remote</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium text-gray-900">Software Engineer Intern</h4>
                  <p className="text-sm text-gray-600">StartupXYZ • San Francisco</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium text-gray-900">Full Stack Developer</h4>
                  <p className="text-sm text-gray-600">Innovation Labs • New York</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDetailsPage