import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { useParams, Link } from 'react-router-dom';
import QuestionQuizWithSave from './QuestionQuizWithSave';
import { SavedTestsService } from './SavedTestsService';

const META_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDO68GqAelFKS2G6SwiUWdPs2tw5Gt62D5xLiB_9zyLyBPLSZm5gTthaQz9yCpmDKuymWMc83PV5a2/pub?gid=2042421471&single=true&output=csv';
const SECTIONS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDO68GqAelFKS2G6SwiUWdPs2tw5Gt62D5xLiB_9zyLyBPLSZm5gTthaQz9yCpmDKuymWMc83PV5a2/pub?gid=905416087&single=true&output=csv';
const QUESTIONS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDO68GqAelFKS2G6SwiUWdPs2tw5Gt62D5xLiB_9zyLyBPLSZm5gTthaQz9yCpmDKuymWMc83PV5a2/pub?gid=771661310&single=true&output=csv';

export function CaseStudies() {
  const [meta, setMeta] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(META_URL)
      .then(r => r.text())
      .then(csv => {
        const metaData = Papa.parse(csv, { header: true }).data
          .filter(row => row.id && row.title && row.title.toLowerCase() !== 'title');
        setMeta(metaData);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Case Studies</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
        {meta.map(cs => (
          <Link
            key={cs.id}
            to={`/case-studies/${cs.id}`}
            style={{
              display: 'block',
              background: '#00243a',
              color: '#FDF0D5',
              border: '2px solid #669BBC',
              borderRadius: 10,
              padding: '1.5rem',
              minWidth: 220,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
            }}
          >
            <h3 style={{ margin: 0 }}>{cs.title}</h3>
            <p style={{ margin: '0.5rem 0 0 0', color: '#bfc9d1' }}>{cs.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CaseStudyDetail() {
  const { id } = useParams();
  const [meta, setMeta] = useState(null);
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [modalSection, setModalSection] = useState(null);
  const [savedProgress, setSavedProgress] = useState(null);

  // Check for saved progress for this case study
  useEffect(() => {
    if (id) {
      const savedTests = SavedTestsService.getSavedTests();
      const caseStudyProgress = savedTests.find(test => 
        test.type === 'case-study' && 
        String(test.caseStudyId) === String(id)
      );
      if (caseStudyProgress) {
        setSavedProgress(caseStudyProgress);
      }
    }
  }, [id]);

  // Save progress function
  const handleSaveProgress = (saveData) => {
    try {
      // Add case study specific information
      const caseStudySaveData = {
        ...saveData,
        type: 'case-study',
        caseStudyId: id,
        caseStudyTitle: meta?.title || 'Case Study',
        title: `${meta?.title || 'Case Study'} - ${saveData.title}`
      };
      
      SavedTestsService.saveTest(caseStudySaveData);
      alert('Case study progress saved successfully!');
    } catch (error) {
      console.error('Error saving case study:', error);
      throw error;
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(META_URL).then(r => r.text()),
      fetch(SECTIONS_URL).then(r => r.text()),
      fetch(QUESTIONS_URL).then(r => r.text()),
    ]).then(([metaCsv, sectionsCsv, questionsCsv]) => {
      const metaData = Papa.parse(metaCsv, { header: true }).data;
      const sectionData = Papa.parse(sectionsCsv, { header: true }).data;
      const questionData = Papa.parse(questionsCsv, { header: true }).data;

      setMeta(metaData.find(row => String(row.id).trim() === String(id).trim()));
      const filteredSections = sectionData.filter(row => String(row.case_study_id).trim() === String(id).trim());
      setSections(filteredSections);
      setQuestions(questionData.filter(row => String(row.case_study_id).trim() === String(id).trim()));
      setActiveTab(filteredSections.length > 0 ? filteredSections[0].section_group : null);
      setLoading(false);
    });
  }, [id]);

  if (loading || !meta) {
    return <div>Loading...</div>;
  }

  // Group sections by section_group
  const groupedSections = sections.reduce((acc, section) => {
    const group = section.section_group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(section);
    return acc;
  }, {});

  return (
    <div style={{ padding: '2rem' }}>
      {/* Meta as H1 */}
      <h1>{meta.title}</h1>
      <p>{meta.description}</p>

      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: 12, margin: '2rem 0 1rem 0' }}>
        {Object.keys(groupedSections).map(group => (
          <button
            key={group}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: 8,
              border: activeTab === group ? '2px solid #669BBC' : '1px solid #bfc9d1',
              background: activeTab === group ? '#669BBC' : '#00243a',
              color: activeTab === group ? '#00243a' : '#FDF0D5',
              fontWeight: activeTab === group ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab(group)}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Section Titles as clickable items */}
      <div style={{ marginBottom: '2rem' }}>
        {activeTab && groupedSections[activeTab] && (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {groupedSections[activeTab].map(section => (
              <li key={section.id || section.section_title} style={{ marginBottom: 8 }}>
                <button
                  style={{
                    background: '#003049',
                    color: '#FDF0D5',
                    border: '1px solid #669BBC',
                    borderRadius: 6,
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left'
                  }}
                  onClick={() => setModalSection(section)}
                >
                  {section.section_title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal for section content */}
      {modalSection && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setModalSection(null)}
        >
          <div
            className="modal-content"
            style={{
              background: '#fff',
              color: '#003049',
              borderRadius: 10,
              padding: '2rem',
              minWidth: 320,
              maxWidth: 600,
              boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="modal-close"
              style={{
                position: 'absolute',
                top: 10,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 28,
                color: '#003049',
                cursor: 'pointer'
              }}
              onClick={() => setModalSection(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3>{modalSection.section_title}</h3>
            <div style={{ marginTop: '1rem', whiteSpace: 'pre-line' }}>
              {modalSection.content}
            </div>
          </div>
        </div>
      )}

      {/* Show saved progress notification */}
      {savedProgress && (
        <div style={{
          background: '#669BBC',
          color: '#003049',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          <strong>📚 Saved Progress Found!</strong>
          <p style={{ margin: '0.5rem 0 0 0' }}>
            You have saved progress for this case study. 
            Your answers and current position have been restored.
          </p>
        </div>
      )}

      {/* Questions */}
      <h3>Questions</h3>
      {questions.length > 0 ? (
        <QuestionQuizWithSave 
          questions={questions} 
          onSaveProgress={handleSaveProgress}
          caseStudyTitle={meta?.title}
          initialProgress={savedProgress?.progress}
        />
      ) : (
        <p>No questions for this case study.</p>
      )}
    </div>
  );
}

export default CaseStudyDetail;