import React from 'react';
import { DOMAINS, MODES } from '../data/internships';

export default function SearchFilters({
  searchTerm,
  onSearchChange,
  selectedDomain,
  onDomainChange,
  selectedMode,
  onModeChange,
  onClearFilters,
  hasActiveFilters,
  resultCount,
  totalCount,
  onSimulateError,
  domains = DOMAINS,
  modes = MODES,
}) {
  return (
    <div className="search-filters-wrapper">
      <div className="search-filter-card">
        <div className="search-bar-group">
          <label htmlFor="search-input" className="form-label">
            Search Internships
          </label>
          <div className="search-input-container">
            <span className="search-icon" aria-hidden="true">
              🔍
            </span>
            <input
              id="search-input"
              type="text"
              className="search-input"
              placeholder="Search by title, domain, role, ID, mode (e.g. Frontend, Remote, INT-001)..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              autoComplete="off"
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                aria-label="Clear search input"
                onClick={() => onSearchChange('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="domain-filter" className="form-label">
              Domain
            </label>
            <div className="select-container">
              <select
                id="domain-filter"
                className="filter-select"
                value={selectedDomain}
                onChange={(e) => onDomainChange(e.target.value)}
              >
                {domains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="mode-filter" className="form-label">
              Mode
            </label>
            <div className="select-container">
              <select
                id="mode-filter"
                className="filter-select"
                value={selectedMode}
                onChange={(e) => onModeChange(e.target.value)}
              >
                {modes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-actions-group">
            <button
              type="button"
              className="btn btn-secondary clear-filters-btn"
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              aria-label="Reset all search and filter values"
            >
              Clear Filters
            </button>
            <button
              type="button"
              className="btn btn-ghost test-error-btn"
              onClick={onSimulateError}
              title="Click to test error state component"
              aria-label="Simulate error state to test UI handling"
            >
              Test Error State
            </button>
          </div>
        </div>
      </div>

      <div className="results-status-bar">
        <p
          className="results-count"
          aria-live="polite"
          aria-atomic="true"
        >
          Showing <strong>{resultCount}</strong> of <strong>{totalCount}</strong>{' '}
          {totalCount === 1 ? 'internship' : 'internships'}
          {hasActiveFilters && ' (filtered)'}
        </p>
      </div>
    </div>
  );
}
