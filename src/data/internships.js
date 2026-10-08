/**
 * Internship Seed Dataset
 * Contains exactly the 5 specified records according to task requirements.
 */

export const INTERNSHIP_DATA = [
  {
    id: 'INT-101',
    title: 'Frontend Intern',
    domain: 'Full Stack Development',
    mode: 'Remote',
    location: 'India',
    skills: ['HTML', 'CSS', 'Git'],
    openings: 2,
  },
  {
    id: 'INT-102',
    title: 'API Engineer Intern',
    domain: 'Full Stack Development',
    mode: 'Hybrid',
    location: 'Pune',
    skills: ['Node.js', 'SQL', 'Testing'],
    openings: 2,
  },
  {
    id: 'INT-103',
    title: 'UI/UX Intern',
    domain: 'UI/UX',
    mode: 'Remote',
    location: 'India',
    skills: ['Figma', 'Research', 'Accessibility'],
    openings: 1,
  },
  {
    id: 'INT-104',
    title: 'Data Analyst Intern',
    domain: 'Data Analytics',
    mode: 'On-site',
    location: 'Bengaluru',
    skills: ['Excel', 'SQL', 'Data Visualization'],
    openings: 3,
  },
  {
    id: 'INT-105',
    title: 'Security Operations Intern',
    domain: 'Cyber Security',
    mode: 'Remote',
    location: 'India',
    skills: ['Linux', 'Logs', 'Networking'],
    openings: 1,
  },
];

export const DOMAINS = [
  'All Domains',
  'Full Stack Development',
  'UI/UX',
  'Data Analytics',
  'Cyber Security',
];

export const MODES = ['All Modes', 'Remote', 'Hybrid', 'On-site'];
