import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};
