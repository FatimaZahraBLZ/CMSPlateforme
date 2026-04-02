import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <thead className="bg-gray-50">
      {children}
    </thead>
  );
};

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => {
  return (
    <tr className={`${onClick ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`} onClick={onClick}>
      {children}
    </tr>
  );
};

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  );
};
