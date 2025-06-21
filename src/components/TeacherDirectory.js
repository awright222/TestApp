import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { OrganizationService } from '../services/OrganizationService';
import { ClassService } from '../services/ClassService';
import './TeacherDirectory.css';

const TeacherDirectory = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignModalClasses, setAssignModalClasses] = useState([]);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    status: 'active'
  });

  useEffect(() => {
    loadTeachers();
    loadClasses();
  }, []);

  useEffect(() => {
    filterAndSearchTeachers();
  }, [teachers, searchTerm, filterStatus]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const teachersData = await OrganizationService.getTeachers();
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const classesData = await ClassService.getClasses();
      setClasses(classesData);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const filterAndSearchTeachers = () => {
    let filtered = teachers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.department && teacher.department.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(teacher => teacher.status === filterStatus);
    }

    setFilteredTeachers(filtered);
  };

  const handleSelectTeacher = (teacherId) => {
    setSelectedTeachers(prev =>
      prev.includes(teacherId)
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTeachers.length === filteredTeachers.length) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(filteredTeachers.map(teacher => teacher.id));
    }
  };

  const handleAddTeacher = async () => {
    try {
      await OrganizationService.addTeacher(newTeacher);
      setNewTeacher({ name: '', email: '', phone: '', department: '', status: 'active' });
      setShowAddModal(false);
      await loadTeachers();
    } catch (error) {
      console.error('Error adding teacher:', error);
      alert('Error adding teacher. Please try again.');
    }
  };

  const handleEditTeacher = async () => {
    try {
      await OrganizationService.updateTeacher(editingTeacher.id, editingTeacher);
      setShowEditModal(false);
      setEditingTeacher(null);
      await loadTeachers();
    } catch (error) {
      console.error('Error updating teacher:', error);
      alert('Error updating teacher. Please try again.');
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await OrganizationService.deleteTeacher(teacherId);
        await loadTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
        alert('Error deleting teacher. Please try again.');
      }
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    try {
      await Promise.all(
        selectedTeachers.map(teacherId =>
          OrganizationService.updateTeacher(teacherId, { status })
        )
      );
      setSelectedTeachers([]);
      await loadTeachers();
    } catch (error) {
      console.error('Error updating teacher status:', error);
      alert('Error updating teacher status. Please try again.');
    }
  };

  const openEditModal = (teacher) => {
    setEditingTeacher({ ...teacher });
    setShowEditModal(true);
  };

  const openAssignModal = () => {
    setAssignModalClasses(classes.map(cls => ({ ...cls, assigned: false })));
    setShowAssignModal(true);
  };

  const handleAssignToClasses = async () => {
    try {
      const assignedClasses = assignModalClasses.filter(cls => cls.assigned);
      for (const cls of assignedClasses) {
        for (const teacherId of selectedTeachers) {
          await ClassService.assignTeacher(cls.id, teacherId);
        }
      }
      setSelectedTeachers([]);
      setShowAssignModal(false);
      alert(`Successfully assigned ${selectedTeachers.length} teacher(s) to ${assignedClasses.length} class(es)`);
    } catch (error) {
      console.error('Error assigning teachers to classes:', error);
      alert('Error assigning teachers. Please try again.');
    }
  };

  const getTeacherStats = () => {
    const total = teachers.length;
    const active = teachers.filter(t => t.status === 'active').length;
    const inactive = teachers.filter(t => t.status === 'inactive').length;
    return { total, active, inactive };
  };

  const stats = getTeacherStats();

  if (loading) {
    return (
      <div className="teacher-directory">
        <div className="loading">Loading teachers...</div>
      </div>
    );
  }

  return (
    <div className="teacher-directory">
      <div className="teacher-directory-header">
        <div className="header-content">
          <h1>Teacher Directory</h1>
          <p>Manage teachers and their class assignments</p>
        </div>
        <button 
          className="add-teacher-btn"
          onClick={() => setShowAddModal(true)}
        >
          Add Teacher
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Teachers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.inactive}</div>
          <div className="stat-label">Inactive</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search teachers by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTeachers.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedTeachers.length} teacher(s) selected</span>
          <div className="bulk-buttons">
            <button onClick={() => handleBulkStatusUpdate('active')}>
              Mark Active
            </button>
            <button onClick={() => handleBulkStatusUpdate('inactive')}>
              Mark Inactive
            </button>
            <button onClick={openAssignModal}>
              Assign to Classes
            </button>
          </div>
        </div>
      )}

      {/* Teachers Table */}
      <div className="teachers-table-container">
        <table className="teachers-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedTeachers.length === filteredTeachers.length && filteredTeachers.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Classes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map(teacher => (
              <tr key={teacher.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedTeachers.includes(teacher.id)}
                    onChange={() => handleSelectTeacher(teacher.id)}
                  />
                </td>
                <td>{teacher.name}</td>
                <td>{teacher.email}</td>
                <td>{teacher.department || 'N/A'}</td>
                <td>{teacher.phone || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${teacher.status}`}>
                    {teacher.status}
                  </span>
                </td>
                <td>
                  {teacher.assignedClasses?.length || 0} classes
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => openEditModal(teacher)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteTeacher(teacher.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTeachers.length === 0 && (
          <div className="no-teachers">
            <p>No teachers found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Teacher</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={newTeacher.phone}
                  onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={newTeacher.department}
                  onChange={(e) => setNewTeacher({...newTeacher, department: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={newTeacher.status}
                  onChange={(e) => setNewTeacher({...newTeacher, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={handleAddTeacher}
                disabled={!newTeacher.name || !newTeacher.email}
              >
                Add Teacher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {showEditModal && editingTeacher && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Teacher</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({...editingTeacher, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={editingTeacher.email}
                  onChange={(e) => setEditingTeacher({...editingTeacher, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={editingTeacher.phone || ''}
                  onChange={(e) => setEditingTeacher({...editingTeacher, phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={editingTeacher.department || ''}
                  onChange={(e) => setEditingTeacher({...editingTeacher, department: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingTeacher.status}
                  onChange={(e) => setEditingTeacher({...editingTeacher, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={handleEditTeacher}
                disabled={!editingTeacher.name || !editingTeacher.email}
              >
                Update Teacher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign to Classes Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Teachers to Classes</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAssignModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Select classes to assign the selected teachers to:</p>
              <div className="class-list">
                {assignModalClasses.map(cls => (
                  <div key={cls.id} className="class-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={cls.assigned}
                        onChange={(e) => {
                          setAssignModalClasses(prev =>
                            prev.map(c =>
                              c.id === cls.id ? { ...c, assigned: e.target.checked } : c
                            )
                          );
                        }}
                      />
                      {cls.name} ({cls.subject})
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={handleAssignToClasses}
              >
                Assign Teachers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDirectory;
