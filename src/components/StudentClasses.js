import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { ClassService } from '../services/ClassService';
import './StudentClasses.css';

const StudentClasses = () => {
  const { user, userProfile } = useAuth();
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignments');
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    // Load classes and assignments in parallel
    const [classesResult, assignmentsResult] = await Promise.all([
      ClassService.getStudentClasses(user.uid),
      ClassService.getStudentAssignments(user.uid)
    ]);
    
    if (classesResult.success) {
      setClasses(classesResult.classes);
    }
    
    if (assignmentsResult.success) {
      setAssignments(assignmentsResult.assignments);
    }
    
    setLoading(false);
  };

  const handleJoinClass = async (enrollmentCode) => {
    const result = await ClassService.joinClassWithCode(
      enrollmentCode, 
      user.uid, 
      user.email
    );
    
    if (result.success) {
      loadData();
      setShowJoinModal(false);
      alert(`Successfully joined ${result.className}!`);
    } else {
      alert('Error joining class: ' + result.error);
    }
  };

  if (loading) {
    return (
      <div className="student-classes-loading">
        <div className="loading-spinner">Loading your classes...</div>
      </div>
    );
  }

  return (
    <div className="student-classes">
      <div className="student-classes-header">
        <div className="header-content">
          <h1>My Classes</h1>
          <p>View your classes, assignments, and track your progress</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => setShowJoinModal(true)}
          >
            + Join Class
          </button>
        </div>
      </div>

      <div className="student-tabs">
        <button 
          className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments ({assignments.length})
        </button>
        <button 
          className={`tab ${activeTab === 'classes' ? 'active' : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          My Classes ({classes.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'assignments' && (
          <AssignmentsView assignments={assignments} />
        )}
        
        {activeTab === 'classes' && (
          <ClassesView classes={classes} />
        )}
      </div>

      {showJoinModal && (
        <JoinClassModal
          onClose={() => setShowJoinModal(false)}
          onJoin={handleJoinClass}
        />
      )}
    </div>
  );
};

// Assignments View Component
const AssignmentsView = ({ assignments }) => {
  const upcomingAssignments = assignments.filter(a => 
    !a.dueDate || new Date(a.dueDate) >= new Date()
  );
  
  const overdueAssignments = assignments.filter(a => 
    a.dueDate && new Date(a.dueDate) < new Date()
  );

  return (
    <div className="assignments-view">
      {assignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No Assignments Yet</h3>
          <p>Join a class to see assignments from your teachers.</p>
        </div>
      ) : (
        <>
          {upcomingAssignments.length > 0 && (
            <div className="assignment-section">
              <h3>Current Assignments</h3>
              <div className="assignments-list">
                {upcomingAssignments.map(assignment => (
                  <AssignmentCard 
                    key={`${assignment.classId}_${assignment.id}`}
                    assignment={assignment} 
                    isOverdue={false}
                  />
                ))}
              </div>
            </div>
          )}

          {overdueAssignments.length > 0 && (
            <div className="assignment-section">
              <h3>Overdue Assignments</h3>
              <div className="assignments-list">
                {overdueAssignments.map(assignment => (
                  <AssignmentCard 
                    key={`${assignment.classId}_${assignment.id}`}
                    assignment={assignment} 
                    isOverdue={true}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Assignment Card Component
const AssignmentCard = ({ assignment, isOverdue }) => {
  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const diff = new Date(dueDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysUntilDue = getDaysUntilDue(assignment.dueDate);

  return (
    <div className={`assignment-card ${isOverdue ? 'overdue' : ''}`}>
      <div className="assignment-main">
        <div className="assignment-info">
          <h4>{assignment.testTitle}</h4>
          <p className="assignment-class">{assignment.className}</p>
          {assignment.instructions && (
            <p className="assignment-instructions">{assignment.instructions}</p>
          )}
        </div>

        <div className="assignment-meta">
          {assignment.dueDate && (
            <div className="due-date">
              <span className="label">Due:</span>
              <span className={`date ${isOverdue ? 'overdue' : ''}`}>
                {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
              {daysUntilDue !== null && (
                <span className={`days-until ${isOverdue ? 'overdue' : ''}`}>
                  {isOverdue ? 
                    `${Math.abs(daysUntilDue)} days overdue` : 
                    daysUntilDue === 0 ? 'Due today' :
                    daysUntilDue === 1 ? 'Due tomorrow' :
                    `${daysUntilDue} days left`
                  }
                </span>
              )}
            </div>
          )}

          <div className="assignment-settings">
            {assignment.settings.timeLimit && (
              <span className="setting">⏱️ {assignment.settings.timeLimit} min</span>
            )}
            {assignment.settings.allowRetakes && (
              <span className="setting">🔄 Retakes allowed</span>
            )}
          </div>
        </div>
      </div>

      <div className="assignment-actions">
        <button className="btn-primary">
          Start Test
        </button>
        <button className="btn-secondary">
          View Details
        </button>
      </div>
    </div>
  );
};

// Classes View Component
const ClassesView = ({ classes }) => {
  return (
    <div className="classes-view">
      {classes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎓</div>
          <h3>No Classes Joined</h3>
          <p>Join your first class using an enrollment code from your teacher.</p>
        </div>
      ) : (
        <div className="classes-grid">
          {classes.map(classItem => (
            <StudentClassCard
              key={classItem.id}
              classData={classItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Student Class Card Component
const StudentClassCard = ({ classData }) => {
  const activeAssignments = classData.assignedTests?.filter(a => a.status === 'active') || [];
  const completedAssignments = classData.assignedTests?.filter(a => a.status === 'completed') || [];

  return (
    <div className="student-class-card">
      <div className="class-header">
        <h3>{classData.name}</h3>
        <span className="class-subject">{classData.subject}</span>
      </div>
      
      <div className="class-body">
        <p className="class-description">{classData.description}</p>
        
        <div className="class-stats">
          <div className="stat">
            <strong>{activeAssignments.length}</strong>
            <span>Active</span>
          </div>
          <div className="stat">
            <strong>{completedAssignments.length}</strong>
            <span>Completed</span>
          </div>
          <div className="stat">
            <strong>{classData.stats.totalStudents}</strong>
            <span>Students</span>
          </div>
        </div>
      </div>

      <div className="class-footer">
        <button className="btn-secondary">View Details</button>
      </div>
    </div>
  );
};

// Join Class Modal Component
const JoinClassModal = ({ onClose, onJoin }) => {
  const [enrollmentCode, setEnrollmentCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!enrollmentCode.trim()) {
      alert('Please enter an enrollment code');
      return;
    }
    onJoin(enrollmentCode.trim().toUpperCase());
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Join Class</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="enrollmentCode">Enrollment Code</label>
            <input
              type="text"
              id="enrollmentCode"
              value={enrollmentCode}
              onChange={(e) => setEnrollmentCode(e.target.value)}
              placeholder="Enter 6-character code"
              maxLength={6}
              style={{ textTransform: 'uppercase' }}
              required
            />
            <small>Ask your teacher for the 6-character enrollment code</small>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Join Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentClasses;
