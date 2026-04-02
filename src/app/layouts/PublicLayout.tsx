import React from 'react';
import { Outlet, Link } from 'react-router';
import { Logo } from '../components/Logo';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Public Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden">
                <Logo className="w-10 h-10" alt="CMS logo" />
              </div>
              <span className="text-xl font-bold text-gray-900">CMS Platform</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/public" className="text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link to="/public/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link to="/public/services" className="text-gray-700 hover:text-blue-600 transition-colors">
                Services
              </Link>
              <Link to="/public/projects" className="text-gray-700 hover:text-blue-600 transition-colors">
                Projects
              </Link>
              <Link to="/public/blog" className="text-gray-700 hover:text-blue-600 transition-colors">
                Blog
              </Link>
              <Link to="/public/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                Contact
              </Link>
            </nav>

            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <Outlet />

      {/* Public Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden">
                  <Logo className="w-10 h-10" alt="CMS logo" />
                </div>
                <span className="text-xl font-bold">CMS Platform</span>
              </div>
              <p className="text-gray-400 text-sm">
                Building amazing digital experiences for modern businesses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/public/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/public" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/public" className="hover:text-white transition-colors">Team</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/public/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/public" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="/public" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.654-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 CMS Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
