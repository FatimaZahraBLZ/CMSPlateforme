import React from 'react';

export const ServicesPage: React.FC = () => {
  const services = [
    {
      icon: '🌐',
      title: 'Website Development',
      description: 'Custom website development tailored to your business needs with modern technologies and best practices.',
      features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Mobile First'],
    },
    {
      icon: '🎨',
      title: 'UI/UX Design',
      description: 'Beautiful and intuitive designs that delight users and drive conversions.',
      features: ['User Research', 'Wireframing', 'Prototyping', 'Visual Design'],
    },
    {
      icon: '📱',
      title: 'Mobile Apps',
      description: 'Native and cross-platform mobile applications for iOS and Android.',
      features: ['iOS Development', 'Android Development', 'React Native', 'Flutter'],
    },
    {
      icon: '🔧',
      title: 'Maintenance & Support',
      description: 'Ongoing website maintenance, updates, and technical support to keep your site running smoothly.',
      features: ['Regular Updates', '24/7 Monitoring', 'Bug Fixes', 'Performance Optimization'],
    },
    {
      icon: '📊',
      title: 'Digital Marketing',
      description: 'Comprehensive digital marketing strategies to grow your online presence.',
      features: ['SEO', 'Content Marketing', 'Social Media', 'Analytics'],
    },
    {
      icon: '☁️',
      title: 'Cloud Hosting',
      description: 'Reliable and scalable cloud hosting solutions for your applications.',
      features: ['High Uptime', 'Auto Scaling', 'Backup & Recovery', 'Security'],
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Our Services</h1>
            <p className="text-xl text-gray-600">
              Comprehensive digital solutions to help your business thrive online
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Process</h2>
            <p className="text-xl text-gray-600">How we work with you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Discovery', description: 'We learn about your business, goals, and requirements' },
              { step: '02', title: 'Planning', description: 'We create a detailed roadmap and strategy' },
              { step: '03', title: 'Execution', description: 'We build and implement your solution' },
              { step: '04', title: 'Launch', description: 'We deploy and provide ongoing support' },
            ].map((phase, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {phase.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{phase.title}</h3>
                <p className="text-gray-600">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Let's discuss how we can help your business grow
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
};
