import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc,
  query,
  where,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase/config';

export class OrganizationService {
  // Get all students in an organization (for teacher student directory)
  static async getOrganizationStudents(organizationId) {
    try {
      // In the current implementation, we'll simulate this by getting
      // all students from all classes in the organization
      
      // First, get all classes for the organization
      const classesRef = collection(db, 'classes');
      const classesQuery = query(classesRef, where('organizationId', '==', organizationId));
      const classesSnapshot = await getDocs(classesQuery);
      
      // Collect all unique student IDs
      const studentIds = new Set();
      const studentClasses = new Map(); // Track which classes each student is in
      
      classesSnapshot.docs.forEach(doc => {
        const classData = doc.data();
        classData.students.forEach(studentId => {
          studentIds.add(studentId);
          if (!studentClasses.has(studentId)) {
            studentClasses.set(studentId, []);
          }
          studentClasses.get(studentId).push({
            id: doc.id,
            name: classData.name,
            subject: classData.subject
          });
        });
      });

      // For now, return mock student data
      // In a real implementation, you'd query the users collection
      const students = Array.from(studentIds).map(studentId => ({
        id: studentId,
        email: studentId.includes('@') ? studentId : `${studentId}@school.edu`,
        displayName: this.extractNameFromId(studentId),
        classes: studentClasses.get(studentId) || [],
        stats: {
          totalAssignments: Math.floor(Math.random() * 20),
          completedAssignments: Math.floor(Math.random() * 15),
          averageScore: Math.floor(Math.random() * 40) + 60
        },
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      return { success: true, students };
    } catch (error) {
      console.error('Error getting organization students:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all classes in an organization
  static async getOrganizationClasses(organizationId) {
    try {
      const classesRef = collection(db, 'classes');
      const classesQuery = query(classesRef, where('organizationId', '==', organizationId));
      const snapshot = await getDocs(classesQuery);
      
      const classes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { success: true, classes };
    } catch (error) {
      console.error('Error getting organization classes:', error);
      return { success: false, error: error.message };
    }
  }

  // Add student to multiple classes
  static async addStudentToMultipleClasses(studentEmail, classIds) {
    try {
      const results = [];
      
      for (const classId of classIds) {
        const result = await ClassService.addStudentByEmail(classId, studentEmail);
        results.push({ classId, ...result });
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      return {
        success: successCount > 0,
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount
        }
      };
    } catch (error) {
      console.error('Error adding student to multiple classes:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove student from organization (removes from all classes)
  static async removeStudentFromOrganization(organizationId, studentId) {
    try {
      // Get all classes the student is in
      const classesResult = await this.getOrganizationClasses(organizationId);
      if (!classesResult.success) {
        return classesResult;
      }

      const results = [];
      for (const classData of classesResult.classes) {
        if (classData.students.includes(studentId)) {
          // Remove student from this class
          const classRef = doc(db, 'classes', classData.id);
          await updateDoc(classRef, {
            students: arrayRemove(studentId),
            updatedAt: new Date().toISOString()
          });
          results.push({ classId: classData.id, success: true });
        }
      }

      return {
        success: true,
        message: `Student removed from ${results.length} classes`,
        results
      };
    } catch (error) {
      console.error('Error removing student from organization:', error);
      return { success: false, error: error.message };
    }
  }

  // Move student between classes
  static async moveStudentBetweenClasses(studentId, fromClassId, toClassId) {
    try {
      // Remove from old class
      const fromClassRef = doc(db, 'classes', fromClassId);
      await updateDoc(fromClassRef, {
        students: arrayRemove(studentId),
        updatedAt: new Date().toISOString()
      });

      // Add to new class
      const toClassRef = doc(db, 'classes', toClassId);
      await updateDoc(toClassRef, {
        students: arrayUnion(studentId),
        updatedAt: new Date().toISOString()
      });

      return {
        success: true,
        message: `Student moved from ${fromClassId} to ${toClassId}`
      };
    } catch (error) {
      console.error('Error moving student between classes:', error);
      return { success: false, error: error.message };
    }
  }

  // Get organization statistics
  static async getOrganizationStats(organizationId) {
    try {
      const [classesResult, studentsResult] = await Promise.all([
        this.getOrganizationClasses(organizationId),
        this.getOrganizationStudents(organizationId)
      ]);

      if (!classesResult.success || !studentsResult.success) {
        throw new Error('Failed to fetch organization data');
      }

      const classes = classesResult.classes;
      const students = studentsResult.students;

      // Calculate aggregate statistics
      const totalAssignments = classes.reduce((sum, cls) => sum + (cls.assignedTests?.length || 0), 0);
      const totalStudents = students.length;
      const averageScore = students.length > 0 
        ? Math.round(students.reduce((sum, student) => sum + student.stats.averageScore, 0) / students.length)
        : 0;

      const activeStudents = students.filter(student => {
        const lastActive = new Date(student.lastActive);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return lastActive > weekAgo;
      }).length;

      return {
        success: true,
        stats: {
          totalClasses: classes.length,
          totalStudents,
          totalAssignments,
          averageScore,
          activeStudents,
          engagementRate: totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0
        }
      };
    } catch (error) {
      console.error('Error getting organization stats:', error);
      return { success: false, error: error.message };
    }
  }

  // Utility function to extract name from student ID/email
  static extractNameFromId(studentId) {
    if (studentId.includes('@')) {
      const localPart = studentId.split('@')[0];
      return localPart.split('.').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ');
    }
    
    // Handle pending_ prefixed IDs
    if (studentId.startsWith('pending_')) {
      const emailPart = studentId.replace('pending_', '').replace(/_/g, '.');
      return this.extractNameFromId(emailPart + '@school.edu');
    }
    
    return studentId.replace(/_/g, ' ');
  }

  // Bulk import students from CSV data
  static async bulkImportStudents(organizationId, classId, studentData) {
    try {
      const results = [];
      
      for (const student of studentData) {
        const result = await ClassService.addStudentByEmail(classId, student.email);
        results.push({
          email: student.email,
          name: student.name,
          ...result
        });
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      return {
        success: successCount > 0,
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount
        }
      };
    } catch (error) {
      console.error('Error bulk importing students:', error);
      return { success: false, error: error.message };
    }
  }
}

// Import ClassService to avoid circular dependency issues
import { ClassService } from './ClassService';
