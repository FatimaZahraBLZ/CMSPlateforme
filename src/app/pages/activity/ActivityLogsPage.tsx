import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ScrollText, Search, Filter, User, Clock } from 'lucide-react';

export const ActivityLogsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterAction, setFilterAction] = useState('all');

  const activities = [
    {
      id: '1',
      timestamp: new Date('2026-04-01T14:30:00'),
      user: 'John Doe',
      userId: '1',
      role: 'super_admin',
      action: 'Created',
      module: 'Users',
      target: 'New user: Jane Smith',
      status: 'success',
      ipAddress: '192.168.1.100',
    },
    {
      id: '2',
      timestamp: new Date('2026-04-01T14:15:00'),
      user: 'Jane Smith',
      userId: '2',
      role: 'admin',
      action: 'Published',
      module: 'Pages',
      target: 'Homepage',
      status: 'success',
      ipAddress: '192.168.1.101',
    },
    {
      id: '3',
      timestamp: new Date('2026-04-01T14:00:00'),
      user: 'Mike Johnson',
      userId: '3',
      role: 'editor',
      action: 'Updated',
      module: 'Articles',
      target: 'Getting Started with React',
      status: 'success',
      ipAddress: '192.168.1.102',
    },
    {
      id: '4',
      timestamp: new Date('2026-04-01T13:45:00'),
      user: 'Sarah Williams',
      userId: '4',
      role: 'editor',
      action: 'Uploaded',
      module: 'Media',
      target: 'hero-image.jpg',
      status: 'success',
      ipAddress: '192.168.1.103',
    },
    {
      id: '5',
      timestamp: new Date('2026-04-01T13:30:00'),
      user: 'Tom Brown',
      userId: '5',
      role: 'admin',
      action: 'Modified',
      module: 'Menus',
      target: 'Main Navigation',
      status: 'success',
      ipAddress: '192.168.1.104',
    },
    {
      id: '6',
      timestamp: new Date('2026-04-01T13:15:00'),
      user: 'Admin User',
      userId: '1',
      role: 'super_admin',
      action: 'Deleted',
      module: 'Users',
      target: 'Inactive user account',
      status: 'warning',
      ipAddress: '192.168.1.100',
    },
    {
      id: '7',
      timestamp: new Date('2026-04-01T13:00:00'),
      user: 'Jane Smith',
      userId: '2',
      role: 'admin',
      action: 'Failed Login',
      module: 'Authentication',
      target: 'Invalid password attempt',
      status: 'error',
      ipAddress: '192.168.1.101',
    },
    {
      id: '8',
      timestamp: new Date('2026-04-01T12:45:00'),
      user: 'Mike Johnson',
      userId: '3',
      role: 'editor',
      action: 'Created',
      module: 'Articles',
      target: 'New Blog Post Draft',
      status: 'success',
      ipAddress: '192.168.1.102',
    },
  ];

  const roleColors: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    editor: 'bg-green-100 text-green-800',
  };

  const statusColors: Record<string, string> = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch =
      activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModule = filterModule === 'all' || activity.module === filterModule;
    const matchesAction = filterAction === 'all' || activity.action === filterAction;

    return matchesSearch && matchesModule && matchesAction;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-600 mt-2">Monitor all platform activities and user actions</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <Select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              options={[
                { value: 'all', label: 'All Modules' },
                { value: 'Users', label: 'Users' },
                { value: 'Pages', label: 'Pages' },
                { value: 'Articles', label: 'Articles' },
                { value: 'Media', label: 'Media' },
                { value: 'Menus', label: 'Menus' },
                { value: 'Authentication', label: 'Authentication' },
              ]}
            />

            <Select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              options={[
                { value: 'all', label: 'All Actions' },
                { value: 'Created', label: 'Created' },
                { value: 'Updated', label: 'Updated' },
                { value: 'Deleted', label: 'Deleted' },
                { value: 'Published', label: 'Published' },
                { value: 'Uploaded', label: 'Uploaded' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
            </div>
            <ScrollText className="w-10 h-10 text-indigo-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Success</p>
              <p className="text-2xl font-bold text-green-600">
                {activities.filter(a => a.status === 'success').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Warnings</p>
              <p className="text-2xl font-bold text-yellow-600">
                {activities.filter(a => a.status === 'warning').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 font-bold">!</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Errors</p>
              <p className="text-2xl font-bold text-red-600">
                {activities.filter(a => a.status === 'error').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-bold">×</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Timeline</CardTitle>
            <Badge variant="info">{filteredActivities.length} results</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Module</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Target</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((activity) => (
                  <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimestamp(activity.timestamp)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                          <Badge className={`${roleColors[activity.role]} text-xs`}>
                            {activity.role.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="info">{activity.action}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{activity.module}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{activity.target}</td>
                    <td className="py-3 px-4">
                      <Badge className={statusColors[activity.status]}>
                        {activity.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                      {activity.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
