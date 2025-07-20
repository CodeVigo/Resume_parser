import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Upload,
  FileText,
  Award,
  Calendar,
  Building,
  GraduationCap,
  Plus,
  Eye
} from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      if (user?.role === 'student') {
        // Fetch student dashboard data
        const [jobsResponse, scoresResponse] = await Promise.all([
          api.get('/jobs?limit=5'),
          user.resumeId ? api.get('/candidates/my/scores').catch(() => ({ data: null })) : Promise.resolve({ data: null })
        ])
        
        setDashboardData({
          recentJobs: jobsResponse.data.jobs,
          totalJobs: jobsResponse.data.total,
          resumeScores: scoresResponse.data
        })
      } else {
        // Fetch recruiter dashboard data
        const [jobsResponse, candidatesResponse] = await Promise.all([
          api.get('/jobs/my/jobs?limit=5'),
          api.get('/candidates/overview?limit=5')
        ])
        
        setDashboardData({
          myJobs: jobsResponse.data.jobs,
          totalMyJobs: jobsResponse.data.total,
          recentCandidates: candidatesResponse.data.candidates,
          totalCandidates: candidatesResponse.data.total
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
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
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'student' 
              ? 'Discover new opportunities and track your application progress'
              : 'Manage your job postings and discover talented candidates'
            }
          </p>
        </div>

        {user?.role === 'student' ? (
          <StudentDashboard user={user} data={dashboardData} />
        ) : (
          <RecruiterDashboard user={user} data={dashboardData} />
        )}
      </div>
    </div>
  )
}

const StudentDashboard = ({ user, data }) => {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploading(true)
    setUploadMessage('')

    const formData = new FormData()
    formData.append('resume', file)

    try {
      const response = await api.post('/upload/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setUploadedFile(file.name)
      setUploadMessage('Resume uploaded successfully! Processing will begin shortly.')
      
      // Refresh page after a short delay to show updated data
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      setUploadMessage(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const stats = [
    {
      title: 'Available Jobs',
      value: data?.totalJobs || 0,
      icon: Briefcase,
      color: 'text-primary-600 bg-primary-100'
    },
    {
      title: 'Resume Score',
      value: data?.resumeScores?.averageScore || 'N/A',
      icon: Award,
      color: 'text-success-600 bg-success-100',
      suffix: data?.resumeScores?.averageScore ? '/100' : ''
    },
    {
      title: 'Job Matches',
      value: data?.resumeScores?.totalJobs || 0,
      icon: TrendingUp,
      color: 'text-secondary-600 bg-secondary-100'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}{stat.suffix}
                </p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resume Upload */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Resume</h3>
            </div>
            
            {!user.resumeId ? (
              <div className="text-center py-6">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload your resume to get started</p>
                
                <label className="btn-primary cursor-pointer inline-flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Resume'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                
                <p className="text-xs text-gray-500 mt-2">
                  Supports PDF, DOC, DOCX (max 5MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">Resume uploaded</span>
                  </div>
                  <span className="badge badge-success">Active</span>
                </div>
                
                <label className="btn-secondary cursor-pointer inline-flex items-center w-full justify-center">
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Update Resume'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            )}
            
            {uploadMessage && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                uploadMessage.includes('successfully') 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {uploadMessage}
              </div>
            )}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Job Opportunities</h3>
              <a href="/jobs" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </a>
            </div>
            
            {data?.recentJobs?.length > 0 ? (
              <div className="space-y-4">
                {data.recentJobs.map((job) => (
                  <div key={job._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Building className="w-4 h-4 mr-1" />
                          <span>{job.company}</span>
                          <span className="mx-2">•</span>
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center mt-2">
                          <span className={`badge ${
                            job.jobType === 'internship' ? 'badge-primary' : 
                            job.jobType === 'full-time' ? 'badge-success' : 'badge-warning'
                          }`}>
                            {job.jobType}
                          </span>
                        </div>
                      </div>
                      <a 
                        href={`/jobs/${job._id}`}
                        className="btn-primary btn-sm"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No jobs available at the moment</p>
                <p className="text-sm text-gray-500">Check back soon for new opportunities!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resume Scores */}
      {data?.resumeScores && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Job Match Scores</h3>
            <span className="text-sm text-gray-600">
              {data.resumeScores.totalJobs} jobs analyzed
            </span>
          </div>
          
          {data.resumeScores.scores?.length > 0 ? (
            <div className="space-y-4">
              {data.resumeScores.scores.slice(0, 5).map((score, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{score.job.title}</h4>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Building className="w-4 h-4 mr-1" />
                      <span>{score.job.company}</span>
                      <span className="mx-2">•</span>
                      <span>{score.job.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        score.score >= 80 ? 'text-green-600' :
                        score.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {score.score}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {score.meetsThreshold ? 'Qualified' : 'Below threshold'}
                      </div>
                    </div>
                    <a 
                      href={`/jobs/${score.job._id}`}
                      className="btn-secondary btn-sm"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No job scores available yet</p>
              <p className="text-sm text-gray-500">Upload your resume to see how you match with available jobs</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const RecruiterDashboard = ({ user, data }) => {
  const stats = [
    {
      title: 'My Jobs',
      value: data?.totalMyJobs || 0,
      icon: Briefcase,
      color: 'text-primary-600 bg-primary-100'
    },
    {
      title: 'Total Candidates',
      value: data?.totalCandidates || 0,
      icon: Users,
      color: 'text-secondary-600 bg-secondary-100'
    },
    {
      title: 'This Month',
      value: '24', // This would come from actual data
      icon: Calendar,
      color: 'text-accent-600 bg-accent-100'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="/create-job"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Plus className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Create New Job</h4>
              <p className="text-sm text-gray-600">Post a new job opportunity</p>
            </div>
          </a>
          
          <a 
            href="/candidates"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-secondary-300 hover:bg-secondary-50 transition-colors"
          >
            <Users className="w-8 h-8 text-secondary-600 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Browse Candidates</h4>
              <p className="text-sm text-gray-600">Find qualified candidates</p>
            </div>
          </a>
          
          <a 
            href="/my-jobs"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-accent-300 hover:bg-accent-50 transition-colors"
          >
            <Briefcase className="w-8 h-8 text-accent-600 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Manage Jobs</h4>
              <p className="text-sm text-gray-600">View and edit your postings</p>
            </div>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Jobs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Job Postings</h3>
            <a href="/my-jobs" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </a>
          </div>
          
          {data?.myJobs?.length > 0 ? (
            <div className="space-y-4">
              {data.myJobs.map((job) => (
                <div key={job._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{job.location}</p>
                      <div className="flex items-center mt-2">
                        <span className={`badge ${
                          job.isActive ? 'badge-success' : 'badge-error'
                        }`}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="badge badge-primary ml-2">
                          {job.jobType}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {job.applicationsCount || 0} applicants
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No job postings yet</p>
              <a href="/create-job" className="btn-primary">
                Create Your First Job
              </a>
            </div>
          )}
        </div>

        {/* Recent Candidates */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Candidates</h3>
            <a href="/candidates" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </a>
          </div>
          
          {data?.recentCandidates?.length > 0 ? (
            <div className="space-y-4">
              {data.recentCandidates.map((candidate) => (
                <div key={candidate.studentId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{candidate.name}</h4>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <GraduationCap className="w-4 h-4 mr-1" />
                        <span>{candidate.university}</span>
                      </div>
                      <p className="text-sm text-gray-600">{candidate.major}</p>
                      {candidate.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {candidate.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="badge badge-primary text-xs">
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{candidate.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        Class of {candidate.graduationYear}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No candidates available yet</p>
              <p className="text-sm text-gray-500">Students will appear here as they upload resumes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard