import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  ArrowRight, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Shield,
  CheckCircle,
  Star,
  Building,
  GraduationCap
} from 'lucide-react'

const LandingPage = () => {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: Users,
      title: 'Smart Matching',
      description: 'Our AI-powered system matches students with the most relevant opportunities based on skills and preferences.'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Your data is protected with enterprise-grade security and privacy measures.'
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Track your progress and get insights to improve your profile and increase your chances.'
    },
    {
      icon: Briefcase,
      title: 'Top Companies',
      description: 'Connect with leading companies actively recruiting from top universities.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer at Google',
      university: 'Stanford University',
      quote: 'CampusHire helped me land my dream job! The platform made it so easy to connect with recruiters.',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'HR Director at Microsoft',
      company: 'Microsoft',
      quote: 'We found amazing talent through CampusHire. The quality of candidates is exceptional.',
      rating: 5
    },
    {
      name: 'Emily Johnson',
      role: 'Data Scientist at Netflix',
      university: 'MIT',
      quote: 'The resume scoring feature helped me understand exactly what recruiters were looking for.',
      rating: 5
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Students Placed' },
    { number: '500+', label: 'Partner Companies' },
    { number: '95%', label: 'Success Rate' },
    { number: '50+', label: 'Universities' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow-lg">
              Your Gateway to
              <span className="block text-accent-300">Dream Careers</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-100">
              Connect talented students with top employers through our AI-powered matching platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-bold py-4 px-8 rounded-lg transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CampusHire?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing campus recruitment with cutting-edge technology and personalized experiences
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow duration-200">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Students & Recruiters */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* For Students */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-6">
                <GraduationCap className="w-8 h-8 text-secondary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Students</h3>
              <p className="text-gray-600 mb-6">
                Showcase your skills, upload your resume, and get matched with opportunities that align with your career goals.
              </p>
              <ul className="space-y-3 text-left">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3" />
                  <span>AI-powered resume analysis and scoring</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3" />
                  <span>Personalized job recommendations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3" />
                  <span>Direct connection with recruiters</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3" />
                  <span>Career development insights</span>
                </li>
              </ul>
            </div>

            {/* For Recruiters */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-full mb-6">
                <Building className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Recruiters</h3>
              <p className="text-gray-600 mb-6">
                Find the best talent efficiently with our advanced filtering and matching algorithms.
              </p>
              <ul className="space-y-3 text-left">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3" />
                  <span>Advanced candidate filtering and search</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3" />
                  <span>Automated resume screening and scoring</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3" />
                  <span>Customizable job requirements</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3" />
                  <span>Analytics and hiring insights</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Hear from students and recruiters who found success on our platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                  <div className="text-sm text-gray-500">
                    {testimonial.university || testimonial.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students and recruiters who have found success on CampusHire
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition-colors duration-200 inline-flex items-center"
            >
              Get Started Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="w-8 h-8" />
                <span className="font-bold text-xl">CampusHire</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Connecting talented students with leading employers through innovative technology and personalized matching.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Students</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Create Profile</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Upload Resume</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Recruiters</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/candidates" className="hover:text-white transition-colors">Find Talent</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Post Jobs</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Recruiter Login</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CampusHire. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage