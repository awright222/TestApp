import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { useParams, Link, useNavigate } from 'react-router-dom';
import QuestionQuizWithSave from './QuestionQuizWithSave';
import { SavedTestsService } from './SavedTestsService';

const META_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDO68GqAelFKS2G6SwiUWdPs2tw5Gt62D5xLiB_9zyLyBPLSZm5gTthaQz9yCpmDKuymWMc83PV5a2/pub?gid=2042421471&single=true&output=csv';
const SECTIONS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDO68GqAelFKS2G6SwiUWdPs2tw5Gt62D5xLiB_9zyLyBPLSZm5gTthaQz9yCpmDKuymWMc83PV5a2/pub?gid=905416087&single=true&output=csv';
const QUESTIONS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDO68GqAelFKS2G6SwiUWdPs2tw5Gt62D5xLiB_9zyLyBPLSZm5gTthaQz9yCpmDKuymWMc83PV5a2/pub?gid=771661310&single=true&output=csv';

export function CaseStudies() {
  const [meta, setMeta] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading) return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center', 
      color: '#669BBC',
      minHeight: '50vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
      <div style={{ fontSize: '1.2rem' }}>Loading Case Studies...</div>
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header with Back Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '3rem',
        padding: '1rem 0',
        borderBottom: '2px solid #669BBC20'
      }}>
        <button
          onClick={() => navigate('/practice')}
          style={{
            background: 'transparent',
            border: '2px solid #669BBC',
            color: '#669BBC',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginRight: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#669BBC';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#669BBC';
          }}
        >
          ← Back to Practice Tests
        </button>
        <div>
          <div style={{
            fontSize: '0.9rem',
            color: '#669BBC',
            marginBottom: '0.25rem'
          }}>
            💼 MB-800 Certification
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '2rem',
            color: '#003049'
          }}>
            Case Studies
          </h1>
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginTop: '2rem'
      }}>
        {meta.map(cs => (
          <Link
            key={cs.id}
            to={`/case-studies/${cs.id}`}
            style={{
              display: 'block',
              background: 'linear-gradient(135deg, #FDF0D5 0%, #FFFFFF 100%)',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 8px 32px rgba(0, 48, 73, 0.1)',
              border: '1px solid rgba(102, 155, 188, 0.2)',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-8px)';
              e.target.style.boxShadow = '0 16px 48px rgba(0, 48, 73, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(0, 48, 73, 0.1)';
            }}
          >
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #003049 0%, #00243a 100%)',
              borderRadius: '50%',
              transform: 'translate(25px, -25px)',
              opacity: 0.1
            }} />
            
            {/* Case Study Icon */}
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '1rem'
            }}>
              📋
            </div>

            {/* Title */}
            <h3 style={{
              color: '#003049',
              fontSize: '1.3rem',
              marginBottom: '1rem',
              fontWeight: '600',
              lineHeight: '1.3'
            }}>
              {cs.title}
            </h3>

            {/* Description */}
            <p style={{
              color: '#669BBC',
              fontSize: '0.95rem',
              marginBottom: '1.5rem',
              lineHeight: '1.5'
            }}>
              {cs.description}
            </p>

            {/* Badge */}
            <div style={{
              display: 'inline-block',
              background: '#669BBC20',
              color: '#669BBC',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}>
              Interactive Case Study
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CaseStudyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [modalSection, setModalSection] = useState(null);
  const [savedProgress, setSavedProgress] = useState(null);

  // Check for saved progress for this case study
  useEffect(() => {
    const checkSavedProgress = async () => {
      if (id) {
        try {
          const savedTests = await SavedTestsService.getSavedTests();
          const caseStudyProgress = savedTests.find(test => 
            test.type === 'case-study' && 
            String(test.caseStudyId) === String(id)
          );
          if (caseStudyProgress) {
            setSavedProgress(caseStudyProgress);
          }
        } catch (error) {
          console.error('Error loading saved progress:', error);
        }
      }
    };
    
    checkSavedProgress();
  }, [id]);

  // Save progress function
  const handleSaveProgress = async (saveData) => {
    try {
      // Add case study specific information
      const caseStudySaveData = {
        ...saveData,
        type: 'case-study',
        caseStudyId: id,
        caseStudyTitle: meta?.title || 'Case Study',
        title: `${meta?.title || 'Case Study'} - ${saveData.title}`
      };
      
      await SavedTestsService.saveTest(caseStudySaveData);
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
    return (
      <div style={{ 
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
        <div style={{ fontSize: '1.2rem', color: '#669BBC' }}>Loading Case Study...</div>
      </div>
    );
  }

  // Group sections by section_group
  const groupedSections = sections.reduce((acc, section) => {
    const group = section.section_group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(section);
    return acc;
  }, {});

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #FDF0D5 0%, #FFFFFF 100%)',
      minHeight: '100vh'
    }}>
      {/* Header with Back Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '3rem',
        padding: '1.5rem 0',
        borderBottom: '2px solid #669BBC20'
      }}>
        <button
          onClick={() => navigate('/practice')}
          style={{
            background: 'transparent',
            border: '2px solid #669BBC',
            color: '#669BBC',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginRight: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#669BBC';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#669BBC';
          }}
        >
          ← Back to Practice Tests
        </button>
        <div>
          <div style={{
            fontSize: '0.9rem',
            color: '#669BBC',
            marginBottom: '0.25rem'
          }}>
            📋 Interactive Case Study
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '2.2rem',
            color: '#003049',
            fontWeight: '600'
          }}>
            {meta.title}
          </h1>
          <p style={{
            margin: '0.5rem 0 0 0',
            color: '#669BBC',
            fontSize: '1.1rem',
            lineHeight: '1.5'
          }}>
            {meta.description}
          </p>
        </div>
      </div>

      {/* Show saved progress notification */}
      {savedProgress && (
        <div style={{
          background: 'linear-gradient(135deg, #669BBC 0%, #4a90a4 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(102, 155, 188, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>💾</div>
            <div>
              <strong style={{ fontSize: '1.1rem' }}>Saved Progress Found!</strong>
              <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
                Your answers and current position have been restored from your previous session.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section Tabs */}
      <div style={{ 
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(0, 48, 73, 0.08)',
        border: '1px solid rgba(102, 155, 188, 0.1)'
      }}>
        <h2 style={{
          color: '#003049',
          fontSize: '1.5rem',
          marginBottom: '1.5rem',
          fontWeight: '600'
        }}>
          📖 Case Study Information
        </h2>

        <div style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {Object.keys(groupedSections).map(group => (
            <button
              key={group}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '25px',
                border: 'none',
                background: activeTab === group 
                  ? 'linear-gradient(135deg, #003049 0%, #00243a 100%)' 
                  : 'rgba(102, 155, 188, 0.1)',
                color: activeTab === group ? 'white' : '#669BBC',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.95rem'
              }}
              onClick={() => setActiveTab(group)}
              onMouseEnter={(e) => {
                if (activeTab !== group) {
                  e.target.style.background = 'rgba(102, 155, 188, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== group) {
                  e.target.style.background = 'rgba(102, 155, 188, 0.1)';
                }
              }}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Section Content */}
        {activeTab && groupedSections[activeTab] && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {groupedSections[activeTab].map((section, index) => (
              <div
                key={section.id || section.section_title}
                style={{
                  background: 'linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid rgba(102, 155, 188, 0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onClick={() => setModalSection(section)}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = '0 8px 30px rgba(0, 48, 73, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #669BBC 0%, #4a90a4 100%)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      color: '#003049',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      margin: '0 0 0.5rem 0',
                      lineHeight: '1.3'
                    }}>
                      {section.section_title}
                    </h4>
                    <p style={{
                      color: '#669BBC',
                      fontSize: '0.9rem',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      Click to read the full information
                    </p>
                  </div>
                  <div style={{
                    color: '#669BBC',
                    fontSize: '1.2rem'
                  }}>
                    →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for section content */}
      {modalSection && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 48, 73, 0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
          onClick={() => setModalSection(null)}
        >
          <div
            className="modal-content"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FDF0D5 100%)',
              borderRadius: '16px',
              padding: '2.5rem',
              minWidth: '320px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0, 48, 73, 0.3)',
              border: '1px solid rgba(102, 155, 188, 0.2)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="modal-close"
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(102, 155, 188, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '20px',
                color: '#669BBC',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setModalSection(null)}
              onMouseEnter={(e) => {
                e.target.style.background = '#669BBC';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(102, 155, 188, 0.1)';
                e.target.style.color = '#669BBC';
              }}
              aria-label="Close"
            >
              ✕
            </button>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #003049 0%, #00243a 100%)',
                color: 'white',
                borderRadius: '12px',
                padding: '0.75rem',
                fontSize: '1.5rem'
              }}>
                📄
              </div>
              <h3 style={{
                color: '#003049',
                fontSize: '1.8rem',
                fontWeight: '600',
                margin: 0,
                lineHeight: '1.3'
              }}>
                {modalSection.section_title}
              </h3>
            </div>
            
            <div style={{ 
              color: '#003049',
              fontSize: '1.1rem',
              lineHeight: '1.7',
              whiteSpace: 'pre-line',
              background: 'rgba(102, 155, 188, 0.05)',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid rgba(102, 155, 188, 0.1)'
            }}>
              {modalSection.content}
            </div>
            
            <div style={{
              marginTop: '2rem',
              textAlign: 'center'
            }}>
              <button
                onClick={() => setModalSection(null)}
                style={{
                  background: 'linear-gradient(135deg, #669BBC 0%, #4a90a4 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 2rem',
                  borderRadius: '25px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions Section */}
      <div style={{ 
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0, 48, 73, 0.08)',
        border: '1px solid rgba(102, 155, 188, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #003049 0%, #00243a 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '0.75rem',
            fontSize: '1.5rem'
          }}>
            🎯
          </div>
          <h2 style={{
            color: '#003049',
            fontSize: '1.5rem',
            margin: 0,
            fontWeight: '600'
          }}>
            Practice Questions
          </h2>
        </div>

        {questions.length > 0 ? (
          <QuestionQuizWithSave 
            questions={questions} 
            onSaveProgress={handleSaveProgress}
            caseStudyTitle={meta?.title}
            initialProgress={savedProgress?.progress}
            existingSavedTest={savedProgress}
          />
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            color: '#669BBC'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ color: '#669BBC', margin: '0 0 0.5rem 0' }}>No Questions Available</h3>
            <p style={{ margin: 0 }}>This case study doesn't have practice questions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CaseStudyDetail;