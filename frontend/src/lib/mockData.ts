export interface Gig {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  postedBy: User;
  skills: string[];
  status: 'open' | 'in-progress' | 'completed';
  createdAt: string;
  applicants: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  college: string;
  rating: number;
  skills: string[];
  bio: string;
  gigsCompleted: number;
  joined: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  teamSize: number;
  currentMembers: number;
  skills: string[];
  createdBy: User;
  status: 'recruiting' | 'active' | 'completed';
  createdAt: string;
}

export interface Review {
  id: string;
  reviewer: User;
  rating: number;
  comment: string;
  gigTitle: string;
  createdAt: string;
}

export const mockUsers: User[] = [
  { id: '1', name: 'Aarav Sharma', avatar: '', college: 'IIT Delhi', rating: 4.8, skills: ['React', 'Node.js', 'UI/UX'], bio: 'Full-stack dev passionate about building student tools.', gigsCompleted: 12, joined: '2025-01-15' },
  { id: '2', name: 'Priya Patel', avatar: '', college: 'NIT Trichy', rating: 4.9, skills: ['Python', 'ML', 'Data Science'], bio: 'ML enthusiast and data wizard.', gigsCompleted: 8, joined: '2025-02-10' },
  { id: '3', name: 'Rahul Verma', avatar: '', college: 'BITS Pilani', rating: 4.5, skills: ['Graphic Design', 'Figma', 'Branding'], bio: 'Creative designer with an eye for detail.', gigsCompleted: 15, joined: '2024-11-20' },
  { id: '4', name: 'Sneha Gupta', avatar: '', college: 'VIT Vellore', rating: 4.7, skills: ['Content Writing', 'SEO', 'Marketing'], bio: 'Words are my superpower.', gigsCompleted: 20, joined: '2024-12-05' },
  { id: '5', name: 'Karan Singh', avatar: '', college: 'DTU Delhi', rating: 4.6, skills: ['Video Editing', 'Motion Graphics', 'Photography'], bio: 'Visual storyteller and filmmaker.', gigsCompleted: 10, joined: '2025-03-01' },
];

export const mockGigs: Gig[] = [
  { id: '1', title: 'Build a Portfolio Website', description: 'Need a responsive portfolio site with React and Tailwind CSS. Should include project showcase, about section, and contact form.', category: 'Web Development', budget: 3000, deadline: '2026-04-15', postedBy: mockUsers[0], skills: ['React', 'Tailwind CSS', 'TypeScript'], status: 'open', createdAt: '2026-03-20', applicants: 5 },
  { id: '2', title: 'Logo Design for College Fest', description: 'Design a modern, vibrant logo for our annual tech fest. Must work on print and digital media.', category: 'Graphic Design', budget: 1500, deadline: '2026-04-10', postedBy: mockUsers[1], skills: ['Illustrator', 'Figma', 'Branding'], status: 'open', createdAt: '2026-03-22', applicants: 8 },
  { id: '3', title: 'ML Model for Attendance System', description: 'Develop a face recognition-based attendance system using Python and OpenCV.', category: 'Machine Learning', budget: 5000, deadline: '2026-05-01', postedBy: mockUsers[2], skills: ['Python', 'OpenCV', 'TensorFlow'], status: 'in-progress', createdAt: '2026-03-18', applicants: 3 },
  { id: '4', title: 'Social Media Content for Club', description: 'Create 30 days of Instagram content including posts, stories, and reels scripts for coding club.', category: 'Content Creation', budget: 2000, deadline: '2026-04-20', postedBy: mockUsers[3], skills: ['Canva', 'Copywriting', 'Social Media'], status: 'open', createdAt: '2026-03-24', applicants: 12 },
  { id: '5', title: 'Edit Documentary Short Film', description: 'Edit a 15-minute documentary about campus life. Raw footage will be provided.', category: 'Video Editing', budget: 4000, deadline: '2026-04-25', postedBy: mockUsers[4], skills: ['Premiere Pro', 'After Effects', 'Color Grading'], status: 'open', createdAt: '2026-03-23', applicants: 4 },
  { id: '6', title: 'Tutor for Data Structures', description: 'Looking for a tutor to help with DSA prep for placement season. 2 hours/week for 4 weeks.', category: 'Tutoring', budget: 2500, deadline: '2026-05-15', postedBy: mockUsers[0], skills: ['C++', 'Algorithms', 'Problem Solving'], status: 'open', createdAt: '2026-03-25', applicants: 6 },
];

export const mockProjects: Project[] = [
  { id: '1', title: 'Campus Food Delivery App', description: 'Building a food ordering app specifically for campus canteens and nearby eateries. Looking for developers and designers.', category: 'Mobile App', teamSize: 5, currentMembers: 2, skills: ['React Native', 'Node.js', 'MongoDB'], createdBy: mockUsers[0], status: 'recruiting', createdAt: '2026-03-15' },
  { id: '2', title: 'AI Study Buddy', description: 'An AI-powered study assistant that creates personalized study plans and quizzes from lecture notes.', category: 'AI/ML', teamSize: 4, currentMembers: 1, skills: ['Python', 'NLP', 'React'], createdBy: mockUsers[1], status: 'recruiting', createdAt: '2026-03-20' },
  { id: '3', title: 'Student Marketplace', description: 'Platform for students to buy/sell used textbooks, electronics, and other items within campus.', category: 'Web App', teamSize: 3, currentMembers: 3, skills: ['Next.js', 'PostgreSQL', 'Stripe'], createdBy: mockUsers[2], status: 'active', createdAt: '2026-03-10' },
  { id: '4', title: 'Mental Health Chatbot', description: 'A compassionate chatbot providing initial mental health support and connecting students with counselors.', category: 'AI/ML', teamSize: 6, currentMembers: 3, skills: ['Python', 'GPT API', 'React', 'UX Research'], createdBy: mockUsers[3], status: 'recruiting', createdAt: '2026-03-22' },
];

export const mockReviews: Review[] = [
  { id: '1', reviewer: mockUsers[1], rating: 5, comment: 'Aarav delivered an amazing portfolio website. Clean code, responsive design, and delivered before deadline!', gigTitle: 'Build a Portfolio Website', createdAt: '2026-03-10' },
  { id: '2', reviewer: mockUsers[0], rating: 4, comment: 'Great logo designs with multiple variations. Quick turnaround and open to feedback.', gigTitle: 'Logo Design for College Fest', createdAt: '2026-03-12' },
  { id: '3', reviewer: mockUsers[3], rating: 5, comment: 'Priya built an excellent ML model. Very knowledgeable and professional.', gigTitle: 'ML Model for Attendance System', createdAt: '2026-03-14' },
  { id: '4', reviewer: mockUsers[2], rating: 4, comment: 'Sneha created engaging content that boosted our engagement by 40%. Highly recommend!', gigTitle: 'Social Media Content for Club', createdAt: '2026-03-16' },
  { id: '5', reviewer: mockUsers[4], rating: 5, comment: 'Outstanding tutoring sessions. Explained complex concepts very clearly.', gigTitle: 'Tutor for Data Structures', createdAt: '2026-03-18' },
];

export const categories = [
  'Web Development', 'Graphic Design', 'Machine Learning', 'Content Creation',
  'Video Editing', 'Tutoring', 'Mobile App', 'Data Entry', 'Photography', 'Music Production'
];
