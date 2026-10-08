import React from 'react';
import InternshipCard from './InternshipCard';
import EmptyState from './EmptyState';

export default function InternshipList({
  internships,
  onSelect,
  onClearFilters,
}) {
  if (internships.length === 0) {
    return <EmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <div
      className="internship-grid"
      role="region"
      aria-label="Internship Opportunities List"
    >
      {internships.map((internship) => (
        <InternshipCard
          key={internship.id}
          internship={internship}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
