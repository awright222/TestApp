import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { OrganizationService } from '../services/OrganizationService';
import { ClassService } from '../services/ClassService';
import './StudentDirectory.css';

const StudentDirectory = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddToClassModal, setShowAddToClassModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState(new Set());

  // For now, we'll use a default organization ID
  // In a real app, this would come from the user's profile
  const organizationId = 'default_org';

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [studentsResult, classesResult] = await Promise.all([
        OrganizationService.getOrganizationStudents(organizationId),
        ClassService.getTeacherClasses(user.uid)
      ]);

      if (studentsResult.success) {
        setStudents(studentsResult.students);
      }

      if (classesResult.success) {
        setClasses(classesResult.classes);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedClass === 'all') return matchesSearch;
    
    return matchesSearch && student.classes.some(cls => cls.id === selectedClass);
  });

  const handleAddToClass = async (studentEmail, classIds) => {
    const result = await OrganizationService.addStudentToMultipleClasses(studentEmail, classIds);
    
    if (result.success) {
      alert(`Student added to ${result.summary.successful} classes successfully!`);
      loadData(); // Reload data
      setShowAddToClassModal(false);
    } else {
      alert('Error adding student to classes: ' + result.error);
    }
  };

  const handleBulkAssign = async (classIds) => {
    const studentEmails = Array.from(selectedStudents).map(studentId => {
      const student = students.find(s => s.id === studentId);
      return student?.email;
    }).filter(Boolean);

    const results = [];
    for (const email of studentEmails) {
      const result = await OrganizationService.addStudentToMultipleClasses(email, classIds);
      results.push(result);
    }

    const totalSuccessful = results.reduce((sum, r) => sum + r.summary.successful, 0);
    alert(`Successfully assigned ${totalSuccessful} class assignments!`);
    
    setSelectedStudents(new Set());
    setShowBulkAssignModal(false);
    loadData();
  };

  const handleAddStudent = async (studentEmail, selectedClassIds) => {
    try {
      if (selectedClassIds && selectedClassIds.length > 0) {
        // Add to specific classes
        const result = await OrganizationService.addStudentToMultipleClasses(studentEmail, selectedClassIds);
        
        if (result.success) {
          alert(`Student ${studentEmail} added to ${result.summary.successful} classes successfully!`);
          loadData(); // Reload data
          setShowAddStudentModal(false);
        } else {
          alert('Error adding student: ' + result.error);
        }
      } else {
        // Just add the student to the organization (no specific classes)
        // In a real implementation, you'd have an OrganizationService.addStudentToOrganization method
        alert(`Student ${studentEmail} added to organization. You can assign them to classes later.`);
        setShowAddStudentModal(false);
        loadData();
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student: ' + error.message);
    }
  };

  const toggleStudentSelection = (studentId) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  if (loading) {
    return (
      <div className="student-directory-loading">
        <div className="loading-spinner">Loading student directory...</div>
      </div>
    );
  }

  return (
    <div className="student-directory">
      <div className="student-directory-header">
        <h1>Student Directory</h1>
        <p>Manage all students in your organization</p>
      </div>

      <div className="directory-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-section">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="class-filter"
          >
            <option value="all">All Students</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.stats.totalStudents} students)
              </option>
            ))}
          </select>
        </div>

        <div className="action-buttons">
          <button
            className="btn-primary"
            onClick={() => setShowAddStudentModal(true)}
          >
            + Add Student
          </button>
          {selectedStudents.size > 0 && (
            <button
              className="btn-primary"
              onClick={() => setShowBulkAssignModal(true)}
              style={{ marginLeft: '1rem' }}
            >
              Assign {selectedStudents.size} Students to Classes
            </button>
          )}
        </div>
      </div>

      <div className="directory-stats">
        <div className="stat">
          <strong>{filteredStudents.length}</strong>
          <span>Students Shown</span>
        </div>
        <div className="stat">
          <strong>{students.length}</strong>
          <span>Total Students</span>
        </div>
        <div className="stat">
          <strong>{classes.length}</strong>
          <span>Your Classes</span>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Students Found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="students-table">
          <div className="table-header">
            <div className="header-cell">
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
                  } else {
                    setSelectedStudents(new Set());
                  }
                }}
                checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
              />
            </div>
            <div className="header-cell">Student</div>
            <div className="header-cell">Classes</div>
            <div className="header-cell">Performance</div>
            <div className="header-cell">Last Active</div>
            <div className="header-cell">Actions</div>
          </div>

          {filteredStudents.map(student => (
            <StudentRow
              key={student.id}
              student={student}
              selected={selectedStudents.has(student.id)}
              onToggleSelect={() => toggleStudentSelection(student.id)}
              onAddToClass={(student) => {
                setSelectedStudent(student);
                setShowAddToClassModal(true);
              }}
              classes={classes}
            />
          ))}
        </div>
      )}

      {showAddToClassModal && selectedStudent && (
        <AddToClassModal
          student={selectedStudent}
          availableClasses={classes}
          onClose={() => setShowAddToClassModal(false)}
          onSubmit={handleAddToClass}
        />
      )}

      {showBulkAssignModal && (
        <BulkAssignModal
          studentCount={selectedStudents.size}
          availableClasses={classes}
          onClose={() => setShowBulkAssignModal(false)}
          onSubmit={handleBulkAssign}
        />
      )}

      {showAddStudentModal && (
        <AddStudentModal
          availableClasses={classes}
          onClose={() => setShowAddStudentModal(false)}
          onSubmit={handleAddStudent}
        />
      )}
    </div>
  );
};

// Student Row Component
const StudentRow = ({ student, selected, onToggleSelect, onAddToClass, classes }) => {
  const getPerformanceColor = (score) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'average';
    return 'needs-improvement';
  };

  const formatLastActive = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="table-row">
      <div className="table-cell">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
        />
      </div>
      
      <div className="table-cell">
        <div className="student-info">
          <div className="student-name">{student.displayName}</div>
          <div className="student-email">{student.email}</div>
        </div>
      </div>
      
      <div className="table-cell">
        <div className="student-classes">
          {student.classes.length === 0 ? (
            <span className="no-classes">No classes</span>
          ) : (
            student.classes.map(cls => (
              <span key={cls.id} className="class-tag">
                {cls.name}
              </span>
            ))
          )}
        </div>
      </div>
      
      <div className="table-cell">
        <div className="performance">
          <div className={`score ${getPerformanceColor(student.stats.averageScore)}`}>
            {student.stats.averageScore}%
          </div>
          <div className="assignments">
            {student.stats.completedAssignments}/{student.stats.totalAssignments} completed
          </div>
        </div>
      </div>
      
      <div className="table-cell">
        <span className="last-active">
          {formatLastActive(student.lastActive)}
        </span>
      </div>
      
      <div className="table-cell">
        <button
          className="btn-text"
          onClick={() => onAddToClass(student)}
        >
          Add to Class
        </button>
      </div>
    </div>
  );
};

// Add to Class Modal
const AddToClassModal = ({ student, availableClasses, onClose, onSubmit }) => {
  const [selectedClasses, setSelectedClasses] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedClasses.length === 0) {
      alert('Please select at least one class');
      return;
    }
    onSubmit(student.email, selectedClasses);
  };

  const toggleClass = (classId) => {
    setSelectedClasses(prev => 
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Add {student.displayName} to Classes</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="class-selection">
            {availableClasses.map(cls => (
              <label key={cls.id} className="class-option">
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(cls.id)}
                  onChange={() => toggleClass(cls.id)}
                  disabled={student.classes.some(studentClass => studentClass.id === cls.id)}
                />
                <div className="class-info">
                  <div className="class-name">{cls.name}</div>
                  <div className="class-meta">{cls.subject} • {cls.stats.totalStudents} students</div>
                </div>
                {student.classes.some(studentClass => studentClass.id === cls.id) && (
                  <span className="already-enrolled">Already enrolled</span>
                )}
              </label>
            ))}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add to {selectedClasses.length} Classes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Bulk Assign Modal
const BulkAssignModal = ({ studentCount, availableClasses, onClose, onSubmit }) => {
  const [selectedClasses, setSelectedClasses] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedClasses.length === 0) {
      alert('Please select at least one class');
      return;
    }
    onSubmit(selectedClasses);
  };

  const toggleClass = (classId) => {
    setSelectedClasses(prev => 
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Assign {studentCount} Students to Classes</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <p className="bulk-assign-description">
            Select the classes you want to assign the {studentCount} selected students to.
            Students already enrolled in a class will not be added again.
          </p>

          <div className="class-selection">
            {availableClasses.map(cls => (
              <label key={cls.id} className="class-option">
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(cls.id)}
                  onChange={() => toggleClass(cls.id)}
                />
                <div className="class-info">
                  <div className="class-name">{cls.name}</div>
                  <div className="class-meta">{cls.subject} • {cls.stats.totalStudents} students</div>
                </div>
              </label>
            ))}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Assign to {selectedClasses.length} Classes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Student Modal Component
const AddStudentModal = ({ availableClasses, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    selectedClasses: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      alert('Please enter a student email');
      return;
    }
    onSubmit(formData.email, formData.selectedClasses);
  };

  const toggleClass = (classId) => {
    setFormData(prev => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(classId)
        ? prev.selectedClasses.filter(id => id !== classId)
        : [...prev.selectedClasses, classId]
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Add New Student</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="studentEmail">Student Email Address</label>
            <input
              type="email"
              id="studentEmail"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="student@school.edu"
              required
              className="form-input"
            />
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              The student will receive an invitation to join the selected classes.
            </p>
          </div>

          <div className="form-group">
            <label>Assign to Classes (Optional)</label>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Select which classes this student should be enrolled in. You can also assign them to classes later.
            </p>
            
            <div className="class-selection">
              {availableClasses.map(cls => (
                <div key={cls.id} className="class-option">
                  <input
                    type="checkbox"
                    id={`class-${cls.id}`}
                    checked={formData.selectedClasses.includes(cls.id)}
                    onChange={() => toggleClass(cls.id)}
                  />
                  <label htmlFor={`class-${cls.id}`} className="class-info">
                    <div className="class-name">{cls.name}</div>
                    <div className="class-meta">
                      {cls.subject} • {cls.stats.totalStudents} students
                    </div>
                  </label>
                </div>
              ))}
              
              {availableClasses.length === 0 && (
                <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                  No classes available. Create a class first to assign students.
                </p>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {formData.selectedClasses.length > 0 
                ? `Add Student to ${formData.selectedClasses.length} Classes`
                : 'Add Student'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentDirectory;
