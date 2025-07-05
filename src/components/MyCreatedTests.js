import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreatedTestsService } from '../services/CreatedTestsService';
import ShareTest from './ShareTest';
import AssignTest from './AssignTest';
import './MyCreatedTests.css';

export default function MyCreatedTests() {
  const navigate = useNavigate();
  const location = useLocation();
  const [createdTests, setCreatedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    console.log('MyCreatedTests component mounted');
    loadCreatedTests();
  }, []);

  // Reload tests when navigating to this page
  useEffect(() => {
    if (location.pathname === '/my-tests') {
      console.log('Navigated to My Tests page, reloading...');
      setLoading(true); // Show loading state
      loadCreatedTests();
    }
  }, [location.pathname]);

  // Prevent body scroll when export modal is open
  useEffect(() => {
    if (exportModalOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.classList.add('modal-open');
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.paddingRight = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.paddingRight = '';
    };
  }, [exportModalOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && exportModalOpen) {
        setExportModalOpen(false);
      }
    };

    if (exportModalOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [exportModalOpen]);

  const loadCreatedTests = async () => {
    try {
      console.log('Loading created tests...', new Date().toISOString());
      const tests = await CreatedTestsService.getCreatedTests();
      console.log('Loaded tests:', tests);
      setCreatedTests(tests);
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Error loading created tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTest = async (testId, testTitle) => {
    if (window.confirm(`Are you sure you want to delete "${testTitle}"?`)) {
      try {
        await CreatedTestsService.deleteTest(testId);
        await loadCreatedTests(); // Reload the list
        alert('Test deleted!');
      } catch (error) {
        console.error('Error deleting test:', error);
        alert('Failed to delete test. Please try again.');
      }
    }
  };

  const launchTest = (testId) => {
    console.log('MyCreatedTests: Launching test with ID:', testId);
    const url = `/custom-test/${testId}`;
    console.log('MyCreatedTests: Navigating to URL:', url);
    navigate(url);
  };

  const editTest = (testId) => {
    navigate(`/create-test/${testId}`);
  };

  const exportTest = (test) => {
    setSelectedTest(test);
    setExportModalOpen(true);
  };

  const exportTestAsJSON = (test) => {
    try {
      const exportData = {
        id: test.id,
        title: test.title,
        description: test.description,
        questions: test.questions,
        source: test.source,
        settings: test.settings,
        exportedAt: new Date().toISOString(),
        version: "1.0"
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Test exported as JSON!');
    } catch (error) {
      console.error('JSON export failed:', error);
      alert('Failed to export test as JSON. Please try again.');
    }
  };

  const exportTestAsCSV = (test) => {
    try {
      let csvContent = "Question Number,Question Text,Correct Answer,Option A,Option B,Option C,Option D,Explanation\n";
      
      test.questions.forEach((question, index) => {
        const questionNum = index + 1;
        const questionText = `"${(question.question || '').replace(/"/g, '""')}"`;
        const correctAnswer = question.correctAnswer || '';
        const optionA = question.options && question.options[0] ? `"${question.options[0].replace(/"/g, '""')}"` : '';
        const optionB = question.options && question.options[1] ? `"${question.options[1].replace(/"/g, '""')}"` : '';
        const optionC = question.options && question.options[2] ? `"${question.options[2].replace(/"/g, '""')}"` : '';
        const optionD = question.options && question.options[3] ? `"${question.options[3].replace(/"/g, '""')}"` : '';
        const explanation = `"${(question.explanation || '').replace(/"/g, '""')}"`;
        
        csvContent += `${questionNum},${questionText},${correctAnswer},${optionA},${optionB},${optionC},${optionD},${explanation}\n`;
      });
      
      const dataBlob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Test exported as CSV!');
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('Failed to export test as CSV. Please try again.');
    }
  };

  const exportTestAsPDF = (test) => {
    try {
      // Create HTML content for the test
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${test.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { border-bottom: 2px solid #003049; padding-bottom: 10px; margin-bottom: 20px; }
            .title { color: #003049; font-size: 24px; margin: 0; }
            .question { margin-bottom: 25px; page-break-inside: avoid; }
            .question-number { font-weight: bold; color: #003049; }
            .question-text { margin: 8px 0; }
            .options { margin: 10px 0; }
            .option { margin: 5px 0; padding-left: 20px; }
            .correct { color: #28a745; font-weight: bold; }
            .explanation { background: #f8f9fa; padding: 10px; border-left: 4px solid #669BBC; margin: 10px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">${test.title}</h1>
            <p><strong>Total Questions:</strong> ${test.questions?.length || 0}</p>
            <p><strong>Exported:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
      `;

      test.questions.forEach((question, index) => {
        htmlContent += `
          <div class="question">
            <div class="question-number">Question ${index + 1}:</div>
            <div class="question-text">${question.question || ''}</div>
        `;

        if (question.options && question.options.length > 0) {
          htmlContent += '<div class="options">';
          question.options.forEach((option, optIndex) => {
            const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
            const isCorrect = question.correctAnswer === letter;
            htmlContent += `<div class="option ${isCorrect ? 'correct' : ''}">${letter}. ${option}</div>`;
          });
          htmlContent += '</div>';
        }

        if (question.explanation) {
          htmlContent += `<div class="explanation"><strong>Explanation:</strong> ${question.explanation}</div>`;
        }

        htmlContent += '</div>';
      });

      htmlContent += `
          <div class="footer">
            <p>Generated by Formulate - ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
        </html>
      `;

      // Create a new window and print
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        alert('PDF export initiated! Use your browser\'s print dialog to save as PDF.');
      }, 500);
      
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export test as PDF. Please try again.');
    }
  };

  const exportTestAsWord = (test) => {
    try {
      let docContent = `${test.title}\n\n`;
      docContent += `Total Questions: ${test.questions?.length || 0}\n`;
      docContent += `Exported: ${new Date().toLocaleDateString()}\n\n`;
      docContent += '='.repeat(50) + '\n\n';

      test.questions.forEach((question, index) => {
        docContent += `Question ${index + 1}:\n`;
        docContent += `${question.question || ''}\n\n`;

        if (question.options && question.options.length > 0) {
          question.options.forEach((option, optIndex) => {
            const letter = String.fromCharCode(65 + optIndex);
            const isCorrect = question.correctAnswer === letter;
            docContent += `${letter}. ${option}${isCorrect ? ' ✓ (CORRECT)' : ''}\n`;
          });
          docContent += '\n';
        }

        if (question.explanation) {
          docContent += `Explanation: ${question.explanation}\n`;
        }

        docContent += '\n' + '-'.repeat(30) + '\n\n';
      });

      const dataBlob = new Blob([docContent], { type: 'text/plain' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Test exported as text file! You can open this in Word or any text editor.');
    } catch (error) {
      console.error('Word export failed:', error);
      alert('Failed to export test as text file. Please try again.');
    }
  };

  const shareTest = (test) => {
    setSelectedTest(test);
    setShareModalOpen(true);
  };

  const assignTest = (test) => {
    setSelectedTest(test);
    setAssignModalOpen(true);
  };

  const importTest = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const importData = JSON.parse(text);
        
        // Validate import data
        if (!importData.title || !importData.questions || !Array.isArray(importData.questions)) {
          throw new Error('Invalid test file format');
        }
        
        // Create new test with imported data
        const newTest = {
          title: `${importData.title} (Imported)`,
          description: importData.description || '',
          questions: importData.questions,
          source: 'import',
          settings: importData.settings || {},
          color: '#669BBC',
          icon: '📥'
        };
        
        await CreatedTestsService.createTest(newTest);
        
        // Refresh the list
        await new Promise(resolve => setTimeout(resolve, 100));
        await loadCreatedTests();
        
        alert(`Test "${newTest.title}" imported successfully!`);
      } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import test. Please check the file format and try again.');
      }
    };
    input.click();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
        <p style={{ color: '#669BBC' }}>Loading your tests...</p>
      </div>
    );
  }

  return (
    <div className="my-created-tests-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: '#FDF0D5', borderRadius: '16px', minHeight: 'calc(100vh - 4rem)' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <div>
          <h1 style={{ color: '#003049', marginBottom: '0.5rem' }}>✨ My Tests</h1>
          <p style={{ color: '#669BBC', margin: 0 }}>
            {createdTests.length} test{createdTests.length !== 1 ? 's' : ''} created
            <small style={{ marginLeft: '1rem', opacity: 0.7 }}>
              Last updated: {new Date(lastRefresh).toLocaleTimeString()}
            </small>
          </p>
          <p style={{ color: '#28a745', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
            ☁️ Tests are automatically synced across all your devices
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => navigate('/create-test')}
            style={{
              background: 'linear-gradient(45deg, #669BBC, #577a9e)',
              color: '#FDF0D5',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = 'linear-gradient(45deg, #577a9e, #4a6b8a)'}
            onMouseOut={(e) => e.target.style.background = 'linear-gradient(45deg, #669BBC, #577a9e)'}
          >
            ✨ Create New Test
          </button>
          <button
            onClick={importTest}
            style={{
              background: '#28a745',
              color: '#FDF0D5',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            📥 Import Test
          </button>
          <button
            onClick={() => navigate('/create-test')}
            style={{
              background: '#780000',
              color: '#FDF0D5',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ➕ Create New Test
          </button>
        </div>
      </div>

      {createdTests.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          background: 'linear-gradient(135deg, #FDF0D5 0%, #FFFFFF 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(102, 155, 188, 0.2)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ color: '#003049', marginBottom: '1rem' }}>No tests created yet</h3>
          <p style={{ color: '#669BBC', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Create your first custom test to get started!
          </p>
          <button
            onClick={() => navigate('/create-test')}
            style={{
              background: '#669BBC',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🚀 Create Your First Test
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {createdTests.map((test) => (
            <div
              key={test.id}
              style={{
                background: 'linear-gradient(135deg, #FDF0D5 0%, #FFFFFF 100%)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid rgba(102, 155, 188, 0.2)',
                boxShadow: '0 4px 16px rgba(0, 48, 73, 0.08)',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 48, 73, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 48, 73, 0.08)';
              }}
            >
              {/* Test Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{test.icon}</span>
                    <span style={{
                      background: `${test.color}20`,
                      color: test.color,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {test.difficulty}
                    </span>
                  </div>
                  <h3 style={{ 
                    color: test.color, 
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    lineHeight: '1.3'
                  }}>
                    {test.title}
                  </h3>
                </div>
                <button
                  onClick={() => deleteTest(test.id, test.title)}
                  style={{
                    background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(220, 53, 69, 0.2)'
                  }}
                  title="Delete test"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(220, 53, 69, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.2)';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Test Description */}
              {test.description && (
                <p style={{ 
                  color: '#669BBC', 
                  margin: '0 0 1rem 0',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                  {test.description}
                </p>
              )}

              {/* Test Stats */}
              <div style={{ 
                display: 'flex', 
                gap: '1rem',
                marginBottom: '1rem',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  background: 'rgba(102, 155, 188, 0.1)',
                  color: '#669BBC',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}>
                  📊 {test.questionCount} questions
                </span>
                <span style={{
                  background: 'rgba(102, 155, 188, 0.1)',
                  color: '#669BBC',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}>
                  📅 {formatDate(test.createdAt)}
                </span>
              </div>

              {/* Source Badge */}
              <div style={{ marginBottom: '1rem' }}>
                <span style={{
                  background: test.source === 'builder' ? '#28a745' : 
                             test.source === 'google-sheets' ? '#4285f4' : '#fd7e14',
                  color: 'white',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {test.source === 'builder' ? '🔨 Built' : 
                   test.source === 'google-sheets' ? '🔗 Google Sheets' : '📥 Imported'}
                </span>
              </div>

              {/* Actions */}
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => launchTest(test.id)}
                  style={{
                    background: test.color,
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  🚀 Launch Test
                </button>
                <button
                  onClick={() => editTest(test.id)}
                  style={{
                    background: 'transparent',
                    color: test.color,
                    border: `2px solid ${test.color}`,
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => shareTest(test)}
                  style={{
                    background: 'transparent',
                    color: '#669BBC',
                    border: '2px solid #669BBC',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  🔗 Share
                </button>
                <button
                  onClick={() => assignTest(test)}
                  style={{
                    background: 'transparent',
                    color: '#17a2b8',
                    border: '2px solid #17a2b8',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  🎓 Assign
                </button>
                <button
                  onClick={() => navigate(`/test-analytics/${test.id}`)}
                  style={{
                    background: 'transparent',
                    color: '#ffc107',
                    border: '2px solid #ffc107',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  📊 Analytics
                </button>
                <button
                  onClick={() => exportTest(test)}
                  style={{
                    background: 'transparent',
                    color: '#28a745',
                    border: '2px solid #28a745',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  📤 Export
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && selectedTest && (
        <ShareTest
          test={selectedTest}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedTest(null);
          }}
        />
      )}

      {/* Assign Test Modal */}
      {assignModalOpen && selectedTest && (
        <AssignTest
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedTest(null);
          }}
          testId={selectedTest.id}
          testTitle={selectedTest.title}
        />
      )}

      {/* Export Modal */}
      {exportModalOpen && selectedTest && (
        <div 
          className="export-modal-overlay" 
          onClick={() => setExportModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-modal-title"
        >
          <div 
            className="export-modal" 
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <div className="export-modal-header">
              <div className="export-header-content">
                <div className="export-icon-large">📤</div>
                <div>
                  <h3 id="export-modal-title">Export Test</h3>
                  <p className="export-test-name">{selectedTest.title}</p>
                </div>
              </div>
              <button 
                className="export-close-btn"
                onClick={() => setExportModalOpen(false)}
                aria-label="Close export modal"
              >
                ×
              </button>
            </div>
            
            <div className="export-modal-content">
              <div className="export-description" style={{
                textAlign: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid #f1f3f4',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '2px',
                  background: 'linear-gradient(90deg, #669BBC, #003049)',
                  borderRadius: '1px'
                }}></div>
                <p style={{
                  margin: 0,
                  color: '#003049',
                  fontSize: '1.1rem',
                  fontWeight: '600'
                }}>Export your test in your preferred format</p>
              </div>
              
              <div className="export-section-title" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: '8px',
                borderLeft: '4px solid #669BBC'
              }}>
                <div className="export-section-title-icon" style={{ fontSize: '1.25rem' }}>📁</div>
                <h4 className="export-section-title-text" style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#003049',
                  margin: 0
                }}>Choose Export Format</h4>
              </div>
              
              <div className="export-format-grid" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '2rem'
              }}>
                <div 
                  className="export-format-card csv"
                  style={{
                    background: 'white',
                    border: '2px solid #e9ecef',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                    position: 'relative'
                  }}
                  onClick={() => {
                    exportTestAsCSV(selectedTest);
                    setExportModalOpen(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#28a745';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.15)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e9ecef';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div className="export-format-icon" style={{
                    fontSize: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    flexShrink: 0,
                    background: 'rgba(40, 167, 69, 0.1)',
                    color: '#28a745'
                  }}>📊</div>
                  <div className="export-format-info" style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      margin: '0 0 0.25rem 0',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#003049'
                    }}>Excel/CSV Spreadsheet</h4>
                    <p style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      color: '#6c757d',
                      lineHeight: '1.3'
                    }}>Perfect for editing questions and answers in Excel or Google Sheets</p>
                  </div>
                  <div style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '8px',
                    height: '8px',
                    borderRight: '2px solid #ccc',
                    borderBottom: '2px solid #ccc',
                    transform: 'translateY(-50%) rotate(-45deg)',
                    transition: 'all 0.2s ease'
                  }}></div>
                </div>

                <div 
                  className="export-format-card pdf"
                  style={{
                    background: 'white',
                    border: '2px solid #e9ecef',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                    position: 'relative'
                  }}
                  onClick={() => {
                    exportTestAsPDF(selectedTest);
                    setExportModalOpen(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#dc3545';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.15)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e9ecef';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div className="export-format-icon" style={{
                    fontSize: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    flexShrink: 0,
                    background: 'rgba(220, 53, 69, 0.1)',
                    color: '#dc3545'
                  }}>📄</div>
                  <div className="export-format-info" style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      margin: '0 0 0.25rem 0',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#003049'
                    }}>PDF Document</h4>
                    <p style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      color: '#6c757d',
                      lineHeight: '1.3'
                    }}>Print-ready format for physical distribution or sharing</p>
                  </div>
                  <div style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '8px',
                    height: '8px',
                    borderRight: '2px solid #ccc',
                    borderBottom: '2px solid #ccc',
                    transform: 'translateY(-50%) rotate(-45deg)',
                    transition: 'all 0.2s ease'
                  }}></div>
                </div>

                <div 
                  className="export-format-card word"
                  style={{
                    background: 'white',
                    border: '2px solid #e9ecef',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                    position: 'relative'
                  }}
                  onClick={() => {
                    exportTestAsWord(selectedTest);
                    setExportModalOpen(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#007bff';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.15)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e9ecef';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div className="export-format-icon" style={{
                    fontSize: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    flexShrink: 0,
                    background: 'rgba(0, 123, 255, 0.1)',
                    color: '#007bff'
                  }}>📝</div>
                  <div className="export-format-info" style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      margin: '0 0 0.25rem 0',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#003049'
                    }}>Text/Word Document</h4>
                    <p style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      color: '#6c757d',
                      lineHeight: '1.3'
                    }}>Easy to edit in Microsoft Word or any text editor</p>
                  </div>
                  <div style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '8px',
                    height: '8px',
                    borderRight: '2px solid #ccc',
                    borderBottom: '2px solid #ccc',
                    transform: 'translateY(-50%) rotate(-45deg)',
                    transition: 'all 0.2s ease'
                  }}></div>
                </div>

                <div 
                  className="export-format-card json"
                  style={{
                    background: 'white',
                    border: '2px solid #e9ecef',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                    position: 'relative'
                  }}
                  onClick={() => {
                    exportTestAsJSON(selectedTest);
                    setExportModalOpen(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#6c757d';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.15)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e9ecef';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div className="export-format-icon" style={{
                    fontSize: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    flexShrink: 0,
                    background: 'rgba(108, 117, 125, 0.1)',
                    color: '#6c757d'
                  }}>⚙️</div>
                  <div className="export-format-info" style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      margin: '0 0 0.25rem 0',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#003049'
                    }}>JSON Backup</h4>
                    <p style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      color: '#6c757d',
                      lineHeight: '1.3'
                    }}>Complete backup file for importing into other systems</p>
                  </div>
                  <div style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '8px',
                    height: '8px',
                    borderRight: '2px solid #ccc',
                    borderBottom: '2px solid #ccc',
                    transform: 'translateY(-50%) rotate(-45deg)',
                    transition: 'all 0.2s ease'
                  }}></div>
                </div>
              </div>

              <div className="export-tip" style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                border: '1px solid #e0e7ff',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                color: '#495057'
              }}>
                <div className="export-tip-icon" style={{
                  fontSize: '1.25rem',
                  flexShrink: 0,
                  marginTop: '0.125rem'
                }}>💡</div>
                <span><strong style={{ color: '#003049', fontWeight: '600' }}>Quick Tip:</strong> Use <strong>Excel/CSV</strong> for bulk editing, <strong>PDF</strong> for printing, or <strong>JSON</strong> for backup.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
