import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { rolesList } from '../utils/mockData';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendEmailVerification,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Initialize auth state listener only once
let authListenerInitialized = false;

const initializeAuthListener = (set) => {
  if (typeof window === 'undefined' || authListenerInitialized) return;
  
  authListenerInitialized = true;
  
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        // Check email verification
        if (!firebaseUser.emailVerified) {
          // If email is not verified, sign out
          await signOut(auth);
          set({ 
            user: null, 
            isAuthenticated: false, 
            role: 'USER',
            error: 'Email not verified. Please verify your email before logging in.' 
          });
          return;
        }

        // Get user data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          set({
            user: {
              id: firebaseUser.uid,
              name: userData.name,
              email: firebaseUser.email,
              role: userData.role,
              emailVerified: firebaseUser.emailVerified,
            },
            role: userData.role,
            isAuthenticated: true,
            error: null,
          });
        } else {
          // User document doesn't exist, sign them out
          await signOut(auth);
          set({ 
            user: null, 
            isAuthenticated: false, 
            role: 'USER',
            error: 'User data not found. Please register again.' 
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        set({ 
          error: 'Failed to fetch user data. Please try again.',
          isAuthenticated: false 
        });
      }
    } else {
      set({ 
        user: null, 
        isAuthenticated: false, 
        role: 'USER',
        error: null 
      });
    }
  });
};

export const useAuthStore = create(
  persist(
    (set, get) => {
      // Initialize auth state listener
      initializeAuthListener(set);

      return {
        user: null,
        role: 'USER',
        isAuthenticated: false,
        isLoading: false,
        error: null,
        themeMode: 'light',
        notifications: 3,
        availableRoles: rolesList,
        
        register: async ({ name, email, password, role = 'USER' }) => {
          set({ isLoading: true, error: null });
          
          try {
            // Check if Firebase is properly configured
            if (!auth?.app?.options?.apiKey || auth.app.options.apiKey.includes('your-')) {
              throw new Error(
                'Firebase is not configured. Please set up your .env file with Firebase credentials and enable Authentication in Firebase Console.'
              );
            }

            // Validate role
            if (!rolesList.includes(role)) {
              throw new Error('Invalid role selected');
            }

            // Validate password length
            if (password.length < 6) {
              throw new Error('Password must be at least 6 characters long');
            }

            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Send email verification
            await sendEmailVerification(firebaseUser);

            // Store user data in Firestore
            const userData = {
              name,
              email,
              role,
              emailVerified: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), userData);

            // Set user in state (but they need to verify email to login)
            set({
              user: {
                id: firebaseUser.uid,
                name,
                email,
                role,
                emailVerified: false,
              },
              role,
              isLoading: false,
              error: null,
            });

            // Sign out immediately since email is not verified
            await signOut(auth);
            set({ 
              isAuthenticated: false,
              user: null,
            });

            return {
              success: true,
              message: 'Registration successful! Please verify your email before logging in.',
              email: firebaseUser.email,
            };
          } catch (error) {
            let errorMessage = 'Registration failed. Please try again.';
            
            if (error.code === 'auth/email-already-in-use') {
              errorMessage = 'This email is already registered. Please login instead.';
            } else if (error.code === 'auth/invalid-email') {
              errorMessage = 'Invalid email address.';
            } else if (error.code === 'auth/weak-password') {
              errorMessage = 'Password is too weak. Please use a stronger password.';
            } else if (error.code === 'auth/configuration-not-found') {
              errorMessage = 'Firebase Authentication is not enabled. Please enable Email/Password authentication in Firebase Console → Authentication → Sign-in method.';
            } else if (error.code === 'auth/network-request-failed') {
              errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.message) {
              errorMessage = error.message;
            }

            set({ 
              isLoading: false, 
              error: errorMessage 
            });
            
            throw new Error(errorMessage);
          }
        },

        login: async ({ email, password, role }) => {
          set({ isLoading: true, error: null });

          try {
            // Check if Firebase is properly configured
            if (!auth?.app?.options?.apiKey || auth.app.options.apiKey.includes('your-')) {
              throw new Error(
                'Firebase is not configured. Please set up your .env file with Firebase credentials and enable Authentication in Firebase Console.'
              );
            }

            // Sign in with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Check if email is verified
            if (!firebaseUser.emailVerified) {
              // Sign out immediately if not verified
              await signOut(auth);
              throw new Error('Email not verified. Please check your email and verify your account before logging in.');
            }

            // Get user data from Firestore
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
              await signOut(auth);
              throw new Error('User data not found. Please register again.');
            }

            const userData = userDocSnap.data();

            // Verify the role matches if specified
            if (role && userData.role !== role) {
              await signOut(auth);
              throw new Error(`You are registered as ${userData.role}, not ${role}. Please select the correct role.`);
            }

            // Set user state
            const user = {
              id: firebaseUser.uid,
              name: userData.name,
              email: firebaseUser.email,
              role: userData.role,
              emailVerified: firebaseUser.emailVerified,
            };

            set({
              user,
              role: userData.role,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              notifications: 4,
            });

            return user;
          } catch (error) {
            let errorMessage = 'Login failed. Please check your credentials and try again.';
            
            if (error.code === 'auth/user-not-found') {
              errorMessage = 'No account found with this email. Please register first.';
            } else if (error.code === 'auth/wrong-password') {
              errorMessage = 'Incorrect password. Please try again.';
            } else if (error.code === 'auth/invalid-email') {
              errorMessage = 'Invalid email address.';
            } else if (error.code === 'auth/user-disabled') {
              errorMessage = 'This account has been disabled. Please contact support.';
            } else             if (error.code === 'auth/too-many-requests') {
              errorMessage = 'Too many failed login attempts. Please try again later.';
            } else if (error.code === 'auth/configuration-not-found') {
              errorMessage = 'Firebase Authentication is not enabled. Please enable Email/Password authentication in Firebase Console → Authentication → Sign-in method.';
            } else if (error.code === 'auth/network-request-failed') {
              errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.message) {
              errorMessage = error.message;
            }

            set({ 
              isLoading: false, 
              error: errorMessage,
              isAuthenticated: false 
            });
            
            throw new Error(errorMessage);
          }
        },

        logout: async () => {
          try {
            await signOut(auth);
            set({ 
              user: null, 
              isAuthenticated: false, 
              role: 'USER', 
              notifications: 0,
              error: null 
            });
          } catch (error) {
            console.error('Logout error:', error);
            set({ error: 'Failed to logout. Please try again.' });
          }
        },

        switchRole: (role) => {
          if (!rolesList.includes(role)) return;
          set({ role });
        },

        toggleTheme: () => {
          const current = get().themeMode;
          set({ themeMode: current === 'light' ? 'dark' : 'light' });
        },

        markNotificationsRead: () => set({ notifications: 0 }),
        
        addNotification: () =>
          set((state) => ({ notifications: state.notifications + 1 })),
        
        clearError: () => set({ error: null }),
      };
    },
    {
      name: 'emr-connect-auth',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        themeMode: state.themeMode,
      }),
    }
  )
);

