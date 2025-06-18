import React, { useState, useEffect } from 'react';
import './SearchResults.css';

function SearchResults({ 
  searchTerm, 
  onClose, 
  currentQuestions = null, 
  onJumpToQuestion = null,
  currentPage = 'dashboard',
  allTestsData = []
}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (term) => {
    const searchResults = [];
    const lowercaseTerm = term.toLowerCase();

    // If we're in a practice test, search within current questions
    if (currentQuestions && currentPage === 'practice') {
      currentQuestions.forEach((question, index) => {
        const questionText = question.question_text?.toLowerCase() || '';
        const explanation = question.explanation?.toLowerCase() || '';
        const choices = question.choices?.toLowerCase() || '';
        const correctAnswer = question.correct_answer?.toLowerCase() || '';

        if (questionText.includes(lowercaseTerm) || 
            explanation.includes(lowercaseTerm) || 
            choices.includes(lowercaseTerm) ||
            correctAnswer.includes(lowercaseTerm)) {
          
          searchResults.push({
            type: 'current-test',
            questionIndex: index,
            questionNumber: index + 1,
            question: question.question_text,
            relevance: calculateRelevance(question, lowercaseTerm),
            matchedContent: extractMatchedContent(question, lowercaseTerm)
          });
        }
      });
    } else {
      // Global search across all available tests/content
      // This would search through available tests, saved tests, etc.
      // For now, we'll implement a basic structure
      searchResults.push({
        type: 'global',
        source: 'Feature Coming Soon',
        message: 'Global search across all tests will be available soon!'
      });
    }

    // Sort results by relevance
    searchResults.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
    
    setResults(searchResults);
    setLoading(false);
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    performSearch(searchTerm.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, currentQuestions]);

  const calculateRelevance = (question, term) => {
    let score = 0;
    const questionText = question.question_text?.toLowerCase() || '';
    const explanation = question.explanation?.toLowerCase() || '';
    
    // Higher score for matches in question text
    const questionMatches = (questionText.match(new RegExp(term, 'gi')) || []).length;
    score += questionMatches * 10;
    
    // Lower score for matches in explanation
    const explanationMatches = (explanation.match(new RegExp(term, 'gi')) || []).length;
    score += explanationMatches * 5;
    
    return score;
  };

  const extractMatchedContent = (question, term) => {
    const questionText = question.question_text || '';
    const regex = new RegExp(`(.{0,50})(${term})(.{0,50})`, 'gi');
    const match = questionText.match(regex);
    
    if (match && match[0]) {
      return match[0].replace(new RegExp(term, 'gi'), `<mark>$&</mark>`);
    }
    
    return questionText.substring(0, 100) + '...';
  };

  const handleJumpToQuestion = (questionIndex) => {
    if (onJumpToQuestion) {
      onJumpToQuestion(questionIndex);
      onClose();
    }
  };

  if (!searchTerm.trim()) return null;

  return (
    <div className="search-results-overlay" onClick={onClose}>
      <div className="search-results-panel" onClick={e => e.stopPropagation()}>
        <div className="search-results-header">
          <h3>Search Results for "{searchTerm}"</h3>
          <button className="search-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="search-results-content">
          {loading ? (
            <div className="search-loading">
              <div className="search-spinner">🔍</div>
              <p>Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="search-no-results">
              <div className="no-results-icon">📚</div>
              <h4>No results found</h4>
              <p>Try different keywords or check your spelling</p>
            </div>
          ) : (
            <div className="search-results-list">
              {results.map((result, index) => (
                <div key={index} className="search-result-item">
                  {result.type === 'current-test' ? (
                    <div className="search-result-question">
                      <div className="search-result-header">
                        <span className="question-number">Q{result.questionNumber}</span>
                        <button 
                          className="jump-to-question-btn"
                          onClick={() => handleJumpToQuestion(result.questionIndex)}
                        >
                          Jump to Question
                        </button>
                      </div>
                      <div 
                        className="search-result-content"
                        dangerouslySetInnerHTML={{ __html: result.matchedContent }}
                      />
                    </div>
                  ) : (
                    <div className="search-result-global">
                      <div className="search-result-source">{result.source}</div>
                      <p>{result.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {results.length > 0 && currentPage === 'practice' && (
          <div className="search-results-footer">
            <p>Found {results.length} question{results.length !== 1 ? 's' : ''} in current test</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;
