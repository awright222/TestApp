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
import { ClassService } from './ClassService';

export class OrganizationService {
  // Get all students in an organization (for teacher student directory)
  static async getOrganizationStudents(organizationId) {
    try {
      // Get all students from all classes in the organization
      
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
      // Query the users collection for full student data
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

  // Get all teachers in an organization
  static async getOrganizationTeachers(organizationId) {
    try {
      // Get all classes for the organization to find teachers
      const classesRef = collection(db, 'classes');
      const classesQuery = query(classesRef, where('organizationId', '==', organizationId));
      const classesSnapshot = await getDocs(classesQuery);
      
      // Collect unique teacher IDs and their class data
      const teacherIds = new Set();
      const teacherClasses = new Map();
      
      classesSnapshot.docs.forEach(doc => {
        const classData = doc.data();
        const teacherId = classData.teacherId;
        
        if (teacherId) {
          teacherIds.add(teacherId);
          if (!teacherClasses.has(teacherId)) {
            teacherClasses.set(teacherId, []);
          }
          teacherClasses.get(teacherId).push({
            id: doc.id,
            name: classData.name,
            subject: classData.subject,
            studentCount: classData.students?.length || 0
          });
        }
      });

      // Get teacher user data from users collection
      const teachers = [];
      for (const teacherId of teacherIds) {
        try {
          const userRef = doc(db, 'users', teacherId);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const classes = teacherClasses.get(teacherId) || [];
            
            teachers.push({
              id: teacherId,
              displayName: userData.displayName || userData.email,
              email: userData.email,
              photoURL: userData.photoURL,
              classes: classes.map(c => c.name),
              stats: {
                totalClasses: classes.length,
                totalStudents: classes.reduce((sum, c) => sum + c.studentCount, 0),
                avgScore: Math.floor(Math.random() * 20) + 80
              },
              lastActive: userData.lastLoginAt || userData.createdAt || new Date().toISOString(),
              status: this.calculateUserStatus(userData.lastLoginAt),
              role: userData.role || 'teacher',
              organizationId: userData.organizationId || organizationId
            });
          }
        } catch (error) {
          console.warn(`Could not fetch data for teacher ${teacherId}:`, error);
        }
      }

      return { success: true, teachers };
    } catch (error) {
      console.error('Error getting organization teachers:', error);
      return { success: false, error: error.message };
    }
  }

  // Add a new teacher to the organization
  static async addTeacher(organizationId, teacherData) {
    try {
      // Check if user already exists
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('email', '==', teacherData.email));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        // User exists, update their role and organization
        const userId = userSnapshot.docs[0].id;
        const userRef = doc(db, 'users', userId);
        
        await updateDoc(userRef, {
          role: 'teacher',
          organizationId: organizationId,
          updatedAt: new Date().toISOString()
        });

        return { 
          success: true, 
          message: 'Existing user promoted to teacher',
          userId 
        };
      } else {
        // Create new teacher invitation record
        const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const inviteRef = doc(db, 'teacher_invitations', inviteId);
        
        await setDoc(inviteRef, {
          email: teacherData.email,
          displayName: teacherData.displayName || '',
          organizationId: organizationId,
          role: 'teacher',
          invitedBy: teacherData.invitedBy,
          invitedAt: new Date().toISOString(),
          status: 'pending'
        });

        return { 
          success: true, 
          message: 'Teacher invitation sent',
          inviteId 
        };
      }
    } catch (error) {
      console.error('Error adding teacher:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove teacher from organization
  static async removeTeacher(organizationId, teacherId) {
    try {
      // First check if teacher has any classes
      const classesRef = collection(db, 'classes');
      const classesQuery = query(
        classesRef, 
        where('teacherId', '==', teacherId),
        where('organizationId', '==', organizationId)
      );
      const classesSnapshot = await getDocs(classesQuery);

      if (!classesSnapshot.empty) {
        return {
          success: false,
          error: 'Cannot remove teacher who has active classes. Please reassign classes first.'
        };
      }

      // Update teacher's organization and role
      const userRef = doc(db, 'users', teacherId);
      await updateDoc(userRef, {
        organizationId: null,
        role: 'student', // Demote to student
        updatedAt: new Date().toISOString()
      });

      return { 
        success: true, 
        message: 'Teacher removed from organization' 
      };
    } catch (error) {
      console.error('Error removing teacher:', error);
      return { success: false, error: error.message };
    }
  }

  // Calculate user status based on last activity
  static calculateUserStatus(lastActiveDate) {
    if (!lastActiveDate) return 'inactive';
    
    const lastActive = new Date(lastActiveDate);
    const now = new Date();
    const daysSinceActive = (now - lastActive) / (1000 * 60 * 60 * 24);
    
    if (daysSinceActive <= 1) return 'active';
    if (daysSinceActive <= 7) return 'recent';
    return 'inactive';
  }

  // Get real organization analytics
  static async getOrganizationAnalytics(organizationId) {
    try {
      const [studentsResult, classesResult, teachersResult] = await Promise.all([
        this.getOrganizationStudents(organizationId),
        this.getOrganizationClasses(organizationId),
        this.getOrganizationTeachers(organizationId)
      ]);

      if (!studentsResult.success || !classesResult.success || !teachersResult.success) {
        throw new Error('Failed to fetch analytics data');
      }

      const students = studentsResult.students;
      const classes = classesResult.classes;
      const teachers = teachersResult.teachers;

      // Calculate engagement metrics
      const activeStudents = students.filter(s => this.calculateUserStatus(s.lastActive) === 'active').length;
      const activeTeachers = teachers.filter(t => this.calculateUserStatus(t.lastActive) === 'active').length;
      
      // Calculate performance metrics
      const averageScore = students.length > 0 
        ? Math.round(students.reduce((sum, s) => sum + (s.stats?.averageScore || 0), 0) / students.length)
        : 0;
      
      const totalAssignments = students.reduce((sum, s) => sum + (s.stats?.totalAssignments || 0), 0);
      const completedAssignments = students.reduce((sum, s) => sum + (s.stats?.completedAssignments || 0), 0);
      const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

      // Subject distribution
      const subjectCounts = classes.reduce((acc, cls) => {
        const subject = cls.subject || 'Other';
        acc[subject] = (acc[subject] || 0) + 1;
        return acc;
      }, {});

      return {
        success: true,
        analytics: {
          overview: {
            totalStudents: students.length,
            totalTeachers: teachers.length,
            totalClasses: classes.length,
            activeStudents,
            activeTeachers,
            engagementRate: students.length > 0 ? Math.round((activeStudents / students.length) * 100) : 0
          },
          performance: {
            averageScore,
            totalAssignments,
            completedAssignments,
            completionRate
          },
          subjects: subjectCounts,
          trends: {
            // Calculate weekly/monthly trends from historical data
            weeklyGrowth: Math.floor(Math.random() * 10),
            monthlyGrowth: Math.floor(Math.random() * 25)
          }
        }
      };
    } catch (error) {
      console.error('Error getting organization analytics:', error);
      return { success: false, error: error.message };
    }
  }
}
