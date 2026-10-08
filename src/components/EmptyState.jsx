import React from 'react';

export default function EmptyState({ onClearFilters }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-state-icon" aria-hidden="true">
        🔎
      </div>
      <h3 className="empty-state-title">No internships found</h3>
      <p className="empty-state-text">
        Try changing your search or filters.
      </p>
      <button
        type="button"
        className="btn btn-primary empty-clear-btn"
        onClick={onClearFilters}
        aria-label="Clear all filters to view available internships"
      >
        Clear Filters
      </button>
    </div>
  );
}
