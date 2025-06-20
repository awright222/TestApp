import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { ClassService } from '../services/ClassService';
import './ClassManagement.css';

const ClassManagement = () => {
  const { user, userProfile } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadClasses();
  }, [user]);

  const loadClasses = async () => {
    if (!user) return;
    
    setLoading(true);
    const result = await ClassService.getTeacherClasses(user.uid);
    
    if (result.success) {
      setClasses(result.classes);
    }
    setLoading(false);
  };

  const handleCreateClass = async (classData) => {
    const result = await ClassService.createClass(user.uid, classData);
    
    if (result.success) {
      // Show success message with enrollment code if applicable
      let successMessage = `Class "${classData.name}" created successfully!`;
      
      if (classData.allowSelfEnrollment && result.class?.settings?.enrollmentCode) {
        successMessage += `\n\nEnrollment Code: ${result.class.settings.enrollmentCode}`;
        successMessage += '\nStudents can use this code to join your class.';
      }
      
      if (classData.initialStudents && classData.initialStudents.length > 0) {
        successMessage += `\n\nInitial students (${classData.initialStudents.length}) have been added to the class.`;
      }
      
      alert(successMessage);
      loadClasses();
      setShowCreateModal(false);
    } else {
      alert('Error creating class: ' + result.error);
    }
  };

  const handleAddStudent = async (studentEmail) => {
    if (!selectedClass) return;
    
    // For now, we'll add by email - in a real implementation, 
    // we'd look up the user by email first
    const result = await ClassService.addStudentToClass(
      selectedClass.id, 
      `user_${studentEmail}`, // Placeholder - would be actual user ID
      studentEmail
    );
    
    if (result.success) {
      // Reload class data
      const classResult = await ClassService.getClass(selectedClass.id);
      if (classResult.success) {
        setSelectedClass(classResult.class);
      }
      setShowStudentModal(false);
    } else {
      alert('Error adding student: ' + result.error);
    }
  };

  if (loading) {
    return (
      <div className="class-management-loading">
        <div className="loading-spinner">Loading your classes...</div>
      </div>
    );
  }

  if (selectedClass) {
    return (
      <ClassDetailView 
        classData={selectedClass}
        onBack={() => setSelectedClass(null)}
        onUpdate={() => {
          // Reload class data
          ClassService.getClass(selectedClass.id).then(result => {
            if (result.success) setSelectedClass(result.class);
          });
        }}
      />
    );
  }

  return (
    <div className="class-management">
      <div className="class-management-header">
        <h1>Class Management</h1>
        <p>Create and manage your classes, students, and assignments</p>
        
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + Create New Class
          </button>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎓</div>
          <h3>No Classes Yet</h3>
          <p>Create your first class to start managing students and assignments.</p>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create Your First Class
          </button>
        </div>
      ) : (
        <div className="classes-grid">
          {classes.map(classItem => (
            <ClassCard
              key={classItem.id}
              classData={classItem}
              onClick={() => setSelectedClass(classItem)}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateClassModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateClass}
        />
      )}
    </div>
  );
};

// Class Card Component
const ClassCard = ({ classData, onClick }) => {
  return (
    <div className="class-card" onClick={onClick}>
      <div className="class-card-header">
        <h3>{classData.name}</h3>
        <span className="class-subject">{classData.subject}</span>
      </div>
      
      <div className="class-card-body">
        <p className="class-description">{classData.description}</p>
        
        <div className="class-stats">
          <div className="stat">
            <strong>{classData.stats.totalStudents}</strong>
            <span>Students</span>
          </div>
          <div className="stat">
            <strong>{classData.stats.totalAssignments}</strong>
            <span>Assignments</span>
          </div>
          <div className="stat">
            <strong>{classData.stats.averageScore}%</strong>
            <span>Avg Score</span>
          </div>
        </div>
      </div>

      <div className="class-card-footer">
        {classData.settings.allowSelfEnrollment && (
          <div className="enrollment-code">
            Code: <strong>{classData.settings.enrollmentCode}</strong>
          </div>
        )}
        <div className="class-date">
          Created {new Date(classData.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

// Create Class Modal
const CreateClassModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    allowSelfEnrollment: true,
    initialStudents: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a class name');
      return;
    }
    
    // Process initial students if provided
    const initialStudentEmails = formData.initialStudents
      .split('\n')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));
    
    onSubmit({
      ...formData,
      initialStudents: initialStudentEmails
    });
  };

  return (
    <div className="modal-overlay">
      <div className="create-class-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎓 Create New Class</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Class Name */}
            <div className="form-group">
              <label htmlFor="className">Class Name *</label>
              <input
                type="text"
                id="className"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Biology 101, AP Chemistry, Math 9th Grade"
                required
                className="form-input"
              />
            </div>

            {/* Subject */}
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="e.g., Science, Math, History, English"
                className="form-input"
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of the class (optional)"
                rows={3}
                className="form-textarea"
              />
            </div>

            {/* Self-Enrollment Options */}
            <div className="enrollment-section">
              <h3>📝 How students will join this class</h3>
              
              <div className="enrollment-option">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="allowSelfEnrollment"
                    checked={formData.allowSelfEnrollment}
                    onChange={(e) => setFormData({...formData, allowSelfEnrollment: e.target.checked})}
                  />
                  <label htmlFor="allowSelfEnrollment">
                    <strong>Generate enrollment code</strong>
                  </label>
                </div>
                <p className="option-description">
                  Students can join using a 6-character code that will be automatically generated. 
                  You'll find this code on your class page after creation.
                </p>
              </div>

              <div className="divider">
                <span>AND/OR</span>
              </div>

              <div className="enrollment-option">
                <label htmlFor="initialStudents">
                  <strong>📧 Add students by email (optional)</strong>
                </label>
                <textarea
                  id="initialStudents"
                  value={formData.initialStudents}
                  onChange={(e) => setFormData({...formData, initialStudents: e.target.value})}
                  placeholder="Enter student email addresses, one per line:&#10;student1@school.edu&#10;student2@school.edu"
                  rows={4}
                  className="form-textarea student-emails"
                />
                <p className="option-description">
                  Add students directly by entering their email addresses. 
                  You can always add more students later from the class management page.
                </p>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Class Detail View Component
const ClassDetailView = ({ classData, onBack, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('students');
  const [showAddStudent, setShowAddStudent] = useState(false);

  return (
    <div className="class-detail">
      <div className="class-detail-header">
        <button className="btn-back" onClick={onBack}>
          ← Back to Classes
        </button>
        
        <div className="class-info">
          <h1>{classData.name}</h1>
          <p>{classData.description}</p>
          <div className="class-meta">
            <span className="subject">{classData.subject}</span>
            {classData.settings.allowSelfEnrollment && (
              <span className="enrollment-code">
                Join Code: <strong>{classData.settings.enrollmentCode}</strong>
              </span>
            )}
          </div>
        </div>

        <div className="class-actions">
          <button className="btn-secondary">Edit Class</button>
          <button className="btn-primary">Assign Test</button>
        </div>
      </div>

      <div className="class-detail-content">
        <div className="class-tabs">
          <button 
            className={`tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Students ({classData.stats.totalStudents})
          </button>
          <button 
            className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            Assignments ({classData.stats.totalAssignments})
          </button>
          <button 
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'students' && (
            <StudentsTab 
              classData={classData}
              onAddStudent={() => setShowAddStudent(true)}
              onUpdate={onUpdate}
            />
          )}
          
          {activeTab === 'assignments' && (
            <AssignmentsTab 
              classData={classData}
              onUpdate={onUpdate}
            />
          )}
          
          {activeTab === 'analytics' && (
            <ClassAnalyticsTab classData={classData} />
          )}
        </div>
      </div>

      {showAddStudent && (
        <AddStudentModal
          onClose={() => setShowAddStudent(false)}
          onSubmit={(email) => {
            // Handle adding student
            setShowAddStudent(false);
            onUpdate();
          }}
        />
      )}
    </div>
  );
};

// Students Tab Component
const StudentsTab = ({ classData, onAddStudent, onUpdate }) => {
  return (
    <div className="students-tab">
      <div className="tab-header">
        <h3>Class Students</h3>
        <button className="btn-primary" onClick={onAddStudent}>
          + Add Student
        </button>
      </div>

      {classData.students.length === 0 ? (
        <div className="empty-state">
          <p>No students enrolled yet.</p>
          <button className="btn-primary" onClick={onAddStudent}>
            Add Your First Student
          </button>
        </div>
      ) : (
        <div className="students-list">
          {classData.students.map((studentId, index) => (
            <div key={studentId} className="student-item">
              <div className="student-info">
                <div className="student-name">Student {index + 1}</div>
                <div className="student-email">{studentId}</div>
              </div>
              <div className="student-stats">
                <span>0 completed</span>
                <span>0% avg</span>
              </div>
              <div className="student-actions">
                <button className="btn-text">View Progress</button>
                <button className="btn-text danger">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Assignments Tab Component  
const AssignmentsTab = ({ classData, onUpdate }) => {
  return (
    <div className="assignments-tab">
      <div className="tab-header">
        <h3>Class Assignments</h3>
        <button className="btn-primary">
          + Create Assignment
        </button>
      </div>

      {classData.assignedTests.length === 0 ? (
        <div className="empty-state">
          <p>No assignments created yet.</p>
          <button className="btn-primary">
            Create Your First Assignment
          </button>
        </div>
      ) : (
        <div className="assignments-list">
          {classData.assignedTests.map(assignment => (
            <div key={assignment.id} className="assignment-item">
              <div className="assignment-info">
                <h4>{assignment.testTitle}</h4>
                <p>{assignment.instructions}</p>
                <div className="assignment-meta">
                  <span>Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}</span>
                  <span>Status: {assignment.status}</span>
                </div>
              </div>
              <div className="assignment-stats">
                <div className="stat">
                  <strong>{assignment.submissions.length}</strong>
                  <span>Submitted</span>
                </div>
                <div className="stat">
                  <strong>{classData.stats.totalStudents - assignment.submissions.length}</strong>
                  <span>Pending</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Class Analytics Tab Component
const ClassAnalyticsTab = ({ classData }) => {
  return (
    <div className="class-analytics-tab">
      <h3>Class Performance Analytics</h3>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h4>Overall Performance</h4>
          <div className="metric-large">
            {classData.stats.averageScore}%
          </div>
          <p>Class Average Score</p>
        </div>
        
        <div className="analytics-card">
          <h4>Completion Rate</h4>
          <div className="metric-large">
            {classData.stats.totalAssignments > 0 
              ? Math.round((classData.stats.completedAssignments / classData.stats.totalAssignments) * 100)
              : 0}%
          </div>
          <p>Assignments Completed</p>
        </div>
        
        <div className="analytics-card">
          <h4>Engagement</h4>
          <div className="metric-large">
            {classData.stats.totalStudents}
          </div>
          <p>Active Students</p>
        </div>
      </div>

      <div className="analytics-section">
        <h4>Recent Activity</h4>
        <p>No recent activity data available.</p>
      </div>
    </div>
  );
};

// Add Student Modal Component
const AddStudentModal = ({ onClose, onSubmit }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Please enter a student email');
      return;
    }
    onSubmit(email);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Add Student</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="studentEmail">Student Email</label>
            <input
              type="email"
              id="studentEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@school.edu"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassManagement;
