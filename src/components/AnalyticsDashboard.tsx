import React from 'react';
import RealAnalyticsDashboard from './RealAnalyticsDashboard';

interface AnalyticsDashboardProps {
  projectId?: string;
  timeRange?: '24h' | '7d' | '30d' | '90d';
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  projectId = 'default-project',
  timeRange = '7d'
}) => {
  return <RealAnalyticsDashboard projectId={projectId} timeRange={timeRange} />;
};

export default AnalyticsDashboard;
