import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SearchFilters from './components/SearchFilters';
import InternshipList from './components/InternshipList';
import InternshipModal from './components/InternshipModal';
import ErrorState from './components/ErrorState';
import Footer from './components/Footer';
import { getInternships } from './services/api';
import { DOMAINS, MODES } from './data/internships';

export default function App() {
  const [internships, setInternships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All Domains');
  const [selectedMode, setSelectedMode] = useState('All Modes');
  const [selectedInternship, setSelectedInternship] = useState(null);

  // Fetch internships from Express + SQLite REST API
  const loadInternships = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await getInternships({ limit: 100 });
      setInternships(response.data || []);
    } catch (err) {
      setErrorMessage(
        err.message || 'Unable to load internships from backend server.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInternships();
  }, [loadInternships]);

  // Check if any filters or search are active
  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedDomain !== 'All Domains' ||
    selectedMode !== 'All Modes';

  // Handle clearing all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDomain('All Domains');
    setSelectedMode('All Modes');
  };

  // Reset error state and reload from API
  const handleRetry = () => {
    loadInternships();
  };

  // Trigger error simulation for manual UI testing
  const handleSimulateError = () => {
    setErrorMessage(
      'Simulated error state triggered for UI resilience testing. Click "Try Again" to restore live data.'
    );
  };

  // Compute available domains dynamically from loaded internships
  const availableDomains = useMemo(() => {
    const fromData = internships.map((i) => i.domain).filter(Boolean);
    const combined = Array.from(new Set([...DOMAINS, ...fromData]));
    return combined;
  }, [internships]);

  // Filtered internships calculation
  const filteredInternships = useMemo(() => {
    if (errorMessage) return [];

    return internships.filter((item) => {
      // 1. Domain filter
      if (selectedDomain !== 'All Domains' && item.domain !== selectedDomain) {
        return false;
      }

      // 2. Mode filter
      if (selectedMode !== 'All Modes' && item.mode !== selectedMode) {
        return false;
      }

      // 3. Search query filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.trim().toLowerCase();

        const matchId = item.id ? item.id.toLowerCase().includes(query) : false;
        const matchTitle = item.title ? item.title.toLowerCase().includes(query) : false;
        const matchDomain = item.domain ? item.domain.toLowerCase().includes(query) : false;
        const matchMode = item.mode ? item.mode.toLowerCase().includes(query) : false;
        const matchDuration = item.duration_weeks
          ? `${item.duration_weeks} weeks`.includes(query)
          : false;
        const matchSkills = Array.isArray(item.skills)
          ? item.skills.some((skill) => skill.toLowerCase().includes(query))
          : false;

        return (
          matchId ||
          matchTitle ||
          matchDomain ||
          matchMode ||
          matchDuration ||
          matchSkills
        );
      }

      return true;
    });
  }, [internships, searchTerm, selectedDomain, selectedMode, errorMessage]);

  return (
    <div className="app-layout">
      <Header />

      <main id="main-content" className="main-content">
        <Hero />

        <section
          id="internships"
          className="internships-section"
          aria-labelledby="internships-heading"
        >
          <div className="container">
            <div className="section-header">
              <h2 id="internships-heading" className="section-title">
                Available Internship Opportunities
              </h2>
              <p className="section-subtitle">
                Filter and browse verified persistent listings stored in SQLite and served via Express REST API.
              </p>
            </div>

            {isLoading ? (
              <div
                className="loading-container"
                style={{
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  margin: '1.5rem auto',
                  maxWidth: '600px',
                }}
                role="status"
                aria-live="polite"
              >
                <div
                  className="loading-spinner"
                  style={{
                    display: 'inline-block',
                    width: '38px',
                    height: '38px',
                    border: '3px solid var(--border-light)',
                    borderTopColor: 'var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    marginBottom: '1rem',
                  }}
                  aria-hidden="true"
                ></div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Connecting to InternHub API...
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Loading internships from persistent SQLite storage.
                </p>
              </div>
            ) : errorMessage ? (
              <ErrorState onRetry={handleRetry} message={errorMessage} />
            ) : (
              <>
                <SearchFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedDomain={selectedDomain}
                  onDomainChange={setSelectedDomain}
                  selectedMode={selectedMode}
                  onModeChange={setSelectedMode}
                  onClearFilters={handleClearFilters}
                  hasActiveFilters={hasActiveFilters}
                  resultCount={filteredInternships.length}
                  totalCount={internships.length}
                  onSimulateError={handleSimulateError}
                  domains={availableDomains}
                  modes={MODES}
                />

                <InternshipList
                  internships={filteredInternships}
                  onSelect={setSelectedInternship}
                  onClearFilters={handleClearFilters}
                />
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {selectedInternship && (
        <InternshipModal
          internship={selectedInternship}
          onClose={() => setSelectedInternship(null)}
        />
      )}
    </div>
  );
}
