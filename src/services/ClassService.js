import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
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
        }
      };

      await setDoc(doc(db, 'classes', classId), newClass);
      return { success: true, classId, class: newClass };
    } catch (error) {
      console.error('Error creating class:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all classes for a teacher
  static async getTeacherClasses(teacherId) {
    try {
      const q = query(
        collection(db, 'classes'),
        where('teacherId', '==', teacherId),
        where('settings.isArchived', '==', false),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const classes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, classes };
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
      return { success: false, error: error.message, classes: [] };
    }
  }

  // Get classes where user is a student
  static async getStudentClasses(studentId) {
    try {
      const q = query(
        collection(db, 'classes'),
        where('students', 'array-contains', studentId),
        where('settings.isArchived', '==', false),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const classes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
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
      const q = query(
        collection(db, 'classes'),
        where('settings.enrollmentCode', '==', enrollmentCode),
        where('settings.allowSelfEnrollment', '==', true),
        where('settings.isArchived', '==', false)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { success: false, error: 'Invalid enrollment code' };
      }
      
      const classDoc = snapshot.docs[0];
      const classData = classDoc.data();
      
      // Check if student is already enrolled
      if (classData.students.includes(studentId)) {
        return { success: false, error: 'Already enrolled in this class' };
      }
      
      // Add student to class
      const result = await this.addStudentToClass(classDoc.id, studentId, studentEmail);
      
      if (result.success) {
        return { 
          success: true, 
          classId: classDoc.id,
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
}
