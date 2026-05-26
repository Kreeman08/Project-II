import React from 'react';

const Card = ({ children, className = '', hover = true, onClick = null }) => {
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`bg-[var(--paper)] border border-[var(--line)] rounded-lg shadow-md p-6 ${hoverClass} ${clickableClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
