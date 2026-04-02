import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">About Us</h1>
            <p className="text-xl text-gray-600">
              We're on a mission to empower businesses with the best content management platform
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded in 2020, we set out to solve a common problem: managing website content shouldn't be complicated. We believed that content management systems should be powerful yet simple, flexible yet intuitive.
              </p>
              <p className="text-gray-600 mb-4">
                Today, we serve over 10,000 customers worldwide, from small businesses to enterprise organizations. Our platform has helped create more than 50,000 websites, and we're just getting started.
              </p>
              <p className="text-gray-600">
                We're committed to continuous innovation, always listening to our customers and evolving our platform to meet their changing needs.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl h-96" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">What drives us every day</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🎯', title: 'Customer First', description: 'Everything we do is focused on delivering value to our customers' },
              { icon: '💡', title: 'Innovation', description: 'We constantly push boundaries to create better solutions' },
              { icon: '🤝', title: 'Integrity', description: 'We build trust through transparency and honest communication' },
            ].map((value, index) => (
              <div key={index} className="text-center">
                <div className="text-6xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">The people behind the product</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { name: 'John Smith', role: 'CEO & Founder' },
              { name: 'Sarah Johnson', role: 'CTO' },
              { name: 'Michael Chen', role: 'Head of Design' },
              { name: 'Emily Davis', role: 'Head of Product' },
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
