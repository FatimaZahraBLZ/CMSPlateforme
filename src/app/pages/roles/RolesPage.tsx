import React, { useEffect, useState } from 'react';
import {
  Shield,
  Globe,
  Building2,
  Users,
  Settings,
  Palette,
  FileText,
  Image,
  Languages,
  Search,
  Upload,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      setLoading(true);

      const counts = await api.getUserCountsByRole();

      setRoleCounts(counts);
    } catch (error) {
      console.error('Failed to load role counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const platformRoles = [
    {
      id: 'super_admin',
      name: 'Super Admin',
      description:
        'Full CMS platform ownership and system-wide management.',
      count: roleCounts.super_admin,
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      capabilities: [
        'Manage entire platform',
        'Manage all users',
        'Manage all websites',
        'Global settings',
        'System roles & permissions',
        'Activity logs',
      ],
    },

    {
      id: 'admin',
      name: 'Admin',
      description:
        'Creates and manages websites and assigns editors to websites.',
      count: roleCounts.admin,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      capabilities: [
        'Create websites',
        'Manage owned websites',
        'Assign website editors',
        'Manage website teams',
      ],
    },

    {
      id: 'editor',
      name: 'Editor',
      description:
        'Can access and manage websites assigned to them.',
      count: roleCounts.editor,
      color: 'bg-green-100 text-green-700 border-green-200',
      capabilities: [
        'Access assigned websites',
        'Manage website content',
        'Publish website updates',
      ],
    },

    {
      id: 'visitor',
      name: 'Visitor',
      description:
        'Public-facing role with no CMS administration access.',
      count: roleCounts.visitor,
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      capabilities: [
        'Public website access only',
      ],
    },
  ];

  const websiteRoles = [
    {
      id: 'owner',
      name: 'Owner',
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      description:
        'Full control over a website and its team members.',
      permissions: [
        {
          icon: <FileText className="w-4 h-4" />,
          label: 'Pages & Articles',
        },
        {
          icon: <Image className="w-4 h-4" />,
          label: 'Media Library',
        },
        {
          icon: <Palette className="w-4 h-4" />,
          label: 'Theme Customization',
        },
        {
          icon: <Languages className="w-4 h-4" />,
          label: 'Translations',
        },
        {
          icon: <Search className="w-4 h-4" />,
          label: 'SEO Settings',
        },
        {
          icon: <Settings className="w-4 h-4" />,
          label: 'Site Settings',
        },
        {
          icon: <Users className="w-4 h-4" />,
          label: 'Team Access Management',
        },
        {
          icon: <Upload className="w-4 h-4" />,
          label: 'Publish Content',
        },
        {
          icon: <Trash2 className="w-4 h-4" />,
          label: 'Delete Website',
        },
      ],
    },

    {
      id: 'manager',
      name: 'Manager',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      description:
        'Manages the website and editors but cannot delete the website.',
      permissions: [
        {
          icon: <FileText className="w-4 h-4" />,
          label: 'Pages & Articles',
        },
        {
          icon: <Image className="w-4 h-4" />,
          label: 'Media Library',
        },
        {
          icon: <Palette className="w-4 h-4" />,
          label: 'Theme Customization',
        },
        {
          icon: <Languages className="w-4 h-4" />,
          label: 'Translations',
        },
        {
          icon: <Search className="w-4 h-4" />,
          label: 'SEO Settings',
        },
        {
          icon: <Settings className="w-4 h-4" />,
          label: 'Site Settings',
        },
        {
          icon: <Users className="w-4 h-4" />,
          label: 'Assign Editors',
        },
        {
          icon: <Upload className="w-4 h-4" />,
          label: 'Publish Content',
        },
      ],
    },

    {
      id: 'editor',
      name: 'Website Editor',
      color: 'bg-green-100 text-green-700 border-green-200',
      description:
        'Fully manages assigned website content and website configuration.',
      permissions: [
        {
          icon: <FileText className="w-4 h-4" />,
          label: 'Pages & Articles',
        },
        {
          icon: <Image className="w-4 h-4" />,
          label: 'Media Library',
        },
        {
          icon: <Palette className="w-4 h-4" />,
          label: 'Theme Customization',
        },
        {
          icon: <Languages className="w-4 h-4" />,
          label: 'Translations',
        },
        {
          icon: <Search className="w-4 h-4" />,
          label: 'SEO Settings',
        },
        {
          icon: <Settings className="w-4 h-4" />,
          label: 'Site Settings',
        },
        {
          icon: <Upload className="w-4 h-4" />,
          label: 'Publish Content',
        },
      ],
    },
  ];

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Roles & Permissions
        </h1>

        <p className="text-gray-600 mt-2 max-w-3xl">
          Manage platform-level access and website-level collaboration
          roles for your CMS platform.
        </p>
      </div>

      {/* PLATFORM ROLES */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Globe className="w-5 h-5 text-indigo-700" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Platform Roles
            </h2>

            <p className="text-gray-600 text-sm">
              Global roles controlling access to the CMS platform itself.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {platformRoles.map((role) => (
            <Card
              key={role.id}
              className="border border-gray-200 hover:shadow-lg transition-all duration-200"
            >
              <CardContent className="p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-gray-700" />
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {role.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Badge className={role.color}>
                    {loading
                      ? '...'
                      : `${role.count} user${role.count !== 1 ? 's' : ''}`}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Capabilities
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {role.capabilities.map((capability) => (
                      <div
                        key={capability}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm"
                      >
                        {capability}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* WEBSITE ROLES */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-700" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Website Roles
            </h2>

            <p className="text-gray-600 text-sm">
              Website collaboration roles assigned per website.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {websiteRoles.map((role) => (
            <Card
              key={role.id}
              className="border border-gray-200 hover:shadow-lg transition-all duration-200"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {role.name}
                  </CardTitle>

                  <Badge className={role.color}>
                    {role.name}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mt-2">
                  {role.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-3">
                {role.permissions.map((permission) => (
                  <div
                    key={permission.label}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-600">
                        {permission.icon}
                      </div>

                      <span className="text-sm text-gray-800">
                        {permission.label}
                      </span>
                    </div>

                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ARCHITECTURE */}
      <Card className="border border-indigo-200 bg-indigo-50/40">
        <CardHeader>
          <CardTitle className="text-indigo-900">
            CMS Access Architecture
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-5 border border-indigo-100">
              <h3 className="font-semibold text-gray-900 mb-3">
                1. Platform Layer
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed">
                Super Admins manage the CMS platform globally.
                Admins create and manage websites.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-indigo-100">
              <h3 className="font-semibold text-gray-900 mb-3">
                2. Website Layer
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed">
                Websites have dedicated teams with their own
                roles and permissions.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-indigo-100">
              <h3 className="font-semibold text-gray-900 mb-3">
                3. Editor Workflow
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed">
                Editors access only websites assigned to them
                and manage all website content/features.
              </p>
            </div>
          </div>

          <div className="bg-white border border-indigo-100 rounded-2xl p-5">
            <p className="text-sm text-indigo-900 leading-relaxed">
              <strong>Recommended Architecture:</strong> Editors should
              not receive platform-wide permissions. Instead, they should
              manage assigned websites through website-level access control.
              This architecture scales better and matches modern CMS systems.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};