import React from 'react';
import { Link } from 'react-router';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useCMS } from '../../contexts/CMSContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Globe,
  FileText,
  BookOpen,
  Image,
  Users,
  TrendingUp,
  Eye,
  Plus,
  Upload,
  CheckCircle2
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { selectedWebsite } = useCMS();
  const { user } = useAuth();

  const stats = [
    { label: 'Total Users', value: '8', icon: Users, color: 'bg-blue-500', trend: '+2 this month' },
    { label: 'Total Websites', value: '12', icon: Globe, color: 'bg-indigo-500', trend: '+3 this month' },
    { label: 'Total Pages', value: '48', icon: FileText, color: 'bg-green-500', trend: '+12 this month' },
    { label: 'Total Articles', value: '156', icon: BookOpen, color: 'bg-purple-500', trend: '+24 this month' },
    { label: 'Total Media', value: '324', icon: Image, color: 'bg-orange-500', trend: '+45 this month' },
    { label: 'Published Websites', value: '9', icon: CheckCircle2, color: 'bg-teal-500', trend: '75% published' },
  ];

  const recentActivities = [
    { id: '1', user: 'John Doe', action: 'Published', target: 'Homepage', time: '5 minutes ago', type: 'publish' },
    { id: '2', user: 'Jane Smith', action: 'Created', target: 'New Article', time: '15 minutes ago', type: 'create' },
    { id: '3', user: 'Mike Johnson', action: 'Updated', target: 'About Page', time: '1 hour ago', type: 'update' },
    { id: '4', user: 'Sarah Williams', action: 'Uploaded', target: 'Image Gallery', time: '2 hours ago', type: 'upload' },
    { id: '5', user: 'Tom Brown', action: 'Modified', target: 'Main Menu', time: '3 hours ago', type: 'update' },
  ];

  const quickActions = [
    { label: 'Create User', icon: Users, link: '/users', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
    { label: 'Create Website', icon: Plus, link: '/websites', color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
    { label: 'Assign Role', icon: CheckCircle2, link: '/roles', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
    { label: 'Global Settings', icon: Globe, link: '/global-settings', color: 'bg-teal-50 text-teal-600 hover:bg-teal-100' },
  ];

  if (!selectedWebsite && user?.role !== 'super_admin') {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Globe className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">No Website Selected</h2>
        <p className="text-gray-600 mb-8">
          Please select a website from the Websites section to start managing content.
        </p>
        <Link to="/websites">
          <Button variant="primary">Go to Websites</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          {user?.role === 'super_admin'
            ? 'Welcome back! Here\'s an overview of your platform.'
            : selectedWebsite
              ? `Managing ${selectedWebsite.name}`
              : 'Select a website to get started'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span>{' '}
                        <span className="text-gray-600">{activity.action.toLowerCase()}</span>{' '}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                  <Badge variant="info">{activity.action}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Control Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Link key={action.label} to={action.link}>
                    <button className={`w-full ${action.color} p-4 rounded-xl transition-all flex items-center gap-3`}>
                      <div className="w-10 h-10 bg-white/50 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{action.label}</span>
                    </button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
