import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Check, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AssignUserModalProps {
  websiteId: string;
  onSuccess: () => void;
  onClose: () => void;
  existingUserIds: string[];
}

const roleCapabilities: Record<string, Record<string, boolean>> = {
  owner: {
    'Edit Pages': true,
    'Edit Articles': true,
    'Upload Media': true,
    'Manage Menus': true,
    'Manage Website Settings': true,
    'Manage Access': true,
    'Delete Website': true,
    'Publish Content': true,
  },
  admin: {
    'Edit Pages': true,
    'Edit Articles': true,
    'Upload Media': true,
    'Manage Menus': true,
    'Manage Website Settings': true,
    'Manage Access': true,
    'Delete Website': false,
    'Publish Content': true,
  },
  editor: {
    'Edit Pages': true,
    'Edit Articles': true,
    'Upload Media': true,
    'Manage Menus': false,
    'Manage Website Settings': false,
    'Manage Access': false,
    'Delete Website': false,
    'Publish Content': true,
  },
  viewer: {
    'Edit Pages': false,
    'Edit Articles': false,
    'Upload Media': false,
    'Manage Menus': false,
    'Manage Website Settings': false,
    'Manage Access': false,
    'Delete Website': false,
    'Publish Content': false,
  },
};

export const AssignUserModal: React.FC<AssignUserModalProps> = ({
  websiteId,
  onSuccess,
  onClose,
  existingUserIds,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setFetching(true);
      setError(null);
      const data = await api.getUsers();
      // Filter out users that already have access or are not editors/admins
      const filteredUsers = (data.users || []).filter(
        (user: User) =>
          !existingUserIds.includes(user.id) &&
          (user.role === 'editor' || user.role === 'admin' || user.role === 'visitor')
      );
      setUsers(filteredUsers);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMsg);
      console.error('Fetch users error:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId || !selectedRole) {
      setError('Please select both a user and a role');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.grantWebsiteAccess(websiteId, selectedUserId, selectedRole);
      onSuccess();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to assign user';
      setError(errorMsg);
      console.error('Assign user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find(u => u.id === selectedUserId);
  const capabilities = roleCapabilities[selectedRole] || {};

  return (
    <Modal isOpen={true} onClose={onClose} size="lg">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assign User to Website</h2>
          <p className="text-gray-600 mt-1">Grant access and set the user's role for this website</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {fetching ? (
          <div className="text-center py-8 text-gray-500">Loading users...</div>
        ) : (
          <>
            {/* User Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">Select User</label>
              <Select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                options={[
                  { value: '', label: 'Choose a user...' },
                  ...users.map(user => ({
                    value: user.id,
                    label: `${user.name} (${user.email}) - ${user.role}`
                  }))
                ]}
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">Website Role</label>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                options={[
                  { value: 'editor', label: 'Editor - Edit content and media' },
                  { value: 'admin', label: 'Admin - Manage content and assign editors' },
                  { value: 'viewer', label: 'Viewer - Read-only access' },
                ]}
              />
              <p className="text-xs text-gray-500 mt-1">Note: Only website owners can assign admin roles</p>
            </div>

            {/* Permissions Preview */}
            {selectedRole && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">Permissions Preview</label>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(capabilities).map(([capability, hasAccess]) => (
                      <div key={capability} className="flex items-center gap-2">
                        {hasAccess ? (
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${hasAccess ? 'text-gray-900' : 'text-gray-500'}`}>
                          {capability}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Selected User Info */}
            {selectedUser && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>{selectedUser.name}</strong> ({selectedUser.email}) will have <strong>{selectedRole}</strong> access to this website.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                onClick={onClose}
                variant="secondary"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                variant="primary"
                disabled={!selectedUserId || loading}
              >
                {loading ? 'Assigning...' : 'Assign User'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
