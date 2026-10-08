import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SearchFilters from './components/SearchFilters';
import InternshipList from './components/InternshipList';
import InternshipModal from './components/InternshipModal';
import ErrorState from './components/ErrorState';
import Footer from './components/Footer';
import { INTERNSHIP_DATA } from './data/internships';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All Domains');
  const [selectedMode, setSelectedMode] = useState('All Modes');
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [hasError, setHasError] = useState(false);

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

  // Reset error state
  const handleRetry = () => {
    setHasError(false);
  };

  // Trigger error simulation for testing
  const handleSimulateError = () => {
    setHasError(true);
  };

  // Filtered internships calculation
  const filteredInternships = useMemo(() => {
    if (hasError) return [];

    return INTERNSHIP_DATA.filter((item) => {
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

        const matchId = item.id.toLowerCase().includes(query);
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDomain = item.domain.toLowerCase().includes(query);
        const matchLocation = item.location.toLowerCase().includes(query);
        const matchMode = item.mode.toLowerCase().includes(query);
        const matchSkills = item.skills.some((skill) =>
          skill.toLowerCase().includes(query)
        );

        return (
          matchId ||
          matchTitle ||
          matchDomain ||
          matchLocation ||
          matchMode ||
          matchSkills
        );
      }

      return true;
    });
  }, [searchTerm, selectedDomain, selectedMode, hasError]);

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
                Filter and browse active listings to kickstart your professional journey.
              </p>
            </div>

            {hasError ? (
              <ErrorState onRetry={handleRetry} />
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
                  totalCount={INTERNSHIP_DATA.length}
                  onSimulateError={handleSimulateError}
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
