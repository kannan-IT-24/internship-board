import React from 'react';

export default function Footer() {
  return (
    <footer className="footer" id="about">
      <div className="container footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="brand-logo footer-logo">
              <span className="brand-icon" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
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
            </div>
            <p className="footer-tagline">
              Connecting emerging talent with high-impact internships across technology, design, and analytics.
            </p>
          </div>

          <div className="footer-meta">
            <p className="footer-project">
              EdVyro Full Stack Development Task 1 – Responsive Internship Board
            </p>
            <p className="footer-author">
              Developed by <strong>Kannan</strong>
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} InternHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
