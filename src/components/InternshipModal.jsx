import React, { useEffect, useRef, useState } from 'react';

export default function InternshipModal({ internship, onClose }) {
  const [applyMessage, setApplyMessage] = useState('');
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    // Store previous focused element to restore when modal closes
    previousActiveElement.current = document.activeElement;

    // Prevent body scroll when modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button initially
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Keyboard handlers: Escape to close and Tab trapping
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      // Restore focus
      if (
        previousActiveElement.current &&
        typeof previousActiveElement.current.focus === 'function'
      ) {
        previousActiveElement.current.focus();
      }
    };
  }, [onClose]);

  if (!internship) return null;

  const { id, title, domain, mode, location, skills, openings } = internship;

  const handleApplyClick = () => {
    setApplyMessage('Application feature coming soon.');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className="modal-container"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div className="modal-header">
          <div className="modal-header-meta">
            <span className="modal-id-badge">{id}</span>
            <span className={`modal-mode-badge modal-badge-${mode.toLowerCase().replace(/[^a-z]/g, '')}`}>
              {mode}
            </span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close internship details modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          <p id="modal-description" className="modal-domain">
            {domain}
          </p>

          <div className="modal-details-grid">
            <div className="detail-card">
              <span className="detail-label">Location</span>
              <span className="detail-value">📍 {location}</span>
            </div>
            <div className="detail-card">
              <span className="detail-label">Work Mode</span>
              <span className="detail-value">💼 {mode}</span>
            </div>
            <div className="detail-card">
              <span className="detail-label">Openings Available</span>
              <span className="detail-value">👥 {openings} {openings === 1 ? 'position' : 'positions'}</span>
            </div>
            <div className="detail-card">
              <span className="detail-label">Job Reference ID</span>
              <span className="detail-value">🔖 {id}</span>
            </div>
          </div>

          <div className="modal-section">
            <h3 className="modal-section-title">Required Competencies & Skills</h3>
            <ul className="modal-skills-list" aria-label={`Required skills for ${title}`}>
              {skills.map((skill) => (
                <li key={skill} className="modal-skill-tag">
                  {skill}
                </li>
              ))}
            </ul>
          </div>

          {applyMessage && (
            <div
              className="apply-notice"
              role="status"
              aria-live="polite"
            >
              <span className="notice-icon" aria-hidden="true">
                ℹ️
              </span>
              <span>{applyMessage}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary modal-cancel-btn"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary modal-apply-btn"
            onClick={handleApplyClick}
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}
