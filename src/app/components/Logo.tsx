import React from 'react';
import logoImage from '../../../Untitled_design-removebg-preview.png';

interface LogoProps {
  className?: string;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-10 h-10', alt = 'CMS Logo' }) => (
  <img src={logoImage} alt={alt} className={`object-contain ${className}`} />
);
