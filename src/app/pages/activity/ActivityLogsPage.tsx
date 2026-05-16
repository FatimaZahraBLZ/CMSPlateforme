import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  RefreshCw,
  Activity,
  User,
  Globe,
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';

interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  target_type: string;
  target_id?: string | null;
  target_name?: string | null;
  details?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

interface ActivityStats {
  total: number;
  today: number;
  users: number;
  modules: number;
}

export const ActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    total: 0,
    today: 0,
    users: 0,
    modules: 0,
  });

  const [search, setSearch] = useState('');
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [status, setStatus] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const visibleLogs = showAll ? logs : logs.slice(0, 5);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (search.trim()) params.append('search', search.trim());
      if (module) params.append('module', module);
      if (action) params.append('action', action);
      if (status) params.append('status', status);

      const response = await fetch(
        `${api.baseURL}/api/activity-logs?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('cms_token') || ''}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch activity logs');
      }

      setLogs(data.logs || []);
      setStats({
  total: Number(data.stats?.total ?? 0),
  today: Number(data.stats?.today ?? 0),
  users: Number(data.stats?.users ?? 0),
  modules: Number(data.stats?.modules ?? 0),
});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const moduleOptions = useMemo(() => {
    const modules = Array.from(new Set(logs.map((log) => log.target_type).filter(Boolean)));

    return [
      { value: '', label: 'All modules' },
      ...modules.map((item) => ({
        value: item,
        label: item,
      })),
    ];
  }, [logs]);

  const actionOptions = useMemo(() => {
    const actions = Array.from(new Set(logs.map((log) => log.action).filter(Boolean)));

    return [
      { value: '', label: 'All actions' },
      ...actions.map((item) => ({
        value: item,
        label: item,
      })),
    ];
  }, [logs]);

  const formatDate = (date: string) => {
    if (!date) return '—';

    return new Date(date.replace(' ', 'T')).toLocaleString();
  };

  const getActionBadge = (logAction: string) => {
    const lower = logAction.toLowerCase();

    if (lower.includes('create') || lower.includes('login')) {
      return 'success';
    }

    if (lower.includes('delete')) {
      return 'danger';
    }

    if (lower.includes('update') || lower.includes('publish')) {
      return 'info';
    }

    return 'default';
  };

  const resetFilters = () => {
    setSearch('');
    setModule('');
    setAction('');
    setStatus('');
    setTimeout(fetchLogs, 0);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-2">
            Track user actions, website changes, and system activity.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Logs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Activity className="w-9 h-9 text-indigo-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-3xl font-bold text-gray-900">{stats.today}</p>
            </div>
            <Clock className="w-9 h-9 text-blue-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.users}</p>
            </div>
            <User className="w-9 h-9 text-green-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Modules</p>
              <p className="text-3xl font-bold text-gray-900">{stats.modules}</p>
            </div>
            <Globe className="w-9 h-9 text-purple-600" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Search"
                placeholder="Search user, action, module..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select
              label="Module"
              value={module}
              onChange={(e) => setModule(e.target.value)}
              options={moduleOptions}
            />

            <Select
              label="Action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              options={actionOptions}
            />

            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: '', label: 'All statuses' },
                { value: 'success', label: 'Success' },
                { value: 'error', label: 'Error' },
                { value: 'warning', label: 'Warning' },
              ]}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="primary" onClick={fetchLogs} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>

            <Button variant="secondary" onClick={resetFilters} disabled={loading}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading activity logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No activity logs found.
            </div>
          ) : (
            <div className="space-y-4">
              {logs.slice(0, showAll ? logs.length : 5).map((log) => (
                <div
                  key={log.id}
                  className="flex gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="mt-1">
                    {log.action.toLowerCase().includes('error') ? (
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">
                         {log.user_name || log.user_id || 'Unknown User'}
                      </p>

                      <Badge variant={getActionBadge(log.action) as any}>
                        {log.action}
                      </Badge>

                      <Badge variant="default">
                         {log.target_type || 'system'}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-700 mt-1">
                        {log.target_name || log.target_type || log.target_id || 'System activity'}
                    </p>

                    {log.details && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {log.details}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-3">
                      <span>{log.created_at ? formatDate(log.created_at) : 'No date'}</span>
                      {log.ip_address && <span>IP: {log.ip_address}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {logs.length > 5 && (
                <div className="flex justify-center pt-4">
            <Button
           variant="secondary"
           onClick={() => setShowAll(!showAll)}
          >
         {showAll ? 'Show Less' : `View More (${logs.length - 5})`}
        </Button>
       </div>
       )}
      </Card>
    </div>
  );
};