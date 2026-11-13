import type { Metadata } from 'next';
import TrackApplication from '@/components/TrackApplication';

export const metadata: Metadata = {
  title: 'Track Application Status - Gentrobyte Internship',
  description: 'Check the real-time review and screening status of your Gentrobyte internship application.',
};

export default function TrackPage() {
  return <TrackApplication />;
}
