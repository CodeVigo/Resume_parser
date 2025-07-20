import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../services/api'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Calendar,
  MapPin,
  DollarSign,
  Award,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'

const MyJobsPage = () => {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchMyJobs()
  }, [])

  const fetchMyJobs = async () => {
    try {
      const response = await api.get('/jobs/my/jobs')
      setJobs(response.data.jobs)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) {
      return
    }

    setDeleting(jobId)
    try {
      await api.delete(`/jobs/${jobId}`)
      setJobs(jobs.filter(job => job._id !== jobId))
    } catch (error) {
      console.error('Error deleting job:', error)
      alert('Failed to delete job posting')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
      await api.put(`/jobs/${jobId}`, { isActive: !currentStatus })
      setJobs(jobs.map(job => 
        job._id === jobId ? { ...job, isActive: !currentStatus } : job
      ))
    } catch (error) {
      console.error('Error updating job status:', error)
      alert('Failed to update job status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Job Postings</h1>
            <p className="text-gray-600 mt-2">
              Manage your job postings and track applications
            </p>
          </div>
          <a href="/create-job" className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Create New Job
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary-100">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
                <p className="text-sm text-gray-600">Total Jobs</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-success-100">
                <Award className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.filter(job => job.isActive).length}
                </p>
                <p className="text-sm text-gray-600">Active Jobs</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-secondary-100">
                <Users className="w-6 h-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.reduce((sum, job) => sum + (job.applicationsCount || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Total Applications</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-accent-100">
                <Calendar className="w-6 h-6 text-accent-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.filter(job => {
                    const createdDate = new Date(job.createdAt)
                    const thirtyDaysAgo = new Date()
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                    return createdDate >= thirtyDaysAgo
                  }).length}
                </p>
                <p className="text-sm text-gray-600">This Month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Job Postings Yet</h3>
            <p className="text-gray-600 mb-6">Create your first job posting to start finding candidates</p>
            <a href="/create-job" className="btn-primary">
              Create Job Posting
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div key={job._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{job.location}</span>
                          </div>
                          {job.salary?.min && job.salary?.max && (
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              <span>
                                ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className={`badge ${
                            job.jobType === 'internship' ? 'badge-primary' :
                            job.jobType === 'full-time' ? 'badge-success' :
                            job.jobType === 'part-time' ? 'badge-warning' : 'badge-secondary'
                          }`}>
                            {job.jobType}
                          </span>
                          <span className={`badge ${
                            job.isActive ? 'badge-success' : 'badge-error'
                          }`}>
                            {job.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="badge badge-primary">
                            Threshold: {job.scoreThreshold}%
                          </span>
                        </div>

                        {/* Required Skills Preview */}
                        {job.requiredSkills && job.requiredSkills.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {job.requiredSkills.slice(0, 5).map((skill, index) => (
                                <span
                                  key={index}
                                  className="badge badge-primary text-xs"
                                >
                                  {skill.skill}
                                </span>
                              ))}
                              {job.requiredSkills.length > 5 && (
                                <span className="text-xs text-gray-500">
                                  +{job.requiredSkills.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600">
                          {job.applicationsCount || 0}
                        </div>
                        <div className="text-sm text-gray-500">Applications</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleStatus(job._id, job.isActive)}
                          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                          {job.isActive ? (
                            <ToggleRight className="w-5 h-5 text-success-600 mr-1" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400 mr-1" />
                          )}
                          {job.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                      
                      <div className="flex space-x-3">
                        <a
                          href={`/candidates?job=${job._id}`}
                          className="btn-secondary flex items-center text-sm"
                        >
                          <Users className="w-4 h-4 mr-1" />
                          View Candidates
                        </a>
                        <a
                          href={`/jobs/${job._id}`}
                          className="btn-secondary flex items-center text-sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </a>
                        <button className="btn-secondary flex items-center text-sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          disabled={deleting === job._id}
                          className="btn-danger flex items-center text-sm disabled:opacity-50"
                        >
                          {deleting === job._id ? (
                            <LoadingSpinner size="small" className="mr-1" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-1" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyJobsPage