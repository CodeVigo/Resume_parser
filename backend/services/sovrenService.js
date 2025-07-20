import axios from 'axios';

class SovrenService {
  constructor() {
    this.baseURL = process.env.SOVREN_BASE_URL;
    this.accountId = process.env.SOVREN_ACCOUNT_ID;
    this.serviceKey = process.env.SOVREN_SERVICE_KEY;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Sovren-AccountId': this.accountId,
        'Sovren-ServiceKey': this.serviceKey
      },
      timeout: 30000
    });
  }
  
  // Parse resume using Sovren API
  async parseResume(documentBase64, filename) {
    try {
      const response = await this.client.post('/parser/resume', {
        DocumentAsBase64String: documentBase64,
        OutputHtml: false,
        OutputRtf: false,
        OutputPdf: false,
        DocumentLastModified: new Date().toISOString(),
        Configuration: {
          UseLLMParser: true,
          NormalizeProfessionsV2: true,
          ExtractPersonalAttributes: true
        }
      });
      
      if (response.data.Info.Code === 'Success') {
        return this.formatParsedData(response.data.Value.ResumeData);
      } else {
        throw new Error(response.data.Info.Message || 'Parsing failed');
      }
    } catch (error) {
      console.error('Sovren parsing error:', error.message);
      
      // Return mock data for development/testing
      return this.getMockParsedData(filename);
    }
  }
  
  // Format Sovren response to our schema
  formatParsedData(resumeData) {
    return {
      personalInfo: {
        name: resumeData.ContactInformation?.CandidateName?.FormattedName || '',
        email: resumeData.ContactInformation?.EmailAddresses?.[0]?.InternetAddress || '',
        phone: resumeData.ContactInformation?.Telephones?.[0]?.Raw || '',
        address: resumeData.ContactInformation?.Location?.Municipality || ''
      },
      skills: resumeData.Skills?.Raw?.map(skill => ({
        name: skill.Name,
        level: skill.FoundIn?.[0]?.SectionType || 'unknown',
        yearsOfExperience: skill.MonthsOfExperience ? Math.floor(skill.MonthsOfExperience / 12) : 0
      })) || [],
      education: resumeData.Education?.EducationDetails?.map(edu => ({
        degree: edu.Degree?.Name?.Raw || '',
        institution: edu.SchoolName?.Raw || '',
        graduationDate: edu.LastEducationDate?.Date || null,
        gpa: edu.GPA?.Score || null
      })) || [],
      experience: resumeData.EmploymentHistory?.Positions?.map(pos => ({
        title: pos.JobTitle?.Raw || '',
        company: pos.Employer?.Name?.Raw || '',
        startDate: pos.StartDate?.Date || null,
        endDate: pos.EndDate?.Date || null,
        description: pos.Description || ''
      })) || [],
      certifications: resumeData.Certifications?.map(cert => ({
        name: cert.Name || '',
        issuer: cert.Issuer || '',
        issueDate: cert.EffectiveDate?.Date || null,
        expiryDate: cert.ExpirationDate?.Date || null
      })) || []
    };
  }
  
  // Mock data for development/testing
  getMockParsedData(filename) {
    return {
      personalInfo: {
        name: `Mock Student ${Math.floor(Math.random() * 1000)}`,
        email: `student${Math.floor(Math.random() * 1000)}@university.edu`,
        phone: '+1-555-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0'),
        address: 'University City, State'
      },
      skills: [
        { name: 'JavaScript', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'React', level: 'intermediate', yearsOfExperience: 1 },
        { name: 'Node.js', level: 'beginner', yearsOfExperience: 1 },
        { name: 'Python', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'SQL', level: 'beginner', yearsOfExperience: 1 }
      ],
      education: [{
        degree: 'Bachelor of Science in Computer Science',
        institution: 'State University',
        graduationDate: new Date('2024-05-15'),
        gpa: 3.5
      }],
      experience: [{
        title: 'Software Engineering Intern',
        company: 'Tech Company Inc.',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2023-08-31'),
        description: 'Developed web applications using React and Node.js'
      }],
      certifications: [{
        name: 'AWS Cloud Practitioner',
        issuer: 'Amazon Web Services',
        issueDate: new Date('2023-09-15'),
        expiryDate: new Date('2026-09-15')
      }]
    };
  }
}

export default new SovrenService();