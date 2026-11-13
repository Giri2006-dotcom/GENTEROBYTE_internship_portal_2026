import type { NextApiRequest, NextApiResponse } from 'next';

export interface Internship {
  id: string;
  title: string;
  domain: string;
  category: 'frontend' | 'backend' | 'design' | 'data' | 'ai' | 'fullstack';
  description: string;
  duration: string;
  location: 'Remote' | 'Hybrid' | 'Onsite';
  stipend: string;
  minStipendUsd: number;
  startDate: string;
  mode: string;
  skills: string[];
  benefits: string[];
  openings: number;
}

export const ALL_INTERNSHIPS: Internship[] = [
  {
    id: 'frontend-swe',
    title: 'Full Stack Frontend Engineering Intern',
    domain: 'Full Stack Web Development',
    category: 'frontend',
    description:
      'Work on production-grade applications, build responsive Next.js frontend interfaces, implement fluid animations with Tailwind CSS, and launch your software engineering career.',
    duration: '12 weeks',
    location: 'Remote',
    stipend: '$600 - $900 / month',
    minStipendUsd: 600,
    startDate: 'June 2026',
    mode: 'Remote / Hybrid',
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Git'],
    benefits: [
      'Certificate of Completion & Letter of Recommendation',
      'Direct 1-on-1 mentorship from principal architects',
      'Ship production code used by real-world users',
      'Fast-track to full-time Associate SWE offer',
    ],
    openings: 8,
  },
  {
    id: 'backend-systems',
    title: 'Backend Systems & Distributed API Intern',
    domain: 'Full Stack Web Development',
    category: 'backend',
    description:
      'Focus on scalable distributed architecture, RESTful & GraphQL API design, database caching with Redis, microservices orchestration, and high-throughput server systems.',
    duration: '16 weeks',
    location: 'Remote',
    stipend: '$650 - $950 / month',
    minStipendUsd: 650,
    startDate: 'July 2026',
    mode: 'Remote',
    skills: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'REST APIs', 'MongoDB'],
    benefits: [
      'System architecture workshops & design reviews',
      'Hands-on cloud orchestration with AWS & Docker',
      'Monthly learning and certification stipend',
      'Flexible working hours & remote autonomy',
    ],
    openings: 6,
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Product Design & Design Systems Intern',
    domain: 'UI/UX Design',
    category: 'design',
    description:
      'Craft delightful user experiences, high-fidelity prototypes in Figma, and comprehensive accessible design systems. Partner closely with product management and engineering.',
    duration: '12 weeks',
    location: 'Hybrid',
    stipend: '$500 - $800 / month',
    minStipendUsd: 500,
    startDate: 'June 2026',
    mode: 'Hybrid',
    skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Wireframing'],
    benefits: [
      'Build a professional case-study portfolio for Big Tech',
      'Human-centered design thinking training',
      'Collaborative workspace & Figma workspace access',
      'Regular product critique & portfolio reviews',
    ],
    openings: 4,
  },
  {
    id: 'data-analytics',
    title: 'Data Science & Business Intelligence Intern',
    domain: 'Data Science & Analytics',
    category: 'data',
    description:
      'Extract actionable intelligence from large datasets, build automated analytical data pipelines, and develop predictive business intelligence models with Python and SQL.',
    duration: '12 weeks',
    location: 'Remote',
    stipend: '$600 - $850 / month',
    minStipendUsd: 600,
    startDate: 'June 2026',
    mode: 'Remote',
    skills: ['Python', 'SQL', 'Pandas', 'Tableau', 'Scikit-Learn', 'Statistics'],
    benefits: [
      'Real-world business intelligence case studies',
      'Data storytelling and executive presentation coaching',
      'Access to proprietary data analytics tools',
      'Alumni networking with industry data scientists',
    ],
    openings: 5,
  },
  {
    id: 'ml-ai-systems',
    title: 'Machine Learning & Generative AI Intern',
    domain: 'Machine Learning',
    category: 'ai',
    description:
      'Develop, fine-tune, and deploy modern machine learning models and LLM agentic systems to solve complex enterprise automation challenges.',
    duration: '16 weeks',
    location: 'Remote',
    stipend: '$700 - $1,000 / month',
    minStipendUsd: 700,
    startDate: 'July 2026',
    mode: 'Remote',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'LLMs', 'NLP', 'Computer Vision'],
    benefits: [
      'GPU compute credits for model training & experimentation',
      'Research publication opportunities & mentorship',
      'Production ML deployment pipelines experience',
      'Direct guidance from AI researchers',
    ],
    openings: 5,
  },
  {
    id: 'devops-cloud',
    title: 'Cloud Infrastructure & DevOps Intern',
    domain: 'Cloud Architecture & DevOps',
    category: 'backend',
    description:
      'Automate CI/CD pipelines, manage Kubernetes clusters, provision Terraform infrastructure, and harden container security across multi-cloud environments.',
    duration: '14 weeks',
    location: 'Hybrid',
    stipend: '$650 - $900 / month',
    minStipendUsd: 650,
    startDate: 'June 2026',
    mode: 'Hybrid',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'GitHub Actions', 'Linux'],
    benefits: [
      'AWS Solutions Architect certification sponsorship',
      'Production Kubernetes cluster administration',
      'Infrastructure as Code (IaC) best practices',
      'Direct pairing with DevOps Leads',
    ],
    openings: 4,
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Information Security & AppSec Intern',
    domain: 'Cybersecurity',
    category: 'backend',
    description:
      'Perform vulnerability assessments, pen-testing of web applications, security audit reviews, and security automation tooling development.',
    duration: '12 weeks',
    location: 'Remote',
    stipend: '$600 - $850 / month',
    minStipendUsd: 600,
    startDate: 'July 2026',
    mode: 'Remote',
    skills: ['OWASP Top 10', 'Burp Suite', 'Python', 'Linux', 'Network Security'],
    benefits: [
      'Security+ or CEH study resources',
      'Hands-on vulnerability remediation on real codebase',
      'Incident response simulation workshops',
      'Mentorship from Certified Security Engineers',
    ],
    openings: 3,
  },
  {
    id: 'mobile-app-dev',
    title: 'Cross-Platform Mobile Engineer Intern',
    domain: 'Mobile Application Development',
    category: 'frontend',
    description:
      'Build native-feel cross-platform iOS and Android apps using React Native and Flutter with real-time push notifications and offline-first persistence.',
    duration: '14 weeks',
    location: 'Remote',
    stipend: '$600 - $900 / month',
    minStipendUsd: 600,
    startDate: 'June 2026',
    mode: 'Remote',
    skills: ['React Native', 'TypeScript', 'Flutter', 'Redux', 'iOS/Android APIs'],
    benefits: [
      'Deploy applications to App Store and Google Play',
      'Offline-first synchronization architecture training',
      'Mobile UX design sprint participation',
      'Letter of recommendation upon milestone completion',
    ],
    openings: 4,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { search, domain, location, category, page = '1', limit = '6' } = req.query;

  let filtered = [...ALL_INTERNSHIPS];

  // 1. Text Search Filter (Title, Description, Skills, Domain)
  if (search && typeof search === 'string' && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.domain.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  // 2. Category / Domain Filter
  if (category && typeof category === 'string' && category !== 'all') {
    filtered = filtered.filter((job) => job.category === category.toLowerCase());
  }

  if (domain && typeof domain === 'string' && domain !== 'all') {
    filtered = filtered.filter((job) => job.domain.toLowerCase().includes(domain.toLowerCase()));
  }

  // 3. Location Filter (Remote, Hybrid, Onsite)
  if (location && typeof location === 'string' && location !== 'all') {
    filtered = filtered.filter((job) => job.location.toLowerCase() === location.toLowerCase());
  }

  // 4. Pagination Calculations
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const pageSize = Math.max(1, Math.min(50, parseInt(limit as string, 10) || 6));
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIndex = (pageNum - 1) * pageSize;
  const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

  return res.status(200).json({
    success: true,
    total,
    page: pageNum,
    limit: pageSize,
    totalPages,
    data: paginatedData,
  });
}
