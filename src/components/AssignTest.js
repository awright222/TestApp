import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { ClassService } from '../services/ClassService';
import { FirebaseTestsService } from '../firebase/testsService';
import './AssignTest.css';

const AssignTest = ({ isOpen, onClose, testId, testTitle }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [assignmentData, setAssignmentData] = useState({
    instructions: '',
    dueDate: '',
    timeLimit: '',
    allowRetakes: false,
    shuffleQuestions: false,
    showCorrectAnswers: true
  });

  useEffect(() => {
    if (isOpen && user) {
      loadClasses();
    }
  }, [isOpen, user]);

  const loadClasses = async () => {
    setLoading(true);
    const result = await ClassService.getTeacherClasses(user.uid);
    
    if (result.success) {
      setClasses(result.classes);
    }
    setLoading(false);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    
    if (!selectedClass) {
      alert('Please select a class');
      return;
    }

    const result = await ClassService.assignTestToClass(selectedClass, testId, {
      testTitle,
      ...assignmentData
    });

    if (result.success) {
      alert('Test assigned successfully!');
      onClose();
      // Reset form
      setSelectedClass('');
      setAssignmentData({
        instructions: '',
        dueDate: '',
        timeLimit: '',
        allowRetakes: false,
        shuffleQuestions: false,
        showCorrectAnswers: true
      });
    } else {
      alert('Error assigning test: ' + result.error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal assign-test-modal">
        <div className="modal-header">
          <h2>Assign Test to Class</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleAssign} className="modal-body">
          <div className="test-info">
            <h3>Test: {testTitle}</h3>
          </div>

          <div className="form-group">
            <label htmlFor="classSelect">Select Class *</label>
            {loading ? (
              <div>Loading classes...</div>
            ) : (
              <select
                id="classSelect"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                required
              >
                <option value="">Choose a class...</option>
                {classes.map(classItem => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name} ({classItem.stats.totalStudents} students)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="instructions">Instructions</label>
            <textarea
              id="instructions"
              value={assignmentData.instructions}
              onChange={(e) => setAssignmentData({...assignmentData, instructions: e.target.value})}
              placeholder="Optional instructions for students..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="datetime-local"
                id="dueDate"
                value={assignmentData.dueDate}
                onChange={(e) => setAssignmentData({...assignmentData, dueDate: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="timeLimit">Time Limit (minutes)</label>
              <input
                type="number"
                id="timeLimit"
                value={assignmentData.timeLimit}
                onChange={(e) => setAssignmentData({...assignmentData, timeLimit: parseInt(e.target.value) || ''})}
                placeholder="Leave blank for no limit"
                min="1"
              />
            </div>
          </div>

          <div className="settings-section">
            <h4>Test Settings</h4>
            
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={assignmentData.allowRetakes}
                  onChange={(e) => setAssignmentData({...assignmentData, allowRetakes: e.target.checked})}
                />
                Allow students to retake the test
              </label>
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={assignmentData.shuffleQuestions}
                  onChange={(e) => setAssignmentData({...assignmentData, shuffleQuestions: e.target.checked})}
                />
                Shuffle question order for each student
              </label>
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={assignmentData.showCorrectAnswers}
                  onChange={(e) => setAssignmentData({...assignmentData, showCorrectAnswers: e.target.checked})}
                />
                Show correct answers after submission
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              Assign Test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTest;
