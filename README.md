# InternHub – Responsive Internship Board

## About
**InternHub** is a modern, responsive, and accessible single-page web application designed for students and graduates to discover verified internship opportunities. Built as part of the **EdVyro Full Stack Development Task 1**, it empowers applicants to effortlessly search across titles, skills, IDs, modes, and locations, filter by domain and work mode, view detailed job descriptions in an accessible modal dialog, and interact with robust empty and error states.

- **Live URL**: [https://kannan-IT-24.github.io/internship-board/](https://kannan-IT-24.github.io/internship-board/)
- **Repository**: [https://github.com/kannan-IT-24/internship-board](https://github.com/kannan-IT-24/internship-board)

---

## Features
- **Internship Search**: Fast, case-insensitive instant search across Internship ID, Title, Domain, Location, Mode, and required Skills (e.g., searching "SQL" or "India" or "Remote").
- **Domain Filtering**: Dedicated filter dropdown covering *All Domains*, *Full Stack Development*, *UI/UX*, *Data Analytics*, and *Cyber Security*.
- **Mode Filtering**: Dedicated filter dropdown covering *All Modes*, *Remote*, *Hybrid*, and *On-site*.
- **Clear Filters**: One-click reset button to quickly restore default search and filter parameters.
- **Dynamic Result Count**: Displays real-time result counts with ARIA live region support for screen reader users.
- **Responsive Internship Cards**: Information-rich cards displaying titles, IDs, domains, mode badges, locations, openings, and skill tags with smooth hover states.
- **Internship Details Modal**: Accessible pop-up modal featuring complete position specifications, keyboard navigation (Escape to close, Tab trapping), focus management, and an "Apply Now" action button.
- **Apply Confirmation**: Displays "Application feature coming soon." feedback notice when clicking "Apply Now" without navigating to fake URLs.
- **Empty State**: Clear, user-friendly fallback view ("No internships found - Try changing your search or filters.") with an integrated "Clear Filters" action.
- **Error State**: Resilient error handling view ("Unable to load internships - Something went wrong while loading internship data.") with a functional "Try Again" recovery action.
- **Accessibility (a11y)**: Semantic HTML5, WCAG AA contrast, visible focus rings, keyboard accessibility, and ARIA labels throughout.
- **Responsive Design**: Flawless, scroll-free adaptability across 360px mobile, 768px tablet, and full desktop displays.

---

## Technologies
- **React** (v19) – UI Component Architecture
- **Vite** (v8) – Next-generation build tool & dev server
- **JavaScript** (ES6+) – Application logic and reactive state management
- **CSS3** – Modern responsive design with CSS Grid, Flexbox, and CSS Variables (No external UI libraries)

---

## Project Structure

```text
internship-board/
├── public/                 # Static assets
├── src/
│   ├── components/         # Modular, reusable React components
│   │   ├── Header.jsx          # Accessible header with navigation & skip link
│   │   ├── Hero.jsx            # Hero section with title, summary, and scroll CTA
│   │   ├── SearchFilters.jsx   # Search input, dropdown filters, count & clear actions
│   │   ├── InternshipCard.jsx  # Reusable internship card with metadata & tags
│   │   ├── InternshipList.jsx  # Responsive grid & empty state orchestrator
│   │   ├── InternshipModal.jsx # Accessible dialog with focus trap & Esc listener
│   │   ├── EmptyState.jsx      # Friendly fallback when zero matches found
│   │   ├── ErrorState.jsx      # Resilient error alert with retry functionality
│   │   └── Footer.jsx          # Semantic footer with author & project details
│   ├── data/
│   │   └── internships.js      # Seed dataset (5 records) & domain/mode constants
│   ├── App.jsx             # Root application state management & layout
│   ├── index.css           # Global typography, colors, layout, and media queries
│   └── main.jsx            # React root mount point
├── index.html              # HTML shell with accessibility & viewport settings
├── package.json            # Dependencies and npm scripts
├── vite.config.js          # Vite build configuration
└── README.md               # Project documentation
```

---

## How to Run

Follow these simple steps in your terminal or command prompt:

1. Navigate to the project directory:
   ```bash
   cd "C:\Users\KANNAN G\Desktop\internship-board"
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:5173/
   ```

5. To create an optimized production build:
   ```bash
   npm run build
   ```

---

## Responsive Testing

The project has been tested and verified across key screen viewports:
- **360px (Mobile)**: Single-column stacked cards, full-width touch-friendly inputs, adaptive hamburger navigation, and zero horizontal scrolling.
- **768px (Tablet)**: Balanced two-column grid layout, streamlined filter bar, and optimized modal spacing.
- **Desktop (1024px+)**: Elegant multi-column card grid, sticky header, centered content container (max-width: 1200px), and subtle micro-interactions.

---

## Accessibility

- **Semantic Elements**: Structured using `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, and `<footer>`.
- **Keyboard Navigation**: Complete tab order traversal; modal traps focus and closes on the `Escape` key.
- **Focus Management**: Opening the modal moves focus to the close button; closing the modal restores focus to the triggering "View Details" button.
- **ARIA Attributes**: `aria-live="polite"` on dynamic search counts, `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and descriptive `aria-label`s on action buttons.
- **Color Contrast**: All text and badge color pairings meet or exceed WCAG AA contrast criteria.
- **Skip Link**: Includes a keyboard-accessible "Skip to main content" link for fast screen reader navigation.

---

## Internship Data

The application strictly utilizes the verified 5-record seed dataset without any external API calls or artificial data:
1. **INT-101**: Frontend Intern | Full Stack Development | Remote | India | HTML, CSS, Git | 2 Openings
2. **INT-102**: API Engineer Intern | Full Stack Development | Hybrid | Pune | Node.js, SQL, Testing | 2 Openings
3. **INT-103**: UI/UX Intern | UI/UX | Remote | India | Figma, Research, Accessibility | 1 Opening
4. **INT-104**: Data Analyst Intern | Data Analytics | On-site | Bengaluru | Excel, SQL, Data Visualization | 3 Openings
5. **INT-105**: Security Operations Intern | Cyber Security | Remote | India | Linux, Logs, Networking | 1 Opening

---

## Author

**Kannan**
