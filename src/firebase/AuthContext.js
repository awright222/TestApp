import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from './config';
import { FirebaseTestsService } from './testsService';
import { SavedTestsService } from '../SavedTestsService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Google Sign-In provider
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Load user profile
        const profile = await FirebaseTestsService.getUserProfile(user.uid);
        setUserProfile(profile);
        
        // If no profile exists, create one
        if (!profile) {
          const newProfile = {
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
            // Role and subscription info (defaults for existing users)
            accountType: null, // null means needs to select role
            isNewUser: true,
            subscription: {
              tier: 'free',
              status: 'active',
              startDate: new Date().toISOString(),
              features: {
                canCreateTests: false,
                canViewAnalytics: false,
                maxTestsPerMonth: 0,
                maxStudentsPerTest: 0,
                storageGB: 0
              }
            },
            usage: {
              currentPeriod: new Date().toISOString().substring(0, 7), // YYYY-MM
              testsCreated: 0,
              studentAttempts: 0,
              storageUsedGB: 0
            },
            preferences: {
              theme: 'default',
              timerDefault: 30
            }
          };
          await FirebaseTestsService.saveUserProfile(user.uid, newProfile);
          setUserProfile(newProfile);
        } else if (!profile.accountType) {
          // Existing user without role - default to teacher to maintain functionality
          const updatedProfile = {
            ...profile,
            accountType: 'teacher',
            isNewUser: false,
            subscription: {
              tier: 'free',
              status: 'active',
              startDate: profile.createdAt || new Date().toISOString(),
              features: {
                canCreateTests: true,
                canViewAnalytics: true,
                maxTestsPerMonth: 25, // Grandfathered unlimited for existing users
                maxStudentsPerTest: 1000,
                storageGB: 1.0
              }
            },
            usage: {
              currentPeriod: new Date().toISOString().substring(0, 7),
              testsCreated: 0,
              studentAttempts: 0,
              storageUsedGB: 0
            }
          };
          await FirebaseTestsService.saveUserProfile(user.uid, updatedProfile);
          setUserProfile(updatedProfile);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Migrate localStorage tests to Firebase after successful login
      setTimeout(() => {
        SavedTestsService.migrateToFirebase().catch(error => {
          console.warn('Migration failed but login successful:', error);
        });
      }, 1000); // Small delay to ensure auth state is fully updated
      
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, displayName = '', accountType = null) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Determine the subscription features based on account type
      const getSubscriptionFeatures = (type) => {
        if (type === 'student') {
          return {
            canCreateTests: false,
            canViewAnalytics: false,
            maxTestsPerMonth: 0,
            maxStudentsPerTest: 0,
            storageGB: 0.1
          };
        } else if (type === 'teacher') {
          return {
            canCreateTests: true,
            canViewAnalytics: true,
            maxTestsPerMonth: 3,
            maxStudentsPerTest: 100,
            storageGB: 0.5
          };
        }
        // Default fallback
        return {
          canCreateTests: false,
          canViewAnalytics: false,
          maxTestsPerMonth: 0,
          maxStudentsPerTest: 0,
          storageGB: 0
        };
      };
      
      // Create user profile
      const newProfile = {
        email,
        displayName,
        createdAt: new Date().toISOString(),
        // Role and subscription info for new users
        accountType: accountType,
        isNewUser: accountType ? false : true, // If role is selected during signup, they're not "new" anymore
        subscription: {
          tier: 'free',
          status: 'active',
          startDate: new Date().toISOString(),
          features: getSubscriptionFeatures(accountType)
        },
        usage: {
          currentPeriod: new Date().toISOString().substring(0, 7),
          testsCreated: 0,
          studentAttempts: 0,
          storageUsedGB: 0
        },
        preferences: {
          theme: 'default',
          timerDefault: 30
        }
      };
      
      await FirebaseTestsService.saveUserProfile(result.user.uid, newProfile);
      
      // Migrate localStorage tests to Firebase after successful registration
      setTimeout(() => {
        SavedTestsService.migrateToFirebase().catch(error => {
          console.warn('Migration failed but registration successful:', error);
        });
      }, 1000); // Small delay to ensure auth state is fully updated
      
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Migrate localStorage tests to Firebase after successful Google login
      setTimeout(() => {
        SavedTestsService.migrateToFirebase().catch(error => {
          console.warn('Migration failed but Google login successful:', error);
        });
      }, 1000); // Small delay to ensure auth state is fully updated
      
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateUserProfile = async (profileData) => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    try {
      await FirebaseTestsService.saveUserProfile(user.uid, profileData);
      setUserProfile(prev => ({ ...prev, ...profileData }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const refreshUserProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await FirebaseTestsService.getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  // Role and subscription management functions
  const setUserRole = async (accountType) => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    // Define subscription features based on role
    const subscriptionFeatures = {
      student: {
        tier: 'free',
        features: {
          canCreateTests: false,
          canViewAnalytics: false,
          maxTestsPerMonth: 0,
          maxStudentsPerTest: 0,
          storageGB: 0
        }
      },
      teacher: {
        tier: 'free', // Start with free teacher tier
        features: {
          canCreateTests: true,
          canViewAnalytics: true,
          maxTestsPerMonth: 3, // Limited free tier
          maxStudentsPerTest: 50,
          storageGB: 0.5
        }
      },
      admin: {
        tier: 'organization', // Organization admin tier
        features: {
          canCreateTests: true,
          canViewAnalytics: true,
          canManageTeachers: true,
          canViewOrgAnalytics: true,
          canBulkImport: true,
          canManageAllClasses: true,
          maxTestsPerMonth: -1, // Unlimited
          maxStudentsPerTest: -1, // Unlimited
          storageGB: 10 // 10GB for admin
        }
      }
    };

    const roleData = {
      accountType,
      isNewUser: false,
      subscription: {
        ...userProfile.subscription,
        ...subscriptionFeatures[accountType]
      }
    };

    return await updateUserProfile(roleData);
  };

  const upgradeSubscription = async (tier) => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    // Define subscription tiers
    const subscriptionTiers = {
      teacher_free: {
        tier: 'free',
        features: {
          canCreateTests: true,
          canViewAnalytics: true,
          maxTestsPerMonth: 3,
          maxStudentsPerTest: 50,
          storageGB: 0.5
        }
      },
      teacher_paid: {
        tier: 'paid',
        features: {
          canCreateTests: true,
          canViewAnalytics: true,
          maxTestsPerMonth: 25,
          maxStudentsPerTest: 1000,
          storageGB: 1.0
        }
      },
      school: {
        tier: 'school',
        features: {
          canCreateTests: true,
          canViewAnalytics: true,
          maxTestsPerMonth: -1, // unlimited
          maxStudentsPerTest: -1, // unlimited
          storageGB: 10.0
        }
      }
    };

    const tierData = subscriptionTiers[tier];
    if (!tierData) return { success: false, error: 'Invalid subscription tier' };

    const subscriptionData = {
      subscription: {
        ...userProfile.subscription,
        ...tierData,
        upgradeDate: new Date().toISOString()
      }
    };

    return await updateUserProfile(subscriptionData);
  };

  const trackUsage = async (eventType, quantity = 1) => {
    if (!user || !userProfile) return;
    
    const currentPeriod = new Date().toISOString().substring(0, 7);
    const needsNewPeriod = userProfile.usage.currentPeriod !== currentPeriod;
    
    const usageUpdate = {
      usage: {
        currentPeriod,
        testsCreated: needsNewPeriod ? 0 : userProfile.usage.testsCreated,
        studentAttempts: needsNewPeriod ? 0 : userProfile.usage.studentAttempts,
        storageUsedGB: userProfile.usage.storageUsedGB // Persists across periods
      }
    };

    // Update usage based on event type
    switch (eventType) {
      case 'test_created':
        usageUpdate.usage.testsCreated += quantity;
        break;
      case 'student_attempt':
        usageUpdate.usage.studentAttempts += quantity;
        break;
      case 'storage_used':
        usageUpdate.usage.storageUsedGB += quantity;
        break;
      default:
        console.warn('Unknown usage event type:', eventType);
        break;
    }

    await updateUserProfile(usageUpdate);
  };

  // Helper function to check if user can perform an action
  const canPerformAction = (action) => {
    if (!userProfile) return false;
    
    // In development, allow teachers to bypass limits
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment && userProfile.accountType === 'teacher' && action === 'create_test') {
      return true;
    }
    
    const features = userProfile.subscription.features;
    const usage = userProfile.usage;
    
    switch (action) {
      case 'create_test':
        if (!features.canCreateTests) return false;
        if (features.maxTestsPerMonth > 0 && usage.testsCreated >= features.maxTestsPerMonth) return false;
        return true;
      case 'view_analytics':
        return features.canViewAnalytics;
      case 'unlimited_students':
        return features.maxStudentsPerTest === -1;
      default:
        return false;
    }
  };

  // Helper function to check user role
  const isAdmin = () => {
    return userProfile?.accountType === 'admin';
  };

  const isTeacher = () => {
    return userProfile?.accountType === 'teacher';
  };

  const isStudent = () => {
    return userProfile?.accountType === 'student';
  };

  // Helper function to check organization admin permissions
  const hasOrgAdminPermission = (permission) => {
    if (!userProfile || !isAdmin()) return false;
    
    const features = userProfile.subscription?.features || {};
    
    switch (permission) {
      case 'manage_teachers':
        return features.canManageTeachers || false;
      case 'view_org_analytics':
        return features.canViewOrgAnalytics || false;
      case 'bulk_import':
        return features.canBulkImport || false;
      case 'manage_all_classes':
        return features.canManageAllClasses || false;
      default:
        return false;
    }
  };

  const value = {
    user,
    userProfile,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUserProfile,
    refreshUserProfile,
    setUserRole,
    upgradeSubscription,
    trackUsage,
    canPerformAction,
    isAdmin,
    isTeacher,
    isStudent,
    hasOrgAdminPermission,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
