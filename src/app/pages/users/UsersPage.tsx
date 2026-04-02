import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../contexts/AuthContext';

export const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const users = [
    { id: '1', name: 'Admin User', email: 'admin@cms.com', role: 'super_admin', status: 'active', createdAt: '2026-01-10' },
    { id: '2', name: 'Editor User', email: 'editor@cms.com', role: 'editor', status: 'active', createdAt: '2026-02-15' },
    { id: '3', name: 'John Manager', email: 'john@cms.com', role: 'admin', status: 'active', createdAt: '2026-02-20' },
    { id: '4', name: 'Jane Writer', email: 'jane@cms.com', role: 'editor', status: 'active', createdAt: '2026-03-01' },
    { id: '5', name: 'Bob Guest', email: 'bob@cms.com', role: 'visitor', status: 'inactive', createdAt: '2026-03-10' },
  ];

  const roleColors = {
    super_admin: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    editor: 'bg-green-100 text-green-800',
    visitor: 'bg-gray-100 text-gray-800',
  };

  if (user?.role !== 'super_admin' && user?.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">You don't have permission to access this page</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">Manage user accounts and permissions</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Add User
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-gray-600">{u.email}</span>
                </TableCell>
                <TableCell>
                  <Badge className={roleColors[u.role as keyof typeof roleColors]}>
                    {u.role.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={u.status === 'active' ? 'success' : 'default'}>
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-gray-600">{u.createdAt}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">Edit</Button>
                    {u.id !== user?.id && (
                      <Button size="sm" variant="danger">Delete</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New User">
        <div className="space-y-4">
          <Input label="Full Name" placeholder="John Doe" />
          <Input label="Email" type="email" placeholder="john@example.com" />
          <Input label="Password" type="password" placeholder="••••••••" />
          <Select
            label="Role"
            options={[
              { value: 'super_admin', label: 'Super Admin' },
              { value: 'admin', label: 'Admin' },
              { value: 'editor', label: 'Editor' },
              { value: 'visitor', label: 'Visitor' },
            ]}
          />
          <Select
            label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setShowModal(false)} className="flex-1">
              Create User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
