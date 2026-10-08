import React, { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="container header-container">
        <div className="brand">
          <a href="#" className="brand-logo" aria-label="InternHub Homepage">
            <span className="brand-icon" aria-hidden="true">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </span>
            <span className="brand-name">InternHub</span>
          </a>
        </div>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-expanded={mobileMenuOpen}
          aria-controls="primary-navigation"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={toggleMenu}
        >
          <span className="hamburger-icon" aria-hidden="true">
            {mobileMenuOpen ? '✕' : '☰'}
          </span>
        </button>

        <nav
          id="primary-navigation"
          className={`nav-links ${mobileMenuOpen ? 'nav-open' : ''}`}
          aria-label="Main Navigation"
        >
          <a href="#" className="nav-link active" onClick={closeMenu}>
            Home
          </a>
          <a href="#internships" className="nav-link" onClick={closeMenu}>
            Internships
          </a>
          <a href="#about" className="nav-link" onClick={closeMenu}>
            About
          </a>
        </nav>
      </div>
    </header>
  );
}
