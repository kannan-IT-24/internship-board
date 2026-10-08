import React from 'react';

export default function ErrorState({ onRetry }) {
  return (
    <div className="error-state" role="alert">
      <div className="error-icon" aria-hidden="true">
        ⚠️
      </div>
      <h3 className="error-title">Unable to load internships</h3>
      <p className="error-text">
        Something went wrong while loading internship data.
      </p>
      <button
        type="button"
        className="btn btn-primary error-retry-btn"
        onClick={onRetry}
      >
        Try Again
      </button>
    </div>
  );
}
