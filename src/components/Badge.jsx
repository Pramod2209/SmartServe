import React from 'react';

/**
 * Status badge component
 * Used for displaying service/job status
 */
const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  assigned: 'bg-blue-100 text-blue-800 border-blue-200',
  'in-progress': 'bg-purple-100 text-purple-800 border-purple-200',
  'in progress': 'bg-purple-100 text-purple-800 border-purple-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  verified: 'bg-green-100 text-green-800 border-green-200',
  'not-verified': 'bg-orange-100 text-orange-800 border-orange-200',
};

const Badge = ({ status, children, className = '' }) => {
  const statusKey = status?.toLowerCase().replace(/\s+/g, '-') || 'pending';
  const statusStyle = STATUS_STYLES[statusKey] || STATUS_STYLES.pending;

  const displayText = children || status;

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
        ${statusStyle} ${className}
      `}
    >
      {displayText}
    </span>
  );
};

export default Badge;
