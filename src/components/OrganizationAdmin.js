import React, { useState, useEffect } from 'react';
// Cache bust: 2025-06-21 update
import { useAuth } from '../firebase/AuthContext';
import { OrganizationService } from '../services/OrganizationService';
import { BulkOperationsService } from '../services/BulkOperationsService';
import './OrganizationAdmin.css';

const OrganizationAdmin = () => {
  const { user, userProfile, isAdmin, hasOrgAdminPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [organizationData, setOrganizationData] = useState({
    stats: {},
    teachers: [],
    students: [],
    classes: [],
    analytics: {}
  });
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [importType, setImportType] = useState('students');
  const [actionLoading, setActionLoading] = useState(false);

  // Get organization ID from user profile or default
  const organizationId = userProfile?.organizationId || 'default_org';

  // Check if user has admin permissions - DISABLED FOR DEVELOPMENT
  useEffect(() => {
    // In development, allow access for any logged-in user
    if (process.env.NODE_ENV === 'development') {
      return; // Skip role check in development
    }
    
    if (userProfile && !isAdmin()) {
      // Redirect non-admin users (only in production)
      alert('Access denied. Organization Admin access requires admin role.');
      window.location.href = '/dashboard';
      return;
    }
  }, [userProfile, isAdmin]);

  useEffect(() => {
    loadOrganizationData();
  }, [user]);

  const loadOrganizationData = async () => {
    if (!user) {
      setLoading(false); // Set loading to false if no user
      return;
    }
    
    setLoading(true);
    try {
      const [statsResult, studentsResult, classesResult, teachersResult, analyticsResult] = await Promise.all([
        OrganizationService.getOrganizationStats(organizationId),
        OrganizationService.getOrganizationStudents(organizationId),
        OrganizationService.getOrganizationClasses(organizationId),
        OrganizationService.getOrganizationTeachers(organizationId),
        OrganizationService.getOrganizationAnalytics(organizationId)
      ]);

      setOrganizationData({
        stats: statsResult.success ? statsResult.stats : {},
        students: studentsResult.success ? studentsResult.students : [],
        classes: classesResult.success ? classesResult.classes : [],
        teachers: teachersResult.success ? teachersResult.teachers : [],
        analytics: analyticsResult.success ? analyticsResult.analytics : {}
      });
    } catch (error) {
      console.error('Error loading organization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (teacherData) => {
    // Skip permission check in development
    if (process.env.NODE_ENV === 'production' && !hasOrgAdminPermission('manage_teachers')) {
      alert('You do not have permission to manage teachers.');
      return;
    }

    setActionLoading(true);
    try {
      const result = await OrganizationService.addTeacher(organizationId, {
        ...teacherData,
        invitedBy: user.uid
      });
      
      if (result.success) {
        alert(result.message || `Teacher ${teacherData.email} has been invited!`);
        setShowAddTeacherModal(false);
        loadOrganizationData();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error adding teacher:', error);
      alert('Failed to add teacher. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkImport = async (csvData, type, options = {}) => {
    // Skip permission check in development
    if (process.env.NODE_ENV === 'production' && !hasOrgAdminPermission('bulk_import')) {
      alert('You do not have permission to perform bulk imports.');
      return;
    }

    setActionLoading(true);
    try {
      let result;
      
      if (type === 'students') {
        // For students, we need a class ID - use the first available class or show error
        const firstClass = organizationData.classes[0];
        if (!firstClass) {
          alert('No classes found. Please create a class first before importing students.');
          return;
        }
        
        result = await BulkOperationsService.importStudents(
          organizationId, 
          firstClass.id, 
          csvData, 
          options
        );
      } else if (type === 'teachers') {
        result = await BulkOperationsService.importTeachers(
          organizationId, 
          csvData, 
          { ...options, invitedBy: user.uid }
        );
      }
      
      if (result.success) {
        alert(`Successfully imported ${result.summary.successful} ${type}! ${result.summary.failed > 0 ? `${result.summary.failed} failed.` : ''}`);
        setShowBulkImportModal(false);
        loadOrganizationData();
      } else {
        alert(`Import failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error during bulk import:', error);
      alert('Import failed. Please check your CSV format and try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportData = (type) => {
    try {
      let result;
      const data = organizationData[type] || [];
      
      if (type === 'students') {
        result = BulkOperationsService.exportStudents(data);
      } else if (type === 'teachers') {
        result = BulkOperationsService.exportTeachers(data);
      } else if (type === 'classes') {
        result = BulkOperationsService.exportClasses(data);
      }
      
      if (result.success) {
        BulkOperationsService.downloadCSV(result.csv, result.filename);
      } else {
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Export failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="organization-admin-loading">
        <div className="loading-spinner">Loading organization data...</div>
      </div>
    );
  }

  // Show access denied for non-admin users (only in production)
  if (userProfile && !isAdmin() && process.env.NODE_ENV === 'production') {
    return (
      <div className="organization-admin">
        <div className="admin-header">
          <div style={{ textAlign: 'center' }}>
            <h1>🚫 Access Denied</h1>
            <p>Organization Admin access requires administrator role.</p>
            <p>Current role: <strong>{userProfile.accountType || 'Unknown'}</strong></p>
            <button 
              className="btn-primary"
              onClick={() => window.location.href = '/dashboard'}
              style={{ marginTop: '1rem' }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="organization-admin">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage teachers, students, and classes across your organization</p>
        
        {/* Development Mode Notice */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            background: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            margin: '1rem 0',
            color: '#856404'
          }}>
            <strong>🧪 Development Mode:</strong> Role restrictions disabled for testing. 
            In production, this requires admin role.
          </div>
        )}
        
        <div className="admin-actions">
          <button 
            className="btn-secondary"
            onClick={() => handleExportData('students')}
          >
            📊 Export Data
          </button>
          <button 
            className="btn-primary"
            onClick={() => setShowBulkImportModal(true)}
          >
            📁 Bulk Import
          </button>
        </div>
      </div>

      {/* Organization Stats Overview */}
      <div className="org-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <strong>{organizationData.stats.totalStudents || 0}</strong>
            <span>Total Students</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-info">
            <strong>{organizationData.teachers.length}</strong>
            <span>Active Teachers</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-info">
            <strong>{organizationData.stats.totalClasses || 0}</strong>
            <span>Total Classes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <strong>{organizationData.stats.averageScore || 0}%</strong>
            <span>Avg Performance</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <strong>{organizationData.stats.totalAssignments || 0}</strong>
            <span>Total Assignments</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <strong>{organizationData.stats.engagementRate || 0}%</strong>
            <span>Engagement Rate</span>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'teachers' ? 'active' : ''}`}
          onClick={() => setActiveTab('teachers')}
        >
          👨‍🏫 Teachers ({organizationData.teachers.length})
        </button>
        <button 
          className={`tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          👥 Students ({organizationData.stats.totalStudents || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'classes' ? 'active' : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          🎓 Classes ({organizationData.stats.totalClasses || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      <div className="admin-tab-content">
        {activeTab === 'overview' && (
          <OverviewTab organizationData={organizationData} />
        )}
        
        {activeTab === 'teachers' && (
          <TeachersTab 
            teachers={organizationData.teachers}
            onAddTeacher={() => setShowAddTeacherModal(true)}
            onRefresh={loadOrganizationData}
          />
        )}
        
        {activeTab === 'students' && (
          <AdminStudentsTab 
            students={organizationData.students}
            classes={organizationData.classes}
            onRefresh={loadOrganizationData}
          />
        )}
        
        {activeTab === 'classes' && (
          <AdminClassesTab 
            classes={organizationData.classes}
            teachers={organizationData.teachers}
            onRefresh={loadOrganizationData}
          />
        )}
        
        {activeTab === 'analytics' && (
          <AnalyticsTab organizationData={organizationData} />
        )}
      </div>

      {/* Modals */}
      {showAddTeacherModal && (
        <AddTeacherModal
          onClose={() => setShowAddTeacherModal(false)}
          onSubmit={handleAddTeacher}
          loading={actionLoading}
        />
      )}

      {showBulkImportModal && (
        <BulkImportModal
          onClose={() => setShowBulkImportModal(false)}
          onSubmit={handleBulkImport}
          importType={importType}
          setImportType={setImportType}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ organizationData }) => {
  const recentActivity = [
    { type: 'teacher_added', message: 'Dr. Sarah Johnson joined the organization', time: '2 hours ago' },
    { type: 'class_created', message: 'New class "Advanced Physics" was created', time: '5 hours ago' },
    { type: 'student_enrolled', message: '15 students enrolled in Mathematics courses', time: '1 day ago' },
    { type: 'assignment_completed', message: 'Chemistry Quiz completed by 28 students', time: '2 days ago' }
  ];

  return (
    <div className="overview-tab">
      <div className="overview-grid">
        <div className="overview-section">
          <h3>📈 Performance Trends</h3>
          <div className="trend-cards">
            <div className="trend-card positive">
              <span className="trend-value">+12%</span>
              <span className="trend-label">Student Engagement</span>
            </div>
            <div className="trend-card positive">
              <span className="trend-value">+8%</span>
              <span className="trend-label">Average Scores</span>
            </div>
            <div className="trend-card neutral">
              <span className="trend-value">+2%</span>
              <span className="trend-label">Assignment Completion</span>
            </div>
          </div>
        </div>

        <div className="overview-section">
          <h3>🎯 Quick Actions</h3>
          <div className="quick-actions">
            <button className="quick-action-btn">
              <span className="action-icon">👨‍🏫</span>
              <span>Invite Teacher</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">📁</span>
              <span>Import Students</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">🎓</span>
              <span>Create Class</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">📊</span>
              <span>View Reports</span>
            </button>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>📋 Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className={`activity-icon ${activity.type}`}>
                {activity.type === 'teacher_added' && '👨‍🏫'}
                {activity.type === 'class_created' && '🎓'}
                {activity.type === 'student_enrolled' && '👥'}
                {activity.type === 'assignment_completed' && '📝'}
              </div>
              <div className="activity-content">
                <p className="activity-message">{activity.message}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Teachers Tab Component
const TeachersTab = ({ teachers, onAddTeacher, onRefresh }) => {
  const formatLastActive = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Active now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="teachers-tab">
      <div className="tab-header">
        <h3>Teacher Management</h3>
        <button className="btn-primary" onClick={onAddTeacher}>
          + Invite Teacher
        </button>
      </div>

      <div className="teachers-table">
        <div className="table-header">
          <div className="header-cell">Teacher</div>
          <div className="header-cell">Classes</div>
          <div className="header-cell">Students</div>
          <div className="header-cell">Avg Score</div>
          <div className="header-cell">Last Active</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Actions</div>
        </div>
        
        {teachers.map(teacher => (
          <div key={teacher.id} className="table-row">
            <div className="table-cell">
              <div className="teacher-info">
                <div className="teacher-name">{teacher.displayName}</div>
                <div className="teacher-email">{teacher.email}</div>
              </div>
            </div>
            <div className="table-cell">
              <div className="teacher-classes">
                {teacher.classes.map((className, index) => (
                  <span key={index} className="class-tag">{className}</span>
                ))}
              </div>
            </div>
            <div className="table-cell">
              <strong>{teacher.stats.totalStudents}</strong>
            </div>
            <div className="table-cell">
              <span className={`score ${teacher.stats.avgScore >= 85 ? 'good' : 'average'}`}>
                {teacher.stats.avgScore}%
              </span>
            </div>
            <div className="table-cell">
              <span className="last-active">{formatLastActive(teacher.lastActive)}</span>
            </div>
            <div className="table-cell">
              <span className={`status-badge ${teacher.status}`}>
                {teacher.status}
              </span>
            </div>
            <div className="table-cell">
              <button className="btn-text">Edit</button>
              <button className="btn-text danger">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Admin Students Tab Component (different from regular student directory)
const AdminStudentsTab = ({ students, classes, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedClass === 'all') return matchesSearch;
    return matchesSearch && student.classes.some(cls => cls.id === selectedClass);
  });

  return (
    <div className="admin-students-tab">
      <div className="tab-header">
        <h3>Student Management</h3>
        <div className="student-controls">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="class-filter"
          >
            <option value="all">All Classes</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="students-grid">
        {filteredStudents.map(student => (
          <div key={student.id} className="student-card">
            <div className="student-header">
              <div className="student-avatar">
                {student.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="student-info">
                <h4>{student.displayName}</h4>
                <p>{student.email}</p>
              </div>
            </div>
            
            <div className="student-stats">
              <div className="stat">
                <strong>{student.classes.length}</strong>
                <span>Classes</span>
              </div>
              <div className="stat">
                <strong>{student.stats.completedAssignments}</strong>
                <span>Completed</span>
              </div>
              <div className="stat">
                <strong>{student.stats.averageScore}%</strong>
                <span>Avg Score</span>
              </div>
            </div>

            <div className="student-classes">
              {student.classes.slice(0, 3).map((cls, index) => (
                <span key={index} className="class-tag">{cls.name}</span>
              ))}
              {student.classes.length > 3 && (
                <span className="class-tag more">+{student.classes.length - 3} more</span>
              )}
            </div>

            <div className="student-actions">
              <button className="btn-text">View Progress</button>
              <button className="btn-text">Manage Classes</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Admin Classes Tab Component
const AdminClassesTab = ({ classes, teachers, onRefresh }) => {
  return (
    <div className="admin-classes-tab">
      <div className="tab-header">
        <h3>Class Management</h3>
        <button className="btn-primary">
          + Create Class
        </button>
      </div>

      <div className="classes-grid">
        {classes.map(cls => (
          <div key={cls.id} className="admin-class-card">
            <div className="class-header">
              <h4>{cls.name}</h4>
              <span className="class-subject">{cls.subject}</span>
            </div>
            
            <div className="class-teacher">
              <strong>Teacher:</strong> {cls.teacherId ? 
                teachers.find(t => t.id === cls.teacherId)?.displayName || 'Unknown' : 
                'Unassigned'
              }
            </div>

            <div className="class-stats-grid">
              <div className="stat">
                <strong>{cls.stats.totalStudents}</strong>
                <span>Students</span>
              </div>
              <div className="stat">
                <strong>{cls.stats.totalAssignments}</strong>
                <span>Assignments</span>
              </div>
              <div className="stat">
                <strong>{cls.stats.averageScore}%</strong>
                <span>Avg Score</span>
              </div>
            </div>

            <div className="class-actions">
              <button className="btn-text">View Details</button>
              <button className="btn-text">Edit</button>
              <button className="btn-text danger">Archive</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ organizationData }) => {
  const analytics = organizationData.analytics || {};
  
  // Calculate subject performance from real class data
  const subjectPerformance = organizationData.classes.reduce((acc, cls) => {
    const subject = cls.subject || 'Other';
    if (!acc[subject]) {
      acc[subject] = {
        subject,
        totalScore: 0,
        totalStudents: 0,
        classCount: 0,
        avgScore: 0
      };
    }
    
    acc[subject].totalScore += (cls.stats?.averageScore || 0) * (cls.students?.length || 0);
    acc[subject].totalStudents += cls.students?.length || 0;
    acc[subject].classCount += 1;
    
    if (acc[subject].totalStudents > 0) {
      acc[subject].avgScore = Math.round(acc[subject].totalScore / acc[subject].totalStudents);
    }
    
    return acc;
  }, {});

  const subjectPerformanceArray = Object.values(subjectPerformance);

  // Teacher performance from real data
  const teacherPerformance = organizationData.teachers.map(teacher => ({
    name: teacher.displayName,
    avgScore: teacher.stats?.avgScore || 0,
    students: teacher.stats?.totalStudents || 0,
    classes: teacher.stats?.totalClasses || 0,
    status: teacher.status
  }));

  return (
    <div className="analytics-tab">
      <h3>📊 Organization Analytics</h3>
      
      {/* Overview Cards */}
      <div className="analytics-overview">
        <div className="analytics-card">
          <h4>Overall Performance</h4>
          <div className="big-stat">{analytics.performance?.averageScore || 0}%</div>
          <div className="stat-label">Average Score</div>
        </div>
        
        <div className="analytics-card">
          <h4>Engagement</h4>
          <div className="big-stat">{analytics.overview?.engagementRate || 0}%</div>
          <div className="stat-label">Active Students</div>
        </div>
        
        <div className="analytics-card">
          <h4>Completion Rate</h4>
          <div className="big-stat">{analytics.performance?.completionRate || 0}%</div>
          <div className="stat-label">Assignments Completed</div>
        </div>
        
        <div className="analytics-card">
          <h4>Growth</h4>
          <div className="big-stat">+{analytics.trends?.monthlyGrowth || 0}%</div>
          <div className="stat-label">Monthly Growth</div>
        </div>
      </div>
      
      <div className="analytics-grid">
        <div className="analytics-section">
          <h4>Performance by Subject</h4>
          <div className="subject-performance">
            {subjectPerformanceArray.length > 0 ? (
              subjectPerformanceArray.map((subject, index) => (
                <div key={index} className="subject-card">
                  <div className="subject-header">
                    <span className="subject-name">{subject.subject}</span>
                    <span className="trend positive">
                      {subject.classCount} class{subject.classCount !== 1 ? 'es' : ''}
                    </span>
                  </div>
                  <div className="subject-stats">
                    <div className="stat">
                      <strong>{subject.avgScore}%</strong>
                      <span>Avg Score</span>
                    </div>
                    <div className="stat">
                      <strong>{subject.totalStudents}</strong>
                      <span>Students</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No subject data available</div>
            )}
          </div>
        </div>

        <div className="analytics-section">
          <h4>Teacher Performance</h4>
          <div className="teacher-performance">
            {teacherPerformance.length > 0 ? (
              teacherPerformance.map((teacher, index) => (
                <div key={index} className="teacher-performance-card">
                  <div className="teacher-info">
                    <strong>{teacher.name}</strong>
                    <span className={`status ${teacher.status}`}>{teacher.status}</span>
                  </div>
                  <div className="teacher-stats">
                    <div className="stat">
                      <strong>{teacher.avgScore}%</strong>
                      <span>Avg Score</span>
                    </div>
                    <div className="stat">
                      <strong>{teacher.students}</strong>
                      <span>Students</span>
                    </div>
                    <div className="stat">
                      <strong>{teacher.classes}</strong>
                      <span>Classes</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No teacher data available</div>
            )}
          </div>
        </div>

        <div className="analytics-section full-width">
          <h4>Subject Distribution</h4>
          <div className="subject-distribution">
            {Object.entries(analytics.subjects || {}).length > 0 ? (
              Object.entries(analytics.subjects).map(([subject, count]) => (
                <div key={subject} className="distribution-bar">
                  <span className="subject-label">{subject}</span>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${(count / Math.max(...Object.values(analytics.subjects))) * 100}%` }}
                    ></div>
                    <span className="bar-label">{count} classes</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No class distribution data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Teacher Modal Component
const AddTeacherModal = ({ onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    permissions: {
      canCreateClasses: true,
      canManageStudents: true,
      canViewAnalytics: false
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.displayName.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={(e) => {
      // Close modal if clicking on the overlay (not the modal content)
      if (e.target.className === 'modal-overlay') {
        onClose();
      }
    }}>
      <div className="modal">
        <div className="modal-header">
          <h2>Invite Teacher</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="teacherEmail">Email Address *</label>
            <input
              type="email"
              id="teacherEmail"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="teacher@school.edu"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="teacherName">Full Name *</label>
            <input
              type="text"
              id="teacherName"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="Dr. Jane Smith"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Permissions</label>
            <div className="permissions-list">
              <label className="permission-item">
                <input
                  type="checkbox"
                  checked={formData.permissions.canCreateClasses}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    permissions: { ...prev.permissions, canCreateClasses: e.target.checked }
                  }))}
                />
                Can create and manage classes
              </label>
              <label className="permission-item">
                <input
                  type="checkbox"
                  checked={formData.permissions.canManageStudents}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    permissions: { ...prev.permissions, canManageStudents: e.target.checked }
                  }))}
                />
                Can add and manage students
              </label>
              <label className="permission-item">
                <input
                  type="checkbox"
                  checked={formData.permissions.canViewAnalytics}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    permissions: { ...prev.permissions, canViewAnalytics: e.target.checked }
                  }))}
                />
                Can view organization analytics
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Bulk Import Modal Component
const BulkImportModal = ({ onClose, onSubmit, importType, setImportType, loading }) => {
  const [csvData, setCsvData] = useState('');
  const [previewData, setPreviewData] = useState([]);

  const sampleData = {
    students: `name,email,class
John Smith,john.smith@school.edu,Math 101
Jane Doe,jane.doe@school.edu,Science
Mike Johnson,mike.johnson@school.edu,"Math 101,Science"`,
    teachers: `name,email,department
Dr. Sarah Wilson,sarah.wilson@school.edu,Mathematics
Prof. Robert Chen,robert.chen@school.edu,Science
Ms. Lisa Brown,lisa.brown@school.edu,English`
  };

  const handleCsvChange = (value) => {
    setCsvData(value);
    
    // Parse CSV for preview
    if (value.trim()) {
      const lines = value.trim().split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
          return obj;
        }, {});
      });
      setPreviewData(data);
    } else {
      setPreviewData([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!csvData.trim()) {
      alert('Please enter CSV data');
      return;
    }
    onSubmit(previewData, importType);
  };

  return (
    <div className="modal-overlay" onClick={(e) => {
      // Close modal if clicking on the overlay (not the modal content)
      if (e.target.className === 'modal-overlay') {
        onClose();
      }
    }}>
      <div className="modal large">
        <div className="modal-header">
          <h2>Bulk Import {importType === 'students' ? 'Students' : 'Teachers'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Import Type</label>
            <div className="import-type-selector">
              <button
                type="button"
                className={`type-btn ${importType === 'students' ? 'active' : ''}`}
                onClick={() => setImportType('students')}
              >
                👥 Students
              </button>
              <button
                type="button"
                className={`type-btn ${importType === 'teachers' ? 'active' : ''}`}
                onClick={() => setImportType('teachers')}
              >
                👨‍🏫 Teachers
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>CSV Data</label>
            <textarea
              value={csvData}
              onChange={(e) => handleCsvChange(e.target.value)}
              placeholder={`Paste your CSV data here or use the sample format below...\n\n${sampleData[importType]}`}
              className="csv-input"
              rows={8}
            />
          </div>

          <div className="form-group">
            <label>Sample Format</label>
            <pre className="sample-format">{sampleData[importType]}</pre>
          </div>

          {previewData.length > 0 && (
            <div className="form-group">
              <label>Preview ({previewData.length} records)</label>
              <div className="preview-table">
                <div className="preview-header">
                  {Object.keys(previewData[0]).map(key => (
                    <div key={key} className="preview-cell header">{key}</div>
                  ))}
                </div>
                {previewData.slice(0, 5).map((row, index) => (
                  <div key={index} className="preview-row">
                    {Object.values(row).map((value, i) => (
                      <div key={i} className="preview-cell">{value}</div>
                    ))}
                  </div>
                ))}
                {previewData.length > 5 && (
                  <div className="preview-more">
                    ...and {previewData.length - 5} more records
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={previewData.length === 0 || loading}>
              {loading ? 'Importing...' : `Import ${previewData.length} ${importType}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationAdmin;
