import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Shield, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../services/api';

interface RoleCounts {
  super_admin: number;
  admin: number;
  editor: number;
  visitor: number;
}

export const RolesPage: React.FC = () => {
  const [roleCounts, setRoleCounts] = useState<RoleCounts>({
    super_admin: 0,
    admin: 0,
    editor: 0,
    visitor: 0,
  });
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [countError, setCountError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserCounts();
  }, []);

  const fetchUserCounts = async () => {
    try {
      setLoadingCounts(true);
      setCountError(null);
      console.log('Fetching user counts by role...');
      const counts = await api.getUserCountsByRole();
      console.log('User counts by role:', counts);
      setRoleCounts(counts);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load user counts';
      console.error('Fetch user counts error:', err);
      setCountError(errorMsg);
      // Keep default counts on error
    } finally {
      setLoadingCounts(false);
    }
  };

  const roles = [
    {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'Full platform access and control',
      userCount: roleCounts.super_admin,
      color: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Manage content, settings, and publish',
      userCount: roleCounts.admin,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'editor',
      name: 'Editor',
      description: 'Manage content and media only',
      userCount: roleCounts.editor,
      color: 'bg-green-100 text-green-800',
    },
    {
      id: 'visitor',
      name: 'Visitor',
      description: 'Public website access only',
      userCount: roleCounts.visitor,
      color: 'bg-gray-100 text-gray-800',
    },
  ];

  const modules = [
    'Dashboard',
    'Users',
    'Roles & Permissions',
    'Websites',
    'Pages',
    'Articles',
    'Media Library',
    'Menus',
    'Translations',
    'Theme',
    'SEO',
    'Site Settings',
    'Global Settings',
    'Activity Logs',
    'Preview',
    'Publish',
  ];

  const permissions: Record<string, Record<string, boolean>> = {
    super_admin: {
      'Dashboard': true,
      'Users': true,
      'Roles & Permissions': true,
      'Websites': true,
      'Pages': true,
      'Articles': true,
      'Media Library': true,
      'Menus': true,
      'Translations': true,
      'Theme': true,
      'SEO': true,
      'Site Settings': true,
      'Global Settings': true,
      'Activity Logs': true,
      'Preview': true,
      'Publish': true,
    },
    admin: {
      'Dashboard': true,
      'Users': true,
      'Roles & Permissions': false,
      'Websites': true,
      'Pages': true,
      'Articles': true,
      'Media Library': true,
      'Menus': true,
      'Translations': true,
      'Theme': true,
      'SEO': true,
      'Site Settings': true,
      'Global Settings': false,
      'Activity Logs': false,
      'Preview': true,
      'Publish': true,
    },
    editor: {
      'Dashboard': true,
      'Users': false,
      'Roles & Permissions': false,
      'Websites': false,
      'Pages': true,
      'Articles': true,
      'Media Library': true,
      'Menus': false,
      'Translations': false,
      'Theme': false,
      'SEO': false,
      'Site Settings': false,
      'Global Settings': false,
      'Activity Logs': false,
      'Preview': true,
      'Publish': false,
    },
    visitor: {
      'Dashboard': false,
      'Users': false,
      'Roles & Permissions': false,
      'Websites': false,
      'Pages': false,
      'Articles': false,
      'Media Library': false,
      'Menus': false,
      'Translations': false,
      'Theme': false,
      'SEO': false,
      'Site Settings': false,
      'Global Settings': false,
      'Activity Logs': false,
      'Preview': false,
      'Publish': false,
    },
  };

  const [selectedRole, setSelectedRole] = useState('super_admin');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
        <p className="text-gray-600 mt-2">Manage role-based access control for your plateforme</p>
      </div>

      {/* Error Alert */}
      {countError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Could not load user counts: {countError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Roles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roles.map((role) => (
          <Card
            key={role.id}
            className={`cursor-pointer transition-all ${
              selectedRole === role.id ? 'ring-2 ring-indigo-500 shadow-lg' : ''
            }`}
            onClick={() => setSelectedRole(role.id)}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Shield className="w-8 h-8 text-indigo-600" />
                <Badge className={role.color}>
                  {loadingCounts ? (
                    <span className="inline-block animate-pulse">...</span>
                  ) : (
                    `${role.userCount} user${role.userCount !== 1 ? 's' : ''}`
                  )}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{role.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{role.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Permission Matrix</CardTitle>
            <Badge className={roles.find(r => r.id === selectedRole)?.color}>
              {roles.find(r => r.id === selectedRole)?.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Module</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Super Admin</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Admin</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Editor</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Visitor</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((module) => (
                  <tr key={module} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{module}</td>
                    {['super_admin', 'admin', 'editor', 'visitor'].map((role) => (
                      <td key={role} className="py-3 px-4 text-center">
                        {permissions[role][module] ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Role Details */}
      <Card>
        <CardHeader>
          <CardTitle>
            {roles.find(r => r.id === selectedRole)?.name} - Access Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Allowed Modules</h4>
              <div className="flex flex-wrap gap-2">
                {modules
                  .filter(module => permissions[selectedRole][module])
                  .map(module => (
                    <Badge key={module} variant="success" className="bg-green-100 text-green-800">
                      {module}
                    </Badge>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Restricted Modules</h4>
              <div className="flex flex-wrap gap-2">
                {modules
                  .filter(module => !permissions[selectedRole][module])
                  .map(module => (
                    <Badge key={module} className="bg-gray-100 text-gray-600">
                      {module}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
