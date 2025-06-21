# User Roles and Permissions System

## Role Hierarchy

### 1. **Student** 
- **Primary Function**: Take tests and quizzes
- **Permissions**:
  - Take assigned tests
  - View own results
  - Join classes with enrollment codes
- **Access**: Student dashboard, practice tests

### 2. **Teacher**
- **Primary Function**: Create and manage tests, classes, and students
- **Permissions**:
  - Create and edit tests
  - Manage their own classes
  - Add/remove students from their classes
  - View analytics for their classes
  - Access student directory for their organization
- **Access**: Teacher dashboard, class management, student directory

### 3. **Organization Admin** (New Role)
- **Primary Function**: Manage the entire organization
- **Permissions**:
  - Manage all teachers in the organization
  - View organization-wide analytics
  - Bulk import/export teachers and students
  - Manage classes across the organization
  - Access to admin dashboard
- **Access**: Organization admin dashboard, all teacher features

### 4. **Super Admin** (Future)
- **Primary Function**: System-wide administration
- **Permissions**:
  - Manage multiple organizations
  - System configuration
  - User account management
- **Access**: System admin panel

## Current Implementation Gap

Right now, the Organization Admin dashboard can be accessed by anyone who is logged in. We need to:

1. Add "admin" as a role in the authentication system
2. Add role-based access control to the Organization Admin
3. Update the user profile to include organization membership
4. Add proper permission checks

## Proposed User Data Structure

```javascript
{
  uid: "user123",
  email: "admin@school.edu", 
  displayName: "Jane Admin",
  role: "admin", // student, teacher, admin, super_admin
  organizationId: "school_org_123",
  permissions: {
    canManageTeachers: true,
    canViewOrgAnalytics: true,
    canBulkImport: true,
    canManageAllClasses: true
  },
  createdAt: "2025-06-21T...",
  lastLoginAt: "2025-06-21T..."
}
```

## Implementation Needed

1. **Role-Based Authentication**: Add admin role to AuthContext
2. **Permission Checking**: Add guards to Organization Admin routes
3. **User Interface**: Add role selection during signup
4. **Organization Membership**: Link users to specific organizations
