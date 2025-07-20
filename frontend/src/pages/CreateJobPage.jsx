import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../services/api'
import { 
  Plus, 
  X, 
  Building, 
  MapPin, 
  DollarSign, 
  Calendar,
  Award,
  Users
} from 'lucide-react'

const CreateJobPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    company: user?.company || '',
    description: '',
    requirements: '',
    location: '',
    salary: {
      min: '',
      max: '',
      currency: 'USD'
    },
    jobType: 'full-time',
    scoreThreshold: 60,
    deadlineDate: '',
    requiredSkills: []
  })
  const [newSkill, setNewSkill] = useState({ skill: '', weight: 5 })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.requiredSkills.length === 0) {
      setError('Please add at least one required skill')
      return
    }

    setLoading(true)

    try {
      const jobData = {
        ...formData,
        salary: {
          min: formData.salary.min ? parseInt(formData.salary.min) : undefined,
          max: formData.salary.max ? parseInt(formData.salary.max) : undefined,
          currency: formData.salary.currency
        },
        deadlineDate: formData.deadlineDate ? new Date(formData.deadlineDate) : undefined
      }

      const response = await api.post('/jobs', jobData)
      navigate('/my-jobs')
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create job')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('salary.')) {
      const salaryField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        salary: {
          ...prev.salary,
          [salaryField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const addSkill = () => {
    if (newSkill.skill.trim() && !formData.requiredSkills.find(s => s.skill === newSkill.skill.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, {
          skill: newSkill.skill.trim(),
          weight: parseInt(newSkill.weight)
        }]
      }))
      setNewSkill({ skill: '', weight: 5 })
    }
  }

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(skill => skill.skill !== skillToRemove)
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Job Posting</h1>
          <p className="text-gray-600 mt-2">
            Post a new job opportunity and find qualified candidates
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
              <p className="text-sm text-error-600">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="form-label">
                  Job Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Software Engineer Intern"
                />
              </div>

              <div>
                <label htmlFor="company" className="form-label">
                  Company *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="form-label">
                  Location *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="jobType" className="form-label">
                  Job Type
                </label>
                <select
                  id="jobType"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Salary Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="salary.min" className="form-label">
                  Minimum Salary
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="salary.min"
                    name="salary.min"
                    type="number"
                    value={formData.salary.min}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="salary.max" className="form-label">
                  Maximum Salary
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="salary.max"
                    name="salary.max"
                    type="number"
                    value={formData.salary.max}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="80000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="salary.currency" className="form-label">
                  Currency
                </label>
                <select
                  id="salary.currency"
                  name="salary.currency"
                  value={formData.salary.currency}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Job Details</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="description" className="form-label">
                  Job Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
                />
              </div>

              <div>
                <label htmlFor="requirements" className="form-label">
                  Requirements *
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  required
                  rows={6}
                  value={formData.requirements}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="List the qualifications, experience, and requirements for this position..."
                />
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Required Skills *</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Enter a skill (e.g., JavaScript, React, Python)"
                    value={newSkill.skill}
                    onChange={(e) => setNewSkill({...newSkill, skill: e.target.value})}
                    className="form-input"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                </div>
                <div className="w-32">
                  <select
                    value={newSkill.weight}
                    onChange={(e) => setNewSkill({...newSkill, weight: parseInt(e.target.value)})}
                    className="form-input"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>Weight {num}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={addSkill}
                  className="btn-primary flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </button>
              </div>

              {formData.requiredSkills.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Added Skills:</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
                      >
                        {skill.skill}
                        <span className="ml-2 text-xs bg-primary-200 px-2 py-0.5 rounded-full">
                          {skill.weight}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill.skill)}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Advanced Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="scoreThreshold" className="form-label">
                  Minimum Score Threshold (%)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Award className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="scoreThreshold"
                    name="scoreThreshold"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.scoreThreshold}
                    onChange={handleChange}
                    className="form-input pl-10"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Only candidates with scores above this threshold will be shown
                </p>
              </div>

              <div>
                <label htmlFor="deadlineDate" className="form-label">
                  Application Deadline
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="deadlineDate"
                    name="deadlineDate"
                    type="date"
                    value={formData.deadlineDate}
                    onChange={handleChange}
                    className="form-input pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/my-jobs')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Creating Job...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job Posting
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateJobPage