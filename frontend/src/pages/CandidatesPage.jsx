import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../services/api'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  GraduationCap, 
  Award,
  Calendar,
  MapPin,
  Star,
  Users
} from 'lucide-react'

const CandidatesPage = () => {
  const { user } = useAuth()
  const [candidates, setCandidates] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    university: '',
    major: '',
    minScore: 0
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    if (selectedJob) {
      fetchCandidates()
    }
  }, [selectedJob, filters])

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/my/jobs')
      setJobs(response.data.jobs)
      if (response.data.jobs.length > 0) {
        setSelectedJob(response.data.jobs[0]._id)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCandidates = async () => {
    if (!selectedJob) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams({
        minScore: filters.minScore,
        ...(filters.university && { university: filters.university }),
        ...(filters.major && { major: filters.major })
      })
      
      const response = await api.get(`/candidates/job/${selectedJob}?${params}`)
      setCandidates(response.data.candidates)
    } catch (error) {
      console.error('Error fetching candidates:', error)
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadResume = async (resumeId, filename) => {
    try {
      const response = await api.get(`/upload/resume/${resumeId}/download`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading resume:', error)
      alert('Failed to download resume')
    }
  }

  const filteredCandidates = candidates.filter(candidate =>
    candidate.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.student.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.student.major?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && !selectedJob) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Candidate Management</h1>
          <p className="text-gray-600 mt-2">
            Find and manage qualified candidates for your job postings
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Posted</h3>
            <p className="text-gray-600 mb-6">Create a job posting to start finding candidates</p>
            <a href="/create-job" className="btn-primary">
              Create Job Posting
            </a>
          </div>
        ) : (
          <>
            {/* Job Selection and Filters */}
            <div className="card mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Job Selection */}
                <div>
                  <label className="form-label">Select Job</label>
                  <select
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                    className="form-input"
                  >
                    {jobs.map(job => (
                      <option key={job._id} value={job._id}>
                        {job.title} - {job.company}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div>
                  <label className="form-label">Search Candidates</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by name, email, university..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-input pl-10"
                    />
                  </div>
                </div>

                {/* University Filter */}
                <div>
                  <label className="form-label">University</label>
                  <input
                    type="text"
                    placeholder="Filter by university"
                    value={filters.university}
                    onChange={(e) => setFilters({...filters, university: e.target.value})}
                    className="form-input"
                  />
                </div>

                {/* Score Filter */}
                <div>
                  <label className="form-label">Minimum Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Min score"
                    value={filters.minScore}
                    onChange={(e) => setFilters({...filters, minScore: parseInt(e.target.value) || 0})}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredCandidates.length} qualified candidates
                {selectedJob && jobs.find(j => j._id === selectedJob) && (
                  <span className="ml-2">
                    for <span className="font-medium">{jobs.find(j => j._id === selectedJob).title}</span>
                  </span>
                )}
              </p>
            </div>

            {/* Candidates List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Candidates Found</h3>
                <p className="text-gray-600">
                  {candidates.length === 0 
                    ? "No candidates meet the job requirements yet"
                    : "Try adjusting your search criteria"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCandidates.map((candidate) => (
                  <div key={candidate.resumeId} className="card hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {candidate.student.name}
                            </h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <GraduationCap className="w-4 h-4 mr-2" />
                              <span>{candidate.student.university}</span>
                            </div>
                            <div className="flex items-center text-gray-600 mb-2">
                              <Award className="w-4 h-4 mr-2" />
                              <span>{candidate.student.major}</span>
                            </div>
                            <div className="flex items-center text-gray-600 mb-4">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>Class of {candidate.student.graduationYear}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`text-3xl font-bold mb-1 ${
                              candidate.score >= 90 ? 'text-green-600' :
                              candidate.score >= 80 ? 'text-blue-600' :
                              candidate.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {candidate.score}%
                            </div>
                            <div className="text-sm text-gray-500">Match Score</div>
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(candidate.score / 20)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Skill Matches */}
                        {candidate.skillMatches && candidate.skillMatches.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Skill Matches:</h4>
                            <div className="flex flex-wrap gap-2">
                              {candidate.skillMatches.slice(0, 6).map((skill, index) => (
                                <span
                                  key={index}
                                  className={`badge text-xs ${
                                    skill.matched ? 'badge-success' : 'badge-error'
                                  }`}
                                >
                                  {skill.skill}
                                  {skill.matched && <span className="ml-1">✓</span>}
                                </span>
                              ))}
                              {candidate.skillMatches.length > 6 && (
                                <span className="text-xs text-gray-500">
                                  +{candidate.skillMatches.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>Resume uploaded {new Date(candidate.uploadedAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleDownloadResume(candidate.resumeId, candidate.originalName)}
                              className="btn-secondary flex items-center"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Resume
                            </button>
                            <button className="btn-primary flex items-center">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CandidatesPage