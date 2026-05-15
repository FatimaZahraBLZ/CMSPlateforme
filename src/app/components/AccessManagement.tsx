import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Plus, Trash2, Edit2, Lock, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { AssignUserModal } from './AssignUserModal';

interface WebsiteAccess {
  user_id: string;
  name: string;
  email: string;
  global_role: string;
  website_role: string;
  granted_by_name: string;
  status: string;
}

interface AccessManagementProps {
  websiteId: string;
  currentUserRole: string;
}

const roleColors: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  editor: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
};

const roleDescriptions: Record<string, string> = {
  owner: 'Full control - Can manage all aspects and assign access',
  admin: 'Admin control - Can manage content and assign editors',
  editor: 'Can edit pages, articles, and media',
  viewer: 'Read-only access',
};

export const AccessManagement: React.FC<AccessManagementProps> = ({
  websiteId,
  currentUserRole,
}) => {
  const [accessList, setAccessList] = useState<WebsiteAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchAccessList();
  }, [websiteId]);

  const fetchAccessList = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getWebsiteAccess(websiteId);
      setAccessList(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load access list';
      setError(errorMsg);
      console.error('Fetch access error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSuccess = async () => {
    setShowModal(false);
    await fetchAccessList();
  };

  const handleRemoveUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to revoke this user\'s access?')) {
      return;
    }

    try {
      setRemovingUserId(userId);
      await api.revokeWebsiteAccess(websiteId, userId);
      setAccessList(prev => prev.filter(item => item.user_id !== userId));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to revoke access';
      setError(errorMsg);
      console.error('Remove user error:', err);
    } finally {
      setRemovingUserId(null);
    }
  };

  const canManageAccess = currentUserRole === 'super_admin' || currentUserRole === 'owner' || currentUserRole === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading access management...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Access Management</h2>
          <p className="text-gray-600 mt-1">Manage who has access to this website and their roles</p>
        </div>
        {canManageAccess && (
          <Button
            onClick={() => setShowModal(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Assign User
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Access Table */}
      <Card>
        <CardHeader>
          <CardTitle>Website Access List ({accessList.length} users)</CardTitle>
        </CardHeader>
        <CardContent>
          {accessList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Lock className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No users have access to this website yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Global Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Website Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Added By</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accessList.map((access) => (
                    <tr key={access.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{access.name}</p>
                          <p className="text-sm text-gray-500">{access.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={roleColors[access.global_role] || 'bg-gray-100 text-gray-800'}>
                          {access.global_role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={roleColors[access.website_role] || 'bg-gray-100 text-gray-800'}>
                          {access.website_role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{access.granted_by_name}</td>
                      <td className="py-3 px-4 text-center">
                        {canManageAccess && access.website_role !== 'owner' && (
                          <button
                            onClick={() => handleRemoveUser(access.user_id)}
                            disabled={removingUserId === access.user_id}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(roleDescriptions).map(([role, description]) => (
              <div key={role} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Badge className={roleColors[role] || 'bg-gray-100 text-gray-800'}>
                    {role}
                  </Badge>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assign User Modal */}
      {showModal && (
        <AssignUserModal
          websiteId={websiteId}
          onSuccess={handleAssignSuccess}
          onClose={() => setShowModal(false)}
          existingUserIds={accessList.map(a => a.user_id)}
        />
      )}
    </div>
  );
};
