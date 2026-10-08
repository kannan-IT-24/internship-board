import React from 'react';

export default function Hero() {
  const handleScrollToInternships = (e) => {
    e.preventDefault();
    const section = document.getElementById('internships');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      // Set focus to the search input inside the listings section for keyboard users
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }
  };

  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <div className="container hero-container">
        <div className="hero-badge" aria-label="Internship platform highlight">
          <span className="badge-dot" aria-hidden="true"></span>
          Explore Verified Roles
        </div>
        <h1 id="hero-heading" className="hero-title">
          Find Your Next Internship
        </h1>
        <p className="hero-description">
          Discover handpicked internship opportunities across engineering, design, data, and security.
          Search and filter roles tailored to your skillset, domain interests, and preferred work mode.
        </p>
        <div className="hero-actions">
          <a
            href="#internships"
            className="btn btn-primary hero-cta"
            onClick={handleScrollToInternships}
          >
            Explore Internships
            <span className="btn-icon" aria-hidden="true">
              ↓
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
