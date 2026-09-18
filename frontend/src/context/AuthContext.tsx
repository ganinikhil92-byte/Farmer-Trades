import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth as fbAuth, isFirebaseReady, googleProvider } from '../firebase/firebase';

export type UserRole = 'admin' | 'farmer' | 'buyer';
export type UserStatus = 'Verified' | 'Pending' | 'Suspended';

export interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
  district?: string;
  taluk?: string;
  village?: string;
  pincode?: string;
  phone?: string;
  status?: UserStatus;
  registeredAt?: string;
}

interface StoredUser extends AuthUser {
  password?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, selectedRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle?: () => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: UserRole, district?: string, taluk?: string, village?: string, pincode?: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getUsers: (role?: UserRole) => AuthUser[];
  updateUserStatus: (email: string, status: UserStatus) => void;
  updateUserDetails: (email: string, details: Partial<AuthUser>) => void;
  sendOtp: (email: string) => Promise<{ success: boolean; message?: string; error?: string; otp?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  deleteUser: (email: string) => void;
  isFirebaseActive: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial default seed users across Karnataka (Admin accounts preserved)
const DEFAULT_USERS: StoredUser[] = [
  { email: 'nikhilgani987@gmail.com', password: 'Nikhil@2005', name: 'Nikhil Gani', role: 'admin', district: 'Bengaluru Urban', taluk: 'Bengaluru South', village: 'Jayanagar', pincode: '560041', phone: '8660416257', status: 'Verified', registeredAt: '2026-08-01' },
  { email: 'admin@agro.com', password: 'Admin@123', name: 'Admin Officer', role: 'admin', status: 'Verified', registeredAt: '2026-08-01' },
];

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem('agro_users_store');
    if (raw) {
      const parsed: StoredUser[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out any legacy dummy farmer/buyer credentials
        const cleaned = parsed.filter(
          (u) =>
            u.email.toLowerCase() !== 'nikhilgani293@gmail.com' &&
            u.email.toLowerCase() !== 'ganinikhil92@gmail.com' &&
            u.email.toLowerCase() !== 'farmer@agro.com' &&
            u.email.toLowerCase() !== 'buyer@agro.com' &&
            u.email.toLowerCase() !== 'patil@agro.com' &&
            u.email.toLowerCase() !== 'ningappa@agro.com' &&
            u.email.toLowerCase() !== 'trader@agro.com' &&
            u.email.toLowerCase() !== 'retail@agro.com'
        );
        const adminIdx = cleaned.findIndex((u) => u.email.toLowerCase() === 'nikhilgani987@gmail.com');
        if (adminIdx === -1) {
          cleaned.unshift(DEFAULT_USERS[0]);
        } else {
          cleaned[adminIdx].password = 'Nikhil@2005';
          cleaned[adminIdx].role = 'admin';
        }
        return cleaned;
      }
    }
  } catch (e) {
    console.error('Error reading users from localStorage', e);
  }
  return DEFAULT_USERS;
}



function saveStoredUsers(users: StoredUser[]) {
  try {
    localStorage.setItem('agro_users_store', JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to localStorage', e);
  }
}

// Password rules: at least 8 characters
function validatePassword(pw: string): string | null {
  if (!pw || pw.length < 8) return 'Password must be at least 8 characters';
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usersList, setUsersList] = useState<StoredUser[]>(() => getStoredUsers());
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('agro_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Listen for Firebase Auth state changes
  useEffect(() => {
    if (!isFirebaseReady || !fbAuth) return;

    const unsubscribe = onAuthStateChanged(fbAuth, async (fbUser: FirebaseUser | null) => {
      if (fbUser && fbUser.email) {
        try {
          const token = await fbUser.getIdToken();
          localStorage.setItem('agro_auth_token', token);

          const cleanEmail = fbUser.email.toLowerCase();
          const profile = usersList.find((u) => u.email.toLowerCase() === cleanEmail);

          const authUser: AuthUser = {
            email: cleanEmail,
            name: profile?.name || fbUser.displayName || cleanEmail.split('@')[0],
            role: profile?.role || 'farmer',
            district: profile?.district,
            taluk: profile?.taluk,
            village: profile?.village,
            pincode: profile?.pincode,
            phone: profile?.phone,
            status: profile?.status || 'Verified',
            registeredAt: profile?.registeredAt || new Date().toISOString().split('T')[0],
          };
          setUser(authUser);
          localStorage.setItem('agro_user', JSON.stringify(authUser));
        } catch (e) {
          console.warn('[Firebase Auth] Error restoring session:', e);
        }
      }
    });

    return () => unsubscribe();
  }, [usersList]);

  // Sync users from backend DB when possible
  useEffect(() => {
    api.get('/users')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setUsersList((prev) => {
            // Merge with local passwords if any
            const merged = res.data.map((u: any) => {
              const existing = prev.find(p => p.email.toLowerCase() === u.email.toLowerCase());
              return {
                ...u,
                password: existing?.password || 'Password@123',
                registeredAt: u.registeredAt || u.registered_at,
              };
            });
            return merged;
          });
        }
      })
      .catch(() => {
        // Backend not running or offline, keep local stored users
      });
  }, []);

  useEffect(() => {
    saveStoredUsers(usersList);
  }, [usersList]);

  async function login(email: string, password: string, selectedRole?: UserRole) {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Attempt Firebase Authentication if active
    if (isFirebaseReady && fbAuth) {
      try {
        const userCred = await signInWithEmailAndPassword(fbAuth, cleanEmail, password);
        const fbToken = await userCred.user.getIdToken();
        localStorage.setItem('agro_auth_token', fbToken);

        const profile = usersList.find((u) => u.email.toLowerCase() === cleanEmail);
        const authUser: AuthUser = {
          email: cleanEmail,
          name: profile?.name || userCred.user.displayName || cleanEmail.split('@')[0],
          role: selectedRole || profile?.role || (cleanEmail === 'nikhilgani987@gmail.com' ? 'admin' : 'farmer'),
          district: profile?.district,
          taluk: profile?.taluk,
          village: profile?.village,
          pincode: profile?.pincode,
          phone: profile?.phone,
          status: profile?.status || 'Verified',
          registeredAt: profile?.registeredAt || new Date().toISOString().split('T')[0],
        };
        setUser(authUser);
        localStorage.setItem('agro_user', JSON.stringify(authUser));
        return { success: true };
      } catch (fbErr: any) {
        console.warn('[Firebase Auth] Login note:', fbErr.code || fbErr.message);
        // Do not return early - allow backend and offline verification
      }
    }

    // 2. Attempt backend database login
    try {
      const res = await api.post('/auth/login', { email: cleanEmail, password, role: selectedRole });
      if (res.data && res.data.success) {
        if (res.data.token) {
          localStorage.setItem('agro_auth_token', res.data.token);
        }
        const authUser: AuthUser = {
          ...res.data.user,
          role: selectedRole || res.data.user.role,
        };
        setUser(authUser);
        localStorage.setItem('agro_user', JSON.stringify(authUser));
        return { success: true };
      }
    } catch (err: any) {
      console.warn('[Backend Auth] Login note:', err?.response?.data?.detail || err?.message);
    }

    // 3. Fallback verification for stored users and admin
    // Admin credential match

    if (cleanEmail === 'nikhilgani987@gmail.com' && (password === 'Nikhil@2005' || password === 'Admin@123')) {
      const adminUser: AuthUser = {
        email: cleanEmail,
        name: 'Nikhil Gani',
        role: selectedRole || 'admin',
        district: 'Bengaluru Urban',
        taluk: 'Bengaluru South',
        village: 'Jayanagar',
        pincode: '560041',
        phone: '8660416257',
        status: 'Verified',
        registeredAt: '2026-08-01',
      };
      setUser(adminUser);
      localStorage.setItem('agro_user', JSON.stringify(adminUser));
      localStorage.setItem('agro_auth_token', 'dev-token-' + btoa(JSON.stringify({ email: cleanEmail, role: adminUser.role, name: adminUser.name })));
      return { success: true };
    }

    // Check usersList matching email and password (supports case variations)
    const found = usersList.find((u) => u.email.toLowerCase() === cleanEmail && (u.password === password || (u.password && u.password.toLowerCase() === password.toLowerCase())));
    if (found) {
      const authUser: AuthUser = {
        email: found.email,
        name: found.name,
        role: selectedRole || found.role,
        district: found.district,
        taluk: found.taluk,
        village: found.village,
        pincode: found.pincode,
        phone: found.phone,
        status: found.status || 'Verified',
        registeredAt: found.registeredAt,
      };
      setUser(authUser);
      localStorage.setItem('agro_user', JSON.stringify(authUser));
      localStorage.setItem('agro_auth_token', 'dev-token-' + btoa(JSON.stringify({ email: authUser.email, role: authUser.role, name: authUser.name })));
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password. Please verify your credentials.' };
  }

  async function signup(
    name: string,
    email: string,
    password: string,
    role: UserRole,
    district?: string,
    taluk?: string,
    village?: string,
    pincode?: string,
    phone?: string
  ) {
    const pwError = validatePassword(password);
    if (pwError) return { success: false, error: pwError };
    const cleanEmail = email.trim().toLowerCase();
    const today = new Date().toISOString().split('T')[0];
    
    // Retrieve the OTP code that was used during verification
    const storedOtp = localStorage.getItem('agro_otp_' + cleanEmail) || '123456';

    const registrationPayload = {
      name: name.trim(),
      email: cleanEmail,
      password,
      role,
      district,
      taluk,
      village,
      pincode,
      phone,
      otp: storedOtp
    };

    // Helper to create auth user and save to state
    const finalizeRegistration = (authUser: AuthUser) => {
      setUser(authUser);
      localStorage.setItem('agro_user', JSON.stringify(authUser));
      const newUser: StoredUser = { ...authUser, password };
      const updated = [...usersList.filter(u => u.email.toLowerCase() !== cleanEmail), newUser];
      setUsersList(updated);
      saveStoredUsers(updated);
    };

    // 1. Attempt Firebase Auth registration if active
    if (isFirebaseReady && fbAuth) {
      try {
        const userCred = await createUserWithEmailAndPassword(fbAuth, cleanEmail, password);
        const fbToken = await userCred.user.getIdToken();
        localStorage.setItem('agro_auth_token', fbToken);

        // Also sync with backend API (best effort)
        try {
          await api.post('/auth/register', registrationPayload);
        } catch {
          // Backend sync failed, that's okay — we have Firebase auth
        }

        const authUser: AuthUser = {
          email: cleanEmail,
          name: name.trim(),
          role,
          district,
          taluk,
          village,
          pincode,
          phone,
          status: role === 'admin' ? 'Verified' : 'Pending',
          registeredAt: today,
        };
        finalizeRegistration(authUser);
        return { success: true };
      } catch (fbErr: any) {
        if (fbErr.code === 'auth/email-already-in-use') {
          // Don't return error yet — maybe they can register on backend only
          console.warn('[Firebase Auth] Email already in use, trying backend registration');
        } else {
          console.warn('[Firebase Auth] Signup notice:', fbErr.message);
        }
      }
    }

    // 2. Attempt backend registration
    try {
      const res = await api.post('/auth/register', registrationPayload);
      if (res.data && res.data.success) {
        if (res.data.token) {
          localStorage.setItem('agro_auth_token', res.data.token);
        }
        const authUser: AuthUser = {
          email: res.data.user?.email || cleanEmail,
          name: res.data.user?.name || name.trim(),
          role: res.data.user?.role || role,
          district: res.data.user?.district || district,
          taluk: res.data.user?.taluk || taluk,
          village: res.data.user?.village || village,
          pincode: res.data.user?.pincode || pincode,
          phone: res.data.user?.phone || phone,
          status: res.data.user?.status || 'Pending',
          registeredAt: res.data.user?.registeredAt || today,
        };
        finalizeRegistration(authUser);
        return { success: true };
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail || '';
      if (detail.includes('already exists')) {
        return { success: false, error: 'User with this email already exists. Please try logging in instead.' };
      }
      if (detail.includes('verification required') || detail.includes('verify your email')) {
        return { success: false, error: 'Email verification required. Please verify your email with the OTP code first.' };
      }
      console.warn('[Backend Register Note]', detail || err?.message);
    }

    // 3. Offline / Client-side fallback registration
    if (usersList.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Email already registered. Please try logging in instead.' };
    }

    const newUser: StoredUser = {
      email: cleanEmail,
      password,
      name: name.trim(),
      role,
      district,
      taluk,
      village,
      pincode,
      phone,
      status: 'Pending',
      registeredAt: today,
    };

    const updated = [...usersList, newUser];
    setUsersList(updated);
    saveStoredUsers(updated);

    const authUser: AuthUser = {
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      district: newUser.district,
      taluk: newUser.taluk,
      village: newUser.village,
      pincode: newUser.pincode,
      phone: newUser.phone,
      status: newUser.status,
      registeredAt: newUser.registeredAt,
    };
    setUser(authUser);
    try {
      localStorage.setItem('agro_user', JSON.stringify(authUser));
      localStorage.setItem('agro_auth_token', 'dev-token-' + btoa(JSON.stringify({ email: authUser.email, role: authUser.role, name: authUser.name })));
    } catch (e) {
      console.error(e);
    }
    return { success: true };
  }

  async function loginWithGoogle() {
    if (!isFirebaseReady || !fbAuth || !googleProvider) {
      return { success: false, error: 'Firebase is not configured yet with valid credentials.' };
    }
    try {
      const result = await signInWithPopup(fbAuth, googleProvider);
      const fbUser = result.user;
      const token = await fbUser.getIdToken();
      localStorage.setItem('agro_auth_token', token);

      const cleanEmail = (fbUser.email || '').toLowerCase();
      const profile = usersList.find(u => u.email.toLowerCase() === cleanEmail);

      const authUser: AuthUser = {
        email: cleanEmail,
        name: fbUser.displayName || 'Google User',
        role: profile?.role || 'farmer',
        district: profile?.district || 'Bengaluru Urban',
        status: 'Verified',
        registeredAt: profile?.registeredAt || new Date().toISOString().split('T')[0],
      };
      setUser(authUser);
      localStorage.setItem('agro_user', JSON.stringify(authUser));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google Sign-In failed' };
    }
  }

  function logout() {
    if (isFirebaseReady && fbAuth) {
      fbSignOut(fbAuth).catch(() => {});
    }
    setUser(null);
    try {
      localStorage.removeItem('agro_user');
      localStorage.removeItem('agro_auth_token');
    } catch (e) {
      console.error(e);
    }
  }

  function getUsers(role?: UserRole): AuthUser[] {
    const list = role ? usersList.filter((u) => u.role === role) : usersList;
    return list.map(({ email, name, role, district, taluk, village, pincode, phone, status, registeredAt }) => ({
      email,
      name,
      role,
      district,
      taluk,
      village,
      pincode,
      phone,
      status: status || 'Verified',
      registeredAt,
    }));
  }

  function updateUserStatus(email: string, status: UserStatus) {
    setUsersList((prev) =>
      prev.map((u) => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, status } : u))
    );
    api.put(`/users/${encodeURIComponent(email)}/status`, { status }).catch(() => {});
  }

  function updateUserDetails(email: string, details: Partial<AuthUser>) {
    setUsersList((prev) =>
      prev.map((u) => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, ...details } : u))
    );
    api.put(`/users/${encodeURIComponent(email)}`, details).catch(() => {});
  }

  function deleteUser(email: string) {
    setUsersList((prev) => prev.filter((u) => u.email.toLowerCase() !== email.toLowerCase()));
    api.delete(`/users/${encodeURIComponent(email)}`).catch(() => {});
  }

  async function sendOtp(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    // Generate a local fallback OTP
    const localOtp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const res = await api.post('/auth/send-otp', { email: cleanEmail });
      // Backend returned successfully — save the OTP it generated
      const backendOtp = res.data?.otp || localOtp;
      try {
        localStorage.setItem('agro_otp_' + cleanEmail, backendOtp);
        localStorage.setItem('agro_otp_time_' + cleanEmail, Date.now().toString());
      } catch (e) {}
      return {
        success: true,
        message: res.data?.message || `Verification code sent to ${cleanEmail}! Please check your email inbox and spam folder.`,
        otp: backendOtp
      };
    } catch (err: any) {
      // Backend unavailable — use local fallback OTP
      console.warn('Backend OTP send failed, using local fallback:', err.message);
      try {
        localStorage.setItem('agro_otp_' + cleanEmail, localOtp);
        localStorage.setItem('agro_otp_time_' + cleanEmail, Date.now().toString());
      } catch (e) {}
      return {
        success: true,
        message: `Verification code generated! (Backend offline — enter code: ${localOtp})`,
        otp: localOtp
      };
    }
  }

  async function verifyOtp(email: string, otp: string) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      return { success: false, error: 'Please enter the 6-digit verification code' };
    }

    // Try backend verification first
    try {
      const res = await api.post('/auth/verify-otp', { email: cleanEmail, otp: cleanOtp });
      if (res.data && res.data.success !== false) {
        return {
          success: true,
          message: res.data?.message || 'Email verified successfully!'
        };
      }
      // Backend returned but success was false
      return { success: false, error: res.data?.message || 'Invalid verification code.' };
    } catch (err: any) {
      // Backend call failed — try local verification
      const storedOtp = localStorage.getItem('agro_otp_' + cleanEmail);
      if (storedOtp && storedOtp === cleanOtp) {
        return { success: true, message: 'Email verified successfully!' };
      }
      // Master test code
      if (cleanOtp === '123456') {
        return { success: true, message: 'Email verified successfully!' };
      }
      const detail = err.response?.data?.detail || 'Invalid or expired verification code.';
      return { success: false, error: detail };
    }
  }

  async function resetPassword(email: string, otp: string, newPassword: string) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      return { success: false, error: 'Please enter the 6-digit verification code' };
    }
    if (newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    const storedOtp = localStorage.getItem('agro_otp_' + cleanEmail);
    const isValidLocal = (storedOtp && storedOtp === cleanOtp) || cleanOtp === '123456';

    try {
      const res = await api.post('/auth/reset-password', {
        email: cleanEmail,
        otp: cleanOtp,
        new_password: newPassword,
      });
      if (res.data?.success) {
        setUsersList((prev) =>
          prev.map((u) => (u.email.toLowerCase() === cleanEmail ? { ...u, password: newPassword } : u))
        );
        return { success: true, message: res.data.message || 'Password reset successfully!' };
      }
    } catch (err: any) {
      if (isValidLocal) {
        setUsersList((prev) =>
          prev.map((u) => (u.email.toLowerCase() === cleanEmail ? { ...u, password: newPassword } : u))
        );
        return { success: true, message: 'Password updated successfully! Please sign in with your new password.' };
      }
      const detail = err.response?.data?.detail || 'Failed to reset password. Please check your verification code.';
      return { success: false, error: detail };
    }

    setUsersList((prev) =>
      prev.map((u) => (u.email.toLowerCase() === cleanEmail ? { ...u, password: newPassword } : u))
    );
    return { success: true, message: 'Password reset successfully!' };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        signup,
        logout,
        getUsers,
        updateUserStatus,
        updateUserDetails,
        sendOtp,
        verifyOtp,
        resetPassword,
        deleteUser,
        isFirebaseActive: isFirebaseReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
