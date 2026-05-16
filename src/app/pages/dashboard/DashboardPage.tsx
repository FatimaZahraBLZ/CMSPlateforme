import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
  Globe,
  FileText,
  BookOpen,
  Image,
  Users,
  TrendingUp,
  Plus,
  CheckCircle2,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  usersThisMonth: number;
  totalWebsites: number;
  websitesThisMonth: number;
  totalPages: number;
  pagesThisMonth: number;
  totalArticles: number;
  articlesThisMonth: number;
  totalMedia: number;
  mediaThisMonth: number;
  publishedWebsites: number;
  publishedPercentage: number;
}

interface RecentPublishActivity {
  id: string;
  websiteId: string;
  websiteName: string;
  websiteDomain?: string | null;
  userId: string;
  userName: string;
  userEmail?: string | null;
  action: string;
  module: string;
  itemId?: string | null;
  itemName: string;
  status: string;
  errorMessage?: string | null;
  publishedAt: string;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentPublishActivity[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  const fetchRecentActivities = async () => {
  try {
    setRecentLoading(true);
    const data = await api.getRecentPublishHistory(5);
    setRecentActivities(data);
  } catch (err) {
    console.error('Failed to load recent publish history:', err);
    setRecentActivities([]);
  } finally {
    setRecentLoading(false);
  }
};

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchDashboardStats();
  fetchRecentActivities();
}, []);

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'bg-blue-500',
      trend: `+${stats?.usersThisMonth ?? 0} this month`,
    },
    {
      label: 'Total Websites',
      value: stats?.totalWebsites ?? 0,
      icon: Globe,
      color: 'bg-indigo-500',
      trend: `+${stats?.websitesThisMonth ?? 0} this month`,
    },
    {
      label: 'Total Pages',
      value: stats?.totalPages ?? 0,
      icon: FileText,
      color: 'bg-green-500',
      trend: `+${stats?.pagesThisMonth ?? 0} this month`,
    },
    {
      label: 'Total Articles',
      value: stats?.totalArticles ?? 0,
      icon: BookOpen,
      color: 'bg-purple-500',
      trend: `+${stats?.articlesThisMonth ?? 0} this month`,
    },
    {
      label: 'Total Media',
      value: stats?.totalMedia ?? 0,
      icon: Image,
      color: 'bg-orange-500',
      trend: `+${stats?.mediaThisMonth ?? 0} this month`,
    },
    {
      label: 'Published Websites',
      value: stats?.publishedWebsites ?? 0,
      icon: CheckCircle2,
      color: 'bg-teal-500',
      trend: `${stats?.publishedPercentage ?? 0}% published`,
    },
  ];

  const quickActions =
    user?.role === 'super_admin'
      ? [
          { label: 'Create User', icon: Users, link: '/users', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
          { label: 'Create Website', icon: Plus, link: '/websites', color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
          { label: 'Assign Role', icon: CheckCircle2, link: '/roles', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
          { label: 'Global Settings', icon: Globe, link: '/global-settings', color: 'bg-teal-50 text-teal-600 hover:bg-teal-100' },
        ]
      : [
          { label: 'My Websites', icon: Globe, link: '/websites', color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
          { label: 'Pages', icon: FileText, link: '/pages', color: 'bg-green-50 text-green-600 hover:bg-green-100' },
          { label: 'Menus', icon: CheckCircle2, link: '/menus', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
        ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here is an overview of your CMS platform.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => {
            const IconComponent = stat.icon;

            return (
              <Card key={stat.label} className="hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <TrendingUp className="w-3 h-3" />
                      <span>{stat.trend}</span>
                    </div>
                  </div>

                  <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Control Panel</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;

              return (
                <Link key={action.label} to={action.link}>
                  <div className={`p-6 rounded-xl transition-colors ${action.color}`}>
                    <IconComponent className="w-8 h-8 mb-3" />
                    <p className="font-medium">{action.label}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
  <CardHeader>
    <CardTitle>Recent Activity</CardTitle>
  </CardHeader>

  <CardContent>
    {recentLoading ? (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="animate-pulse py-3 border-b border-gray-100 last:border-b-0">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    ) : recentActivities.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        No publish history yet.
      </div>
    ) : (
      <div className="space-y-4">
        {recentActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-b-0"
          >
            <div>
              <p className="text-sm text-gray-900">
                <span className="font-semibold">{activity.userName}</span>{' '}
                {activity.action}{' '}
                <span className="font-medium">{activity.itemName}</span>{' '}
                in <span className="font-medium">{activity.module}</span>
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {activity.websiteName}
                {activity.websiteDomain ? ` • ${activity.websiteDomain}` : ''} •{' '}
                {activity.publishedAt
                  ? new Date(activity.publishedAt.replace(' ', 'T')).toLocaleString()
                  : 'Unknown time'}
              </p>
            </div>

            <Link to="/activity-logs">
              <Button variant="ghost" size="sm">
                View
              </Button>
            </Link>
          </div>
        ))}
      </div>
    )}
  </CardContent>
</Card>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard Scope</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-gray-600">
            Super admins see platform-wide statistics. Admins see statistics for the websites they created or were assigned to.
            This dashboard does not require a selected website.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};