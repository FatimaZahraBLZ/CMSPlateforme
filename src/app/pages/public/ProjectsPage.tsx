import React from 'react';

export const ProjectsPage: React.FC = () => {
  const projects = [
    { id: '1', title: 'E-commerce Platform', category: 'Web Development', image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800', description: 'Modern online store with advanced features' },
    { id: '2', title: 'Corporate Website', category: 'Design', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', description: 'Professional corporate presence' },
    { id: '3', title: 'Mobile Banking App', category: 'Mobile', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800', description: 'Secure and user-friendly banking' },
    { id: '4', title: 'Real Estate Portal', category: 'Web Development', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800', description: 'Property listing and management' },
    { id: '5', title: 'Healthcare Dashboard', category: 'UI/UX', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800', description: 'Patient management system' },
    { id: '6', title: 'Social Network', category: 'Web Development', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800', description: 'Community engagement platform' },
  ];

  const categories = ['All', 'Web Development', 'Design', 'Mobile', 'UI/UX'];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Our Projects</h1>
            <p className="text-xl text-gray-600">
              Explore our portfolio of successful projects and see what we can do for you
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="group cursor-pointer">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <div className="aspect-video overflow-hidden bg-gray-200">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                      {project.category}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900 mt-2 mb-2">
                      {project.title}
                    </h3>
                    <p className="text-gray-600">{project.description}</p>
                    <button className="mt-4 text-blue-600 font-medium hover:text-blue-700 flex items-center gap-2">
                      View Project
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Want to See Your Project Here?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Let's work together to create something amazing
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Start Your Project
          </button>
        </div>
      </section>
    </div>
  );
};
