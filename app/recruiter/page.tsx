import { Metadata } from 'next';
import RecruiterDashboard from '@/components/RecruiterDashboard';

export const metadata: Metadata = {
  title: 'Company Recruiter Command Center | Gentrobyte Talent Pipeline',
  description: 'Authorized corporate recruitment system for evaluating and managing Gentrobyte internship applicants.',
};

export default function RecruiterPage() {
  return <RecruiterDashboard />;
}

