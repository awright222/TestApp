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

export class ClassService {
  // Create a new class
  static async createClass(teacherId, classData) {
    try {
      const classId = `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newClass = {
        id: classId,
        name: classData.name,
        description: classData.description || '',
        subject: classData.subject || '',
        teacherId: teacherId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: {
          allowSelfEnrollment: classData.allowSelfEnrollment || false,
          enrollmentCode: classData.allowSelfEnrollment ? this.generateEnrollmentCode() : null,
          isArchived: false,
          defaultTestSettings: {
            timeLimit: 30,
            shuffleQuestions: false,
            showCorrectAnswers: true,
            allowRetakes: false
          }
        },
        students: [], // Array of student user IDs
        assignedTests: [], // Array of test assignments
        stats: {
          totalStudents: 0,
          totalAssignments: 0,
          completedAssignments: 0,
          averageScore: 0
        },
        // Store initial student emails for processing
        initialStudentEmails: classData.initialStudents || []
      };

      await setDoc(doc(db, 'classes', classId), newClass);
      
      // If initial students were provided, add them to the class
      if (classData.initialStudents && classData.initialStudents.length > 0) {
        for (const email of classData.initialStudents) {
          try {
            await this.addStudentByEmail(classId, email);
          } catch (error) {
            console.warn(`Could not add student ${email} to class:`, error.message);
            // Continue adding other students even if one fails
          }
        }
      }
      
      return { success: true, classId, class: newClass };
    } catch (error) {
      console.error('Error creating class:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all classes for a teacher
  static async getTeacherClasses(teacherId) {
    try {
      // Simple query to avoid any composite index requirements
      const q = query(
        collection(db, 'classes'),
        where('teacherId', '==', teacherId)
      );
      
      const snapshot = await getDocs(q);
      const classes = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        // Filter out archived classes and sort in JavaScript
        .filter(classData => classData.settings?.isArchived !== true)
        .sort((a, b) => {
          // Sort by createdAt descending (newest first)
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return dateB - dateA;
        });
      
      return { success: true, classes };
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
      return { success: false, error: error.message, classes: [] };
    }
  }

  // Get classes where user is a student
  static async getStudentClasses(studentId) {
    try {
      // Simple query to avoid any composite index requirements
      const q = query(
        collection(db, 'classes'),
        where('students', 'array-contains', studentId)
      );
      
      const snapshot = await getDocs(q);
      const classes = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        // Filter out archived classes and sort in JavaScript
        .filter(classData => classData.settings?.isArchived !== true)
        .sort((a, b) => {
          // Sort by createdAt descending (newest first)
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return dateB - dateA;
        });
      
      return { success: true, classes };
    } catch (error) {
      console.error('Error fetching student classes:', error);
      return { success: false, error: error.message, classes: [] };
    }
  }

  // Get a specific class by ID
  static async getClass(classId) {
    try {
      const docRef = doc(db, 'classes', classId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, class: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: 'Class not found' };
      }
    } catch (error) {
      console.error('Error fetching class:', error);
      return { success: false, error: error.message };
    }
  }

  // Update class details
  static async updateClass(classId, updates) {
    try {
      const docRef = doc(db, 'classes', classId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating class:', error);
      return { success: false, error: error.message };
    }
  }

  // Add student to class
  static async addStudentToClass(classId, studentId, studentEmail) {
    try {
      const docRef = doc(db, 'classes', classId);
      
      // Add student to class
      await updateDoc(docRef, {
        students: arrayUnion(studentId),
        updatedAt: new Date().toISOString()
      });

      // Update stats
      await this.updateClassStats(classId);

      // Create enrollment record
      await this.createEnrollmentRecord(classId, studentId, studentEmail);
      
      return { success: true };
    } catch (error) {
      console.error('Error adding student to class:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove student from class
  static async removeStudentFromClass(classId, studentId) {
    try {
      const docRef = doc(db, 'classes', classId);
      
      await updateDoc(docRef, {
        students: arrayRemove(studentId),
        updatedAt: new Date().toISOString()
      });

      // Update stats
      await this.updateClassStats(classId);
      
      return { success: true };
    } catch (error) {
      console.error('Error removing student from class:', error);
      return { success: false, error: error.message };
    }
  }

  // Join class with enrollment code
  static async joinClassWithCode(enrollmentCode, studentId, studentEmail) {
    try {
      // Simplified query to avoid composite index requirement
      const q = query(
        collection(db, 'classes'),
        where('settings.enrollmentCode', '==', enrollmentCode),
        where('settings.allowSelfEnrollment', '==', true)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { success: false, error: 'Invalid enrollment code' };
      }
      
      // Filter out archived classes and check if any valid classes remain
      const validClasses = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(classData => classData.settings?.isArchived !== true);
      
      if (validClasses.length === 0) {
        return { success: false, error: 'Invalid enrollment code' };
      }
      
      const classData = validClasses[0]; // Take the first valid class
      
      // Check if student is already enrolled
      if (classData.students.includes(studentId)) {
        return { success: false, error: 'Already enrolled in this class' };
      }
      
      // Add student to class
      const result = await this.addStudentToClass(classData.id, studentId, studentEmail);
      
      if (result.success) {
        return { 
          success: true, 
          classId: classData.id,
          className: classData.name 
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error joining class with code:', error);
      return { success: false, error: error.message };
    }
  }

  // Assign test to class
  static async assignTestToClass(classId, testId, assignmentData) {
    try {
      const assignmentId = `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const assignment = {
        id: assignmentId,
        testId: testId,
        testTitle: assignmentData.testTitle,
        assignedAt: new Date().toISOString(),
        dueDate: assignmentData.dueDate || null,
        instructions: assignmentData.instructions || '',
        settings: {
          timeLimit: assignmentData.timeLimit || null,
          allowRetakes: assignmentData.allowRetakes || false,
          shuffleQuestions: assignmentData.shuffleQuestions || false,
          showCorrectAnswers: assignmentData.showCorrectAnswers || true
        },
        status: 'active', // active, completed, archived
        submissions: [] // Will track student submissions
      };

      // Add assignment to class
      const docRef = doc(db, 'classes', classId);
      await updateDoc(docRef, {
        assignedTests: arrayUnion(assignment),
        updatedAt: new Date().toISOString()
      });

      // Update class stats
      await this.updateClassStats(classId);
      
      return { success: true, assignmentId };
    } catch (error) {
      console.error('Error assigning test to class:', error);
      return { success: false, error: error.message };
    }
  }

  // Get class assignments for a student
  static async getStudentAssignments(studentId) {
    try {
      // Get all classes where student is enrolled
      const studentClassesResult = await this.getStudentClasses(studentId);
      
      if (!studentClassesResult.success) {
        return studentClassesResult;
      }
      
      const assignments = [];
      
      for (const classData of studentClassesResult.classes) {
        for (const assignment of classData.assignedTests || []) {
          assignments.push({
            ...assignment,
            className: classData.name,
            classId: classData.id,
            teacherName: classData.teacherName || 'Teacher'
          });
        }
      }
      
      // Sort by due date and assigned date
      assignments.sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return new Date(b.assignedAt) - new Date(a.assignedAt);
      });
      
      return { success: true, assignments };
    } catch (error) {
      console.error('Error fetching student assignments:', error);
      return { success: false, error: error.message, assignments: [] };
    }
  }

  // Archive/Delete class
  static async archiveClass(classId) {
    try {
      const docRef = doc(db, 'classes', classId);
      await updateDoc(docRef, {
        'settings.isArchived': true,
        updatedAt: new Date().toISOString()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error archiving class:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper methods
  static generateEnrollmentCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  static async updateClassStats(classId) {
    try {
      const classResult = await this.getClass(classId);
      if (!classResult.success) return;
      
      const classData = classResult.class;
      const stats = {
        totalStudents: classData.students.length,
        totalAssignments: classData.assignedTests.length,
        completedAssignments: classData.assignedTests.filter(a => a.status === 'completed').length,
        averageScore: 0 // TODO: Calculate from submissions
      };
      
      await updateDoc(doc(db, 'classes', classId), { stats });
    } catch (error) {
      console.error('Error updating class stats:', error);
    }
  }

  static async createEnrollmentRecord(classId, studentId, studentEmail) {
    try {
      const enrollmentId = `enrollment_${classId}_${studentId}`;
      
      const enrollment = {
        id: enrollmentId,
        classId: classId,
        studentId: studentId,
        studentEmail: studentEmail,
        enrolledAt: new Date().toISOString(),
        status: 'active'
      };
      
      await setDoc(doc(db, 'enrollments', enrollmentId), enrollment);
    } catch (error) {
      console.error('Error creating enrollment record:', error);
    }
  }

  // Add student to class by email (looks up user first)
  static async addStudentByEmail(classId, studentEmail) {
    try {
      // In a real implementation, you would:
      // 1. Look up the user by email in your users collection
      // 2. Check if they have a student role
      // 3. Add them to the class if found
      
      // For now, we'll create a placeholder student ID and invitation
      const studentId = `pending_${studentEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      // Add student to class (they'll be marked as pending until they join)
      const result = await this.addStudentToClass(classId, studentId, studentEmail);
      
      if (result.success) {
        // In a real implementation, you might also:
        // - Send an email invitation
        // - Create a notification for the student
        console.log(`Student ${studentEmail} added to class ${classId} (pending registration)`);
      }
      
      return result;
    } catch (error) {
      console.error('Error adding student by email:', error);
      return { success: false, error: error.message };
    }
  }
}
