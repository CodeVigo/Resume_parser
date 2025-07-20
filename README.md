# Campus Recruitment Platform

A comprehensive MERN stack application for campus recruitment with AI-powered resume matching and scoring.

## 🚀 Features

### For Students
- **Smart Resume Upload & Analysis**: Upload resumes with automatic parsing and skill extraction
- **AI-Powered Job Matching**: Get matched with relevant opportunities based on skills and profile
- **Resume Scoring**: See how your resume scores against specific job requirements
- **Job Search & Discovery**: Browse and search for internships and full-time positions
- **Profile Management**: Manage your academic and professional information

### For Recruiters
- **Advanced Candidate Search**: Find qualified candidates with powerful filtering options
- **Automated Resume Screening**: AI-powered resume scoring and ranking
- **Job Posting Management**: Create, edit, and manage job postings
- **Candidate Analytics**: Get insights into candidate quality and matching scores
- **Resume Download**: Access and download matched candidate resumes

### Technical Features
- **OAuth & Local Authentication**: Google OAuth and email/password login
- **Real-time Processing**: Background resume processing with status updates
- **Secure File Storage**: GridFS for resume storage with download protection
- **Redis Caching**: Cached parsing and scoring results for better performance
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Docker Deployment**: Complete containerized deployment setup

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for routing
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **GridFS** for file storage
- **Redis** for caching
- **Passport.js** for authentication
- **JWT** with HttpOnly cookies
- **Multer** for file uploads

### APIs & Services
- **Sovren API** for resume parsing (with mock fallback)
- **Google OAuth 2.0** for authentication

### Infrastructure
- **Docker & Docker Compose**
- **Nginx** for frontend serving
- **MongoDB** for primary database
- **Redis** for caching

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd campus-recruitment-app
```

### 2. Environment Setup
The `.env` file is already configured with the provided credentials. For production, update the following in `backend/.env`:

```env
# MongoDB (Update for production)
MONGO_URI=mongodb+srv://GoVi:abcd1234@cluster0.opq17vg.mongodb.net/campusRecruitment?retryWrites=true&w=majority

# Google OAuth (Already configured)
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET


# JWT Secret (Update for production)
JWT_SECRET=your_super_secret_jwt_key_for_campus_recruitment_2024

# Sovren API (Optional - for real resume parsing)
SOVREN_ACCOUNT_ID=your_sovren_account_id
SOVREN_SERVICE_KEY=your_sovren_service_key
```

### 3. Run with Docker (Recommended)
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

### 4. Manual Development Setup

#### Backend Setup
```bash
cd backend
npm install
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Database Setup
Make sure MongoDB and Redis are running locally or use the provided Docker services.

## 📁 Project Structure

```
campus-recruitment-app/
├── backend/                 # Node.js/Express API
│   ├── config/             # Database and Passport configuration
│   ├── controllers/        # Route controllers (not used in this setup)
│   ├── middleware/         # Auth, upload, and error handling
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── services/          # Business logic (Sovren, Redis, Scoring)
│   ├── utils/             # Utility functions
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── Dockerfile         # Backend container config
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context (Auth)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json       # Frontend dependencies
│   ├── tailwind.config.js # Tailwind configuration
│   ├── vite.config.js     # Vite configuration
│   ├── nginx.conf         # Nginx configuration
│   └── Dockerfile         # Frontend container config
│
├── scripts/                # Database initialization
│   └── mongo-init.js      # MongoDB setup script
│
├── docker-compose.yml      # Complete application setup
└── README.md              # This file
```

## 🔐 Authentication Flow

The application supports two authentication methods:

### 1. Google OAuth
- Click "Sign in with Google"
- Redirects to Google OAuth consent screen
- Returns to dashboard upon successful authentication

### 2. Email/Password
- Register with email, password, and role-specific information
- Login with email and password
- JWT tokens stored in HttpOnly cookies for security

### Security Features
- **JWT with HttpOnly Cookies**: Secure token storage
- **Silent Token Refresh**: Automatic token renewal
- **Role-based Access Control**: Student and recruiter permissions
- **Password Hashing**: bcrypt for password security

## 📊 Resume Processing & Scoring

### Resume Upload Process
1. **File Upload**: Students upload PDF/DOC resumes (max 5MB)
2. **GridFS Storage**: Files stored in MongoDB GridFS
3. **Background Processing**: Asynchronous parsing with Sovren API
4. **Data Extraction**: Skills, education, experience extraction
5. **Caching**: Results cached in Redis for performance

### Scoring Algorithm
The ATS scoring system evaluates resumes based on:

- **Skill Matching** (70%): Direct skill matches with job requirements
- **Education Bonus** (15%): Relevant degree and institution
- **Experience Bonus** (10%): Related work experience
- **Certification Bonus** (5%): Professional certifications

Scores range from 0-100, with configurable thresholds per job.

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job (recruiters only)
- `PUT /api/jobs/:id` - Update job (recruiters only)
- `DELETE /api/jobs/:id` - Delete job (recruiters only)
- `GET /api/jobs/my/jobs` - Get recruiter's jobs

### Resume Upload
- `POST /api/upload/resume` - Upload resume (students only)
- `GET /api/upload/resume/:id/download` - Download resume
- `GET /api/upload/resume/:id/status` - Get processing status
- `GET /api/upload/resume/:id/parsed` - Get parsed data

### Candidates
- `GET /api/candidates/job/:jobId` - Get matched candidates for job
- `GET /api/candidates/detail/:resumeId` - Get candidate details
- `GET /api/candidates/overview` - Get candidates overview
- `GET /api/candidates/my/scores` - Get student's job scores

## 🐳 Docker Deployment

### Local Development
```bash
# Start all services
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean up volumes
docker-compose down -v
```

### Production Deployment on AWS EC2

1. **Launch EC2 Instance**
   - Ubuntu 20.04 LTS or newer
   - t3.medium or larger recommended
   - Open ports 22, 80, 443, 3000, 5000

2. **Install Docker**
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose
   sudo usermod -aG docker ubuntu
   ```

3. **Deploy Application**
   ```bash
   git clone <repository-url>
   cd campus-recruitment-app
   
   # Update environment variables for production
   nano backend/.env
   
   # Deploy with Docker Compose
   docker-compose up -d --build
   ```

4. **Setup Domain & SSL** (Optional)
   - Configure DNS to point to your EC2 instance
   - Use Certbot with Nginx for SSL certificates

### Environment Variables for Production

Update these in `backend/.env` for production:

```env
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
JWT_SECRET=your-super-secure-production-secret-key
MONGO_URI=your-production-mongodb-connection-string
```

## 👥 User Roles & Permissions

### Students
- View and search jobs
- Upload and manage resume
- View job match scores
- Update profile information
- Download own resume

### Recruiters
- Create and manage job postings
- View and search candidates
- Download candidate resumes
- View candidate scores and analytics
- Manage company profile

## 🧪 Testing

### Manual Testing Checklist

#### Student Flow
1. ✅ Register as student with university info
2. ✅ Login with email/password
3. ✅ Login with Google OAuth
4. ✅ Upload resume (PDF/DOC)
5. ✅ View processing status
6. ✅ Browse available jobs
7. ✅ View job match scores
8. ✅ Update profile information

#### Recruiter Flow
1. ✅ Register as recruiter with company info
2. ✅ Login and access dashboard
3. ✅ Create new job posting
4. ✅ Set required skills and weights
5. ✅ View matched candidates
6. ✅ Download candidate resumes
7. ✅ Manage job postings

#### System Testing
1. ✅ File upload validation (size, type)
2. ✅ Resume parsing (mock data)
3. ✅ Scoring algorithm accuracy
4. ✅ Redis caching functionality
5. ✅ Authentication and authorization
6. ✅ Responsive design on mobile

## 🚧 Known Limitations & Future Enhancements

### Current Limitations
- **Mock Resume Parsing**: Using mock data instead of real Sovren API
- **Basic Notification System**: No real-time notifications
- **Limited File Types**: Only PDF, DOC, DOCX supported
- **Single Resume**: Students can only upload one resume

### Planned Enhancements
- **Real-time Notifications**: WebSocket integration
- **Advanced Analytics**: Recruiter dashboard insights
- **Bulk Operations**: Bulk resume upload and processing
- **Interview Scheduling**: Integrated calendar system
- **Email Notifications**: Automated email alerts
- **Advanced Search**: Elasticsearch integration
- **Mobile App**: React Native mobile application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact: [your-email@example.com]

## 🙏 Acknowledgments

- **Sovren** for resume parsing API documentation
- **Google** for OAuth 2.0 integration
- **MongoDB Atlas** for database hosting
- **Tailwind CSS** for the beautiful UI components
- **React** and **Express** communities for excellent documentation