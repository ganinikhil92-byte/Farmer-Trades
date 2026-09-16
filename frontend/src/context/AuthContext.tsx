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

// Initial default seed users across Karnataka
const DEFAULT_USERS: StoredUser[] = [
  { email: 'nikhilgani987@gmail.com', password: 'Nikhil@2005', name: 'Nikhil Gani', role: 'admin', district: 'Bengaluru Urban', taluk: 'Bengaluru South', village: 'Jayanagar', pincode: '560041', phone: '8660416257', status: 'Verified', registeredAt: '2026-08-01' },
  { email: 'nikhilgani293@gmail.com', password: 'Nikhil@2005', name: 'Nikhil Farmer', role: 'farmer', district: 'Vijayapura', taluk: 'Vijayapura', village: 'Tikota', pincode: '586130', phone: '8660416257', status: 'Verified', registeredAt: '2026-08-01' },
  { email: 'admin@agro.com', password: 'Admin@123', name: 'Admin Officer', role: 'admin', status: 'Verified', registeredAt: '2026-08-01' },
  { email: 'farmer@agro.com', password: 'Farmer@123', name: 'Ramesh Gowda', role: 'farmer', district: 'Bengaluru Urban', taluk: 'Bengaluru North', village: 'Jakkur', pincode: '560064', phone: '9845012345', status: 'Verified', registeredAt: '2026-08-15' },
  { email: 'patil@agro.com', password: 'Farmer@123', name: 'Basavaraj Patil', role: 'farmer', district: 'Belagavi', taluk: 'Athani', village: 'Hulagabal', pincode: '591304', phone: '9845023456', status: 'Pending', registeredAt: '2026-09-02' },
  { email: 'ningappa@agro.com', password: 'Farmer@123', name: 'Ningappa Hegde', role: 'farmer', district: 'Shivamogga', taluk: 'Sagar', village: 'Anandapura', pincode: '577412', phone: '9845034567', status: 'Verified', registeredAt: '2026-09-05' },
  { email: 'buyer@agro.com', password: 'Buyer@123', name: 'Suresh Kumar (Mysuru Traders)', role: 'buyer', district: 'Mysuru', taluk: 'Mysuru', village: 'Jayalakshmipuram', pincode: '570012', phone: '9845045678', status: 'Verified', registeredAt: '2026-08-20' },
  { email: 'trader@agro.com', password: 'Buyer@123', name: 'Hubballi Wholesale APMC', role: 'buyer', district: 'Dharwad', taluk: 'Hubballi Urban', village: 'APMC Yard', pincode: '580025', phone: '9845056789', status: 'Verified', registeredAt: '2026-09-01' },
  { email: 'retail@agro.com', password: 'Buyer@123', name: 'Bangalore Fresh Mart', role: 'buyer', district: 'Bengaluru Urban', taluk: 'Bengaluru South', village: 'Jayanagar', pincode: '560041', phone: '9845067890', status: 'Pending', registeredAt: '2026-09-08' },
];

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem('agro_users_store');
    if (raw) {
      const parsed: StoredUser[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const adminIdx = parsed.findIndex((u) => u.email.toLowerCase() === 'nikhilgani987@gmail.com');
        if (adminIdx === -1) {
          parsed.unshift(DEFAULT_USERS[0]);
        } else {
          parsed[adminIdx].password = 'Nikhil@2005';
          parsed[adminIdx].role = 'admin';
        }
        const farmerIdx = parsed.findIndex((u) => u.email.toLowerCase() === 'nikhilgani293@gmail.com');
        if (farmerIdx === -1) {
          parsed.push(DEFAULT_USERS[1]);
        } else {
          parsed[farmerIdx].password = 'Nikhil@2005';
          parsed[farmerIdx].role = 'farmer';
        }
        return parsed;
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

// PRD password rules
function validatePassword(pw: string): string | null {
  if (pw.length < 8) return 'Password must be at least 8 characters';
  if (!/^[A-Z]/.test(pw)) return 'Password must start with an uppercase letter (A‑Z)';
  if (!/[!@#$%^&*]/.test(pw)) return 'Password must contain a special character (!@#$%^&*)';
  if (!/\d/.test(pw)) return 'Password must contain at least one digit';
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
        // If wrong password explicitly from Firebase, return error
        if (fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/invalid-credential') {
          // Check if local seed user has this credential
          const found = usersList.find((u) => u.email.toLowerCase() === cleanEmail && u.password === password);
          if (!found) {
            return { success: false, error: 'Invalid email or password. Please verify your credentials.' };
          }
        }
      }
    }

    // 2. Attempt backend database login
    try {
      const res = await api.post('/auth/login', { email: cleanEmail, password });
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
      if (err.response && err.response.data && err.response.data.detail) {
        return { success: false, error: err.response.data.detail };
      }
    }

    // 3. Offline fallback
    const found = usersList.find((u) => u.email.toLowerCase() === cleanEmail && u.password === password);
    if (!found) {
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
      return { success: false, error: 'Invalid email or password. Please verify your credentials.' };
    }
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
    try {
      localStorage.setItem('agro_user', JSON.stringify(authUser));
      localStorage.setItem('agro_auth_token', 'dev-token-' + btoa(JSON.stringify({ email: authUser.email, role: authUser.role, name: authUser.name })));
    } catch (e) {
      console.error(e);
    }
    return { success: true };
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

    // 1. Attempt Firebase Auth registration if active
    if (isFirebaseReady && fbAuth) {
      try {
        const userCred = await createUserWithEmailAndPassword(fbAuth, cleanEmail, password);
        const fbToken = await userCred.user.getIdToken();
        localStorage.setItem('agro_auth_token', fbToken);

        // Sync with backend API
        api.post('/auth/register', {
          name: name.trim(),
          email: cleanEmail,
          password,
          role,
          district,
          taluk,
          village,
          pincode,
          phone
        }).catch(() => {});

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
        setUser(authUser);
        localStorage.setItem('agro_user', JSON.stringify(authUser));

        const newUser: StoredUser = { ...authUser, password };
        const updated = [...usersList.filter(u => u.email.toLowerCase() !== cleanEmail), newUser];
        setUsersList(updated);
        saveStoredUsers(updated);

        return { success: true };
      } catch (fbErr: any) {
        if (fbErr.code === 'auth/email-already-in-use') {
          return { success: false, error: 'An account with this email already exists in Firebase.' };
        }
        console.warn('[Firebase Auth] Signup notice:', fbErr.message);
      }
    }

    // 2. Attempt backend registration
    try {
      const res = await api.post('/auth/register', {
        name: name.trim(),
        email: cleanEmail,
        password,
        role,
        district,
        taluk,
        village,
        pincode,
        phone
      });
      if (res.data && res.data.success) {
        if (res.data.token) {
          localStorage.setItem('agro_auth_token', res.data.token);
        }
        const authUser: AuthUser = res.data.user;
        setUser(authUser);
        localStorage.setItem('agro_user', JSON.stringify(authUser));
        return { success: true };
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        return { success: false, error: err.response.data.detail };
      }
    }

    // 3. Offline fallback
    if (usersList.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Email already registered' };
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
    try {
      const res = await api.post('/auth/send-otp', { email: cleanEmail });
      return {
        success: true,
        message: res.data?.message || `Verification code sent to ${cleanEmail}`,
        otp: res.data?.otp
      };
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Failed to send verification code. Please check your connection.';
      return { success: false, error: detail };
    }
  }

  async function verifyOtp(email: string, otp: string) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      return { success: false, error: 'Please enter the 6-digit verification code' };
    }
    try {
      const res = await api.post('/auth/verify-otp', { email: cleanEmail, otp: cleanOtp });
      return {
        success: true,
        message: res.data?.message || 'Email verified successfully!'
      };
    } catch (err: any) {
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
