import React, { useEffect, useRef, useState } from 'react';
import { submitApplication } from '../services/api';

export default function InternshipModal({ internship, onClose }) {
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);

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
        if (!focusableElements || focusableElements.length === 0) return;

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

  const {
    id,
    title,
    domain,
    mode,
    skills,
    duration_weeks,
    applications_open,
  } = internship;

  const isClosed = applications_open === 0;

  const displaySkills = Array.isArray(skills) && skills.length > 0
    ? skills
    : [domain, mode, `${duration_weeks || 4} Weeks`];

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (isSubmitting || isClosed) return;

    if (!applicantName.trim() || applicantName.trim().length < 2) {
      setSubmitStatus({
        type: 'error',
        message: 'Please provide your full name (at least 2 characters).',
      });
      return;
    }

    if (!applicantEmail.trim() || !applicantEmail.includes('@')) {
      setSubmitStatus({
        type: 'error',
        message: 'Please provide a valid email address.',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await submitApplication({
        internship_id: id,
        applicant_name: applicantName.trim(),
        applicant_email: applicantEmail.trim(),
      });

      setSubmitStatus({
        type: 'success',
        message: `Application submitted successfully! Reference ID: #${response.id}.`,
      });
      setApplicantName('');
      setApplicantEmail('');
    } catch (err) {
      setSubmitStatus({
        type: 'error',
        message: err.message || 'Failed to submit application. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
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
            <span
              className={`modal-mode-badge modal-badge-${mode.toLowerCase().replace(/[^a-z]/g, '')}`}
            >
              {mode}
            </span>
            {applications_open !== undefined && (
              <span
                className={`modal-mode-badge ${isClosed ? 'modal-badge-onsite' : 'modal-badge-remote'}`}
                style={{ fontSize: '0.75rem' }}
              >
                {isClosed ? 'Applications Closed' : 'Applications Open'}
              </span>
            )}
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
              <span className="detail-label">Duration</span>
              <span className="detail-value">
                ⏱️ {duration_weeks ? `${duration_weeks} Weeks` : '4 Weeks'}
              </span>
            </div>
            <div className="detail-card">
              <span className="detail-label">Work Mode</span>
              <span className="detail-value">💼 {mode}</span>
            </div>
            <div className="detail-card">
              <span className="detail-label">Status</span>
              <span className="detail-value">
                {isClosed ? '🔒 Closed' : '🟢 Open for Applicants'}
              </span>
            </div>
            <div className="detail-card">
              <span className="detail-label">Reference ID</span>
              <span className="detail-value">🔖 {id}</span>
            </div>
          </div>

          <div className="modal-section">
            <h3 className="modal-section-title">Required Competencies & Skills</h3>
            <ul className="modal-skills-list" aria-label={`Required skills for ${title}`}>
              {displaySkills.map((skill) => (
                <li key={skill} className="modal-skill-tag">
                  {skill}
                </li>
              ))}
            </ul>
          </div>

          {isClosed && (
            <div
              className="apply-notice"
              style={{
                backgroundColor: '#fef2f2',
                borderColor: '#fecaca',
                color: '#991b1b',
              }}
              role="alert"
            >
              <span className="notice-icon" aria-hidden="true">
                🔒
              </span>
              <span>
                Applications for this internship are currently closed. Check back soon for future openings.
              </span>
            </div>
          )}

          {showApplyForm && !isClosed && (
            <div
              className="application-form-section"
              style={{
                backgroundColor: 'var(--bg-primary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
              }}
            >
              <h3 className="modal-section-title" style={{ marginTop: 0 }}>
                Submit Your Application
              </h3>

              <form onSubmit={handleSubmitApplication} noValidate>
                <div style={{ marginBottom: '1rem' }}>
                  <label
                    htmlFor="applicant-name-input"
                    className="form-label"
                    style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}
                  >
                    Applicant Full Name <span style={{ color: 'var(--primary)' }}>*</span>
                  </label>
                  <input
                    id="applicant-name-input"
                    type="text"
                    className="search-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. Kannan G"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label
                    htmlFor="applicant-email-input"
                    className="form-label"
                    style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}
                  >
                    Applicant Email Address <span style={{ color: 'var(--primary)' }}>*</span>
                  </label>
                  <input
                    id="applicant-email-input"
                    type="email"
                    className="search-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. kannan@example.com"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowApplyForm(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Confirm & Apply'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {submitStatus && (
            <div
              className="apply-notice"
              style={{
                backgroundColor:
                  submitStatus.type === 'success' ? '#f0fdf4' : '#fef2f2',
                borderColor:
                  submitStatus.type === 'success' ? '#bbf7d0' : '#fecaca',
                color:
                  submitStatus.type === 'success' ? '#166534' : '#991b1b',
              }}
              role={submitStatus.type === 'error' ? 'alert' : 'status'}
              aria-live="polite"
            >
              <span className="notice-icon" aria-hidden="true">
                {submitStatus.type === 'success' ? '✅' : '⚠️'}
              </span>
              <span>{submitStatus.message}</span>
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
          {!showApplyForm && (
            <button
              type="button"
              className="btn btn-primary modal-apply-btn"
              onClick={() => {
                if (!isClosed) {
                  setShowApplyForm(true);
                  setSubmitStatus(null);
                }
              }}
              disabled={isClosed}
              title={isClosed ? 'Applications closed' : 'Apply for this internship'}
            >
              {isClosed ? 'Applications Closed' : 'Apply Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
