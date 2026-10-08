import React from 'react';

export default function InternshipCard({ internship, onSelect }) {
  const { id, title, domain, mode, location, skills, openings } = internship;

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

  return (
    <article className="internship-card" aria-labelledby={`card-title-${id}`}>
      <div className="card-header">
        <div className="card-meta-top">
          <span className="card-id" aria-label={`Internship ID ${id}`}>
            {id}
          </span>
          <span className={getModeBadgeClass(mode)}>
            <span className="mode-dot" aria-hidden="true"></span>
            {mode}
          </span>
        </div>
        <h3 id={`card-title-${id}`} className="card-title">
          {title}
        </h3>
        <p className="card-domain">{domain}</p>
      </div>

      <div className="card-body">
        <div className="card-info-row">
          <div className="info-item" title="Location">
            <span className="info-icon" aria-hidden="true">
              📍
            </span>
            <span className="info-text">{location}</span>
          </div>
          <div className="info-item" title="Available Openings">
            <span className="info-icon" aria-hidden="true">
              👥
            </span>
            <span className="info-text">
              {openings} {openings === 1 ? 'Opening' : 'Openings'}
            </span>
          </div>
        </div>

        <div className="card-skills-section">
          <h4 className="skills-heading">Required Skills:</h4>
          <ul className="skills-list" aria-label={`Skills required for ${title}`}>
            {skills.map((skill) => (
              <li key={skill} className="skill-tag">
                {skill}
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
          aria-label={`View details for ${title} (${id})`}
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
