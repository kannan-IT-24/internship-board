import React from 'react';

export default function InternshipCard({ internship, onSelect }) {
  const {
    id,
    title,
    domain,
    mode,
    location,
    skills,
    openings,
    duration_weeks,
    applications_open,
  } = internship;

  // Mode badge style helper
  const getModeBadgeClass = (workMode) => {
    switch (workMode) {
      case 'Remote':
        return 'mode-badge badge-remote';
      case 'Hybrid':
        return 'mode-badge badge-hybrid';
      case 'On-site':
        return 'mode-badge badge-onsite';
      default:
        return 'mode-badge';
    }
  };

  const isClosed = applications_open === 0;

  // Determine display skills/tags
  const displayTags = Array.isArray(skills) && skills.length > 0
    ? skills
    : [
        domain,
        `${duration_weeks || 4} Weeks`,
        isClosed ? 'Closed' : 'Accepting Applicants',
      ];

  return (
    <article className="internship-card" aria-labelledby={`card-title-${id}`}>
      <div className="card-header">
        <div className="card-meta-top">
          <span className="card-id" aria-label={`Internship ID ${id}`}>
            {id}
          </span>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            {applications_open !== undefined && (
              <span
                className={`mode-badge ${isClosed ? 'badge-onsite' : 'badge-remote'}`}
                style={{ fontSize: '0.72rem' }}
                title={isClosed ? 'Applications closed' : 'Applications open'}
              >
                {isClosed ? 'Closed' : 'Open'}
              </span>
            )}
            <span className={getModeBadgeClass(mode)}>
              <span className="mode-dot" aria-hidden="true"></span>
              {mode}
            </span>
          </div>
        </div>
        <h3 id={`card-title-${id}`} className="card-title">
          {title}
        </h3>
        <p className="card-domain">{domain}</p>
      </div>

      <div className="card-body">
        <div className="card-info-row">
          <div className="info-item" title="Duration">
            <span className="info-icon" aria-hidden="true">
              ⏱️
            </span>
            <span className="info-text">
              {duration_weeks ? `${duration_weeks} Weeks` : (location || 'Flexible')}
            </span>
          </div>
          <div className="info-item" title="Application Status">
            <span className="info-icon" aria-hidden="true">
              {isClosed ? '🔒' : '👥'}
            </span>
            <span className="info-text">
              {applications_open !== undefined
                ? (isClosed ? 'Applications Closed' : 'Accepting Applications')
                : (openings ? `${openings} ${openings === 1 ? 'Opening' : 'Openings'}` : 'Active')}
            </span>
          </div>
        </div>

        <div className="card-skills-section">
          <h4 className="skills-heading">Key Highlights & Competencies:</h4>
          <ul className="skills-list" aria-label={`Details for ${title}`}>
            {displayTags.map((tag) => (
              <li key={tag} className="skill-tag">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card-footer">
        <button
          type="button"
          className="btn btn-outline card-view-btn"
          onClick={() => onSelect(internship)}
          aria-label={`View details and apply for ${title} (${id})`}
        >
          View Details
          <span className="btn-arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </article>
  );
}
