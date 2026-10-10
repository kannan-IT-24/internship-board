/**
 * Internship Seed Dataset & Constants
 * Contains base datasets and domain/mode configuration.
 */

export const INTERNSHIP_DATA = [
  {
    id: 'INT-001',
    title: 'Frontend Practice Internship',
    domain: 'Web Development',
    mode: 'Remote',
    duration_weeks: 4,
    applications_open: 1,
    location: 'Remote (Global)',
    skills: ['HTML5', 'CSS3', 'JavaScript', 'React'],
    openings: 2,
  },
  {
    id: 'INT-002',
    title: 'Data Dashboard Internship',
    domain: 'Data Analytics',
    mode: 'Remote',
    duration_weeks: 6,
    applications_open: 1,
    location: 'Remote (Global)',
    skills: ['SQL', 'Python', 'Data Visualization', 'Dashboards'],
    openings: 2,
  },
  {
    id: 'INT-003',
    title: 'Product Design Internship',
    domain: 'UI/UX',
    mode: 'Hybrid',
    duration_weeks: 4,
    applications_open: 1,
    location: 'Hybrid / Pune',
    skills: ['Figma', 'Wireframing', 'User Research', 'Design Systems'],
    openings: 1,
  },
  {
    id: 'INT-004',
    title: 'C++ Utility Internship',
    domain: 'C++ Programming',
    mode: 'Remote',
    duration_weeks: 5,
    applications_open: 0,
    location: 'Remote (Global)',
    skills: ['C++', 'STL', 'Algorithms', 'Debugging'],
    openings: 0,
  },
];

export const DOMAINS = [
  'All Domains',
  'Web Development',
  'Data Analytics',
  'UI/UX',
  'C++ Programming',
  'Full Stack Development',
  'Cyber Security',
];

export const MODES = ['All Modes', 'Remote', 'Hybrid', 'On-site'];
