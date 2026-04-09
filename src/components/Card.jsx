import React from 'react';

/**
 * Reusable card component for displaying metrics and summaries
 * Commonly used in dashboards
 */
const Card = ({ 
  title, 
  value, 
  icon: Icon, 
  bgColor = 'bg-primary-50', 
  iconColor = 'text-primary-600',
  subtitle = null,
  children 
}) => {
  return (
    <div className="card hover:shadow-md transition-shadow">
      {Icon && (
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {title && (
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                {title}
              </h3>
            )}
            {value && (
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {value}
              </p>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className={`${bgColor} p-3 rounded-lg`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      )}
      
      {children && <div className="mt-4">{children}</div>}
      
      {!Icon && !children && title && (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          {value && <p className="text-2xl font-bold text-gray-900">{value}</p>}
        </>
      )}
    </div>
  );
};

export default Card;
