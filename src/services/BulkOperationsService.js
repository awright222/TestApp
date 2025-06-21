// Note: Dynamic imports to avoid circular dependencies
// import { OrganizationService } from './OrganizationService';
// import { ClassService } from './ClassService';

export class BulkOperationsService {
  // Parse CSV data into array of objects
  static parseCSV(csvText) {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
      }

      const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
      const data = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        // Handle CSV with quoted values
        const values = this.parseCSVLine(line);
        
        if (values.length !== headers.length) {
          console.warn(`Line ${i + 1} has ${values.length} values but expected ${headers.length}. Skipping.`);
          continue;
        }

        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index]?.trim().replace(/"/g, '') || '';
        });
        
        data.push(rowData);
      }

      return { success: true, data, headers };
    } catch (error) {
      console.error('Error parsing CSV:', error);
      return { success: false, error: error.message };
    }
  }

  // Parse a single CSV line handling quoted values
  static parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current); // Don't forget the last value
    return values;
  }

  // Convert array of objects to CSV string
  static generateCSV(data, headers = null) {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data provided for CSV generation');
      }

      const csvHeaders = headers || Object.keys(data[0]);
      const csvRows = [csvHeaders.join(',')];

      data.forEach(row => {
        const values = csvHeaders.map(header => {
          const value = row[header] || '';
          // Escape quotes and wrap in quotes if contains comma
          const escapedValue = value.toString().replace(/"/g, '""');
          return escapedValue.includes(',') ? `"${escapedValue}"` : escapedValue;
        });
        csvRows.push(values.join(','));
      });

      return { success: true, csv: csvRows.join('\n') };
    } catch (error) {
      console.error('Error generating CSV:', error);
      return { success: false, error: error.message };
    }
  }

  // Bulk import students from CSV with real backend integration
  static async importStudents(organizationId, classId, csvData, options = {}) {
    try {
      const parseResult = this.parseCSV(csvData);
      if (!parseResult.success) {
        return parseResult;
      }

      const { data: students } = parseResult;
      const results = [];
      const errors = [];

      // Validate required fields
      const requiredFields = ['name', 'email'];
      const hasRequiredFields = requiredFields.every(field => 
        parseResult.headers.some(header => 
          header.toLowerCase().includes(field.toLowerCase())
        )
      );

      if (!hasRequiredFields) {
        return { 
          success: false, 
          error: `CSV must contain columns for: ${requiredFields.join(', ')}` 
        };
      }

      // Process each student
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        
        try {
          // Find email field (could be 'email', 'Email', 'email_address', etc.)
          const emailField = Object.keys(student).find(key => 
            key.toLowerCase().includes('email')
          );
          
          // Find name field
          const nameField = Object.keys(student).find(key => 
            key.toLowerCase().includes('name')
          );

          if (!emailField || !nameField) {
            errors.push(`Row ${i + 2}: Missing required fields`);
            continue;
          }

          const email = student[emailField];
          const name = student[nameField];

          if (!email || !name) {
            errors.push(`Row ${i + 2}: Empty email or name`);
            continue;
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            errors.push(`Row ${i + 2}: Invalid email format: ${email}`);
            continue;
          }

          // Handle class assignments if provided
          let classIds = [];
          const classField = Object.keys(student).find(key => 
            key.toLowerCase().includes('class')
          );
          
          if (classField && student[classField]) {
            const classNames = student[classField].split(',').map(name => name.trim());
            // In a real implementation, you'd look up class IDs by name
            classIds = classNames.map(name => `class_${name.replace(/\s+/g, '_').toLowerCase()}`);
          }

          // Add student to the specified class using real backend
          const { ClassService } = await import('./ClassService');
          const result = await ClassService.addStudentByEmail(classId, email);
          
          if (result.success) {
            results.push({
              email,
              name,
              success: true,
              studentId: result.studentId,
              message: result.message || 'Student added successfully'
            });
          } else {
            errors.push(`Row ${i + 2}: ${result.error || 'Failed to add student'}`);
          }

        } catch (error) {
          errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = errors.length;

      return {
        success: successCount > 0,
        results,
        errors,
        summary: {
          total: students.length,
          successful: successCount,
          failed: failureCount,
          errors: errors
        }
      };

    } catch (error) {
      console.error('Error importing students:', error);
      return { success: false, error: error.message };
    }
  }

  // Bulk import teachers from CSV
  static async importTeachers(organizationId, csvData, options = {}) {
    try {
      const parseResult = this.parseCSV(csvData);
      if (!parseResult.success) {
        return parseResult;
      }

      const { data: teachers } = parseResult;
      const results = [];
      const errors = [];

      // Validate required fields
      const requiredFields = ['name', 'email'];
      const hasRequiredFields = requiredFields.every(field => 
        parseResult.headers.some(header => 
          header.toLowerCase().includes(field.toLowerCase())
        )
      );

      if (!hasRequiredFields) {
        return { 
          success: false, 
          error: `CSV must contain columns for: ${requiredFields.join(', ')}` 
        };
      }

      // Process each teacher
      for (let i = 0; i < teachers.length; i++) {
        const teacher = teachers[i];
        
        try {
          // Find required fields
          const emailField = Object.keys(teacher).find(key => 
            key.toLowerCase().includes('email')
          );
          const nameField = Object.keys(teacher).find(key => 
            key.toLowerCase().includes('name')
          );

          if (!emailField || !nameField) {
            errors.push(`Row ${i + 2}: Missing required fields`);
            continue;
          }

          const email = teacher[emailField];
          const name = teacher[nameField];

          if (!email || !name) {
            errors.push(`Row ${i + 2}: Empty email or name`);
            continue;
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            errors.push(`Row ${i + 2}: Invalid email format: ${email}`);
            continue;
          }

          // Handle department if provided
          const departmentField = Object.keys(teacher).find(key => 
            key.toLowerCase().includes('department')
          );
          const department = departmentField ? teacher[departmentField] : '';

          // Add teacher using real backend
          const { OrganizationService } = await import('./OrganizationService');
          const result = await OrganizationService.addTeacher(organizationId, {
            email,
            displayName: name,
            invitedBy: options.invitedBy || 'admin'
          });
          
          if (result.success) {
            results.push({
              email,
              name,
              success: true,
              userId: result.userId || result.inviteId,
              message: result.message || 'Teacher added successfully'
            });
          } else {
            errors.push(`Row ${i + 2}: ${result.error || 'Failed to add teacher'}`);
          }

        } catch (error) {
          errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = errors.length;

      return {
        success: successCount > 0,
        results,
        errors,
        summary: {
          total: teachers.length,
          successful: successCount,
          failed: failureCount,
          errors: errors
        }
      };

    } catch (error) {
      console.error('Error importing teachers:', error);
      return { success: false, error: error.message };
    }
  }

  // Export students to CSV
  static exportStudents(students) {
    try {
      const headers = ['Name', 'Email', 'Classes', 'Total Assignments', 'Completed', 'Average Score', 'Last Active', 'Status'];
      
      const rows = students.map(student => [
        student.displayName || this.extractNameFromEmail(student.email),
        student.email,
        student.classes?.map(c => c.name || c).join('; ') || '',
        student.stats?.totalAssignments || '0',
        student.stats?.completedAssignments || '0',
        student.stats?.averageScore || '0',
        student.lastActive ? new Date(student.lastActive).toLocaleDateString() : '',
        this.calculateUserStatus(student.lastActive)
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return {
        success: true,
        csv: csvContent,
        filename: `students_export_${new Date().toISOString().split('T')[0]}.csv`
      };
    } catch (error) {
      console.error('Error exporting students:', error);
      return { success: false, error: error.message };
    }
  }

  // Export teachers to CSV
  static exportTeachers(teachers) {
    try {
      const headers = ['Name', 'Email', 'Classes', 'Total Students', 'Total Classes', 'Average Score', 'Last Active', 'Status'];
      
      const rows = teachers.map(teacher => [
        teacher.displayName || this.extractNameFromEmail(teacher.email),
        teacher.email,
        teacher.classes?.join('; ') || '',
        teacher.stats?.totalStudents || '0',
        teacher.stats?.totalClasses || '0',
        teacher.stats?.avgScore || '0',
        teacher.lastActive ? new Date(teacher.lastActive).toLocaleDateString() : '',
        teacher.status || 'unknown'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return {
        success: true,
        csv: csvContent,
        filename: `teachers_export_${new Date().toISOString().split('T')[0]}.csv`
      };
    } catch (error) {
      console.error('Error exporting teachers:', error);
      return { success: false, error: error.message };
    }
  }

  // Export classes to CSV
  static exportClasses(classes) {
    try {
      const headers = ['Name', 'Subject', 'Teacher', 'Students', 'Created', 'Status'];
      
      const rows = classes.map(cls => [
        cls.name || '',
        cls.subject || '',
        cls.teacherName || cls.teacherId || '',
        cls.students?.length || '0',
        cls.createdAt ? new Date(cls.createdAt).toLocaleDateString() : '',
        cls.settings?.isArchived ? 'Archived' : 'Active'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return {
        success: true,
        csv: csvContent,
        filename: `classes_export_${new Date().toISOString().split('T')[0]}.csv`
      };
    } catch (error) {
      console.error('Error exporting classes:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper to extract name from email
  static extractNameFromEmail(email) {
    if (!email) return '';
    const localPart = email.split('@')[0];
    return localPart.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  }

  // Helper to calculate status
  static calculateUserStatus(lastActiveDate) {
    if (!lastActiveDate) return 'inactive';
    
    const lastActive = new Date(lastActiveDate);
    const now = new Date();
    const daysSinceActive = (now - lastActive) / (1000 * 60 * 60 * 24);
    
    if (daysSinceActive <= 1) return 'active';
    if (daysSinceActive <= 7) return 'recent';
    return 'inactive';
  }

  // Download CSV file
  static downloadCSV(csvContent, filename) {
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return { success: true };
      } else {
        throw new Error('Browser does not support file download');
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
      return { success: false, error: error.message };
    }
  }

  // Validate CSV format for specific type
  static validateCSVFormat(csvData, type) {
    const parseResult = this.parseCSV(csvData);
    if (!parseResult.success) {
      return parseResult;
    }

    const { headers } = parseResult;
    const requiredFields = {
      students: ['name', 'email'],
      teachers: ['name', 'email']
    };

    const required = requiredFields[type] || [];
    const missingFields = required.filter(field => 
      !headers.some(header => header.toLowerCase().includes(field.toLowerCase()))
    );

    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Missing required columns: ${missingFields.join(', ')}`,
        missingFields
      };
    }

    return {
      success: true,
      headers,
      rowCount: parseResult.data.length
    };
  }

  // Get sample CSV templates
  static getSampleCSV(type) {
    const templates = {
      students: {
        headers: ['name', 'email', 'class', 'grade'],
        sample: [
          ['John Smith', 'john.smith@school.edu', 'Math 101', '10'],
          ['Jane Doe', 'jane.doe@school.edu', 'Science', '11'],
          ['Mike Johnson', 'mike.johnson@school.edu', 'Math 101,Science', '10']
        ]
      },
      teachers: {
        headers: ['name', 'email', 'department', 'phone'],
        sample: [
          ['Dr. Sarah Wilson', 'sarah.wilson@school.edu', 'Mathematics', '555-0123'],
          ['Prof. Robert Chen', 'robert.chen@school.edu', 'Science', '555-0124'],
          ['Ms. Lisa Brown', 'lisa.brown@school.edu', 'English', '555-0125']
        ]
      }
    };

    const template = templates[type];
    if (!template) {
      return { success: false, error: 'Unknown template type' };
    }

    const csvContent = [
      template.headers.join(','),
      ...template.sample.map(row => row.join(','))
    ].join('\n');

    return {
      success: true,
      csv: csvContent,
      filename: `${type}_template.csv`
    };
  }
}
