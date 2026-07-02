import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { teamMembers } from '@/data/mockData';
import type { TeamMember } from '@/types';

interface AuthUser {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  userRole: 'admin' | 'member';
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (phone: string, password: string) => { ok: boolean; error?: string };
  register: (name: string, phone: string, password: string, code: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'gitweave_auth_user';

function toAuthUser(m: TeamMember): AuthUser {
  return { id: m.id, name: m.name, initials: m.initials, color: m.color, role: m.role, userRole: m.userRole };
}

function loadUser(): AuthUser | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as AuthUser) : null;
  } catch {
    return null;
  }
}

// 可登录用户池（内存中可被注册扩充）
let userPool: TeamMember[] = [...teamMembers];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser);

  const login = useCallback((phone: string, password: string): { ok: boolean; error?: string } => {
    const found = userPool.find((m) => m.phone === phone.trim());
    if (!found) return { ok: false, error: '该手机号未注册' };
    if (found.password !== password) return { ok: false, error: '密码错误' };
    const authUser = toAuthUser(found);
    setUser(authUser);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser)); } catch { /* ignore */ }
    return { ok: true };
  }, []);

  const register = useCallback((name: string, phone: string, password: string, code: string): { ok: boolean; error?: string } => {
    if (!name.trim()) return { ok: false, error: '请输入姓名' };
    if (!/^1\d{10}$/.test(phone.trim())) return { ok: false, error: '请输入有效的手机号' };
    if (password.length < 6) return { ok: false, error: '密码至少 6 位' };
    const expected = phone.trim().slice(-4);
    if (code.trim() !== expected) return { ok: false, error: `验证码应为手机号后四位：${expected}` };
    if (userPool.some((m) => m.phone === phone.trim())) return { ok: false, error: '该手机号已注册' };

    const id = `u${Date.now()}`;
    const initials = name.trim().slice(0, 2);
    const newMember: TeamMember = {
      id,
      name: name.trim(),
      avatar: '/team-avatars.png',
      role: '普通成员',
      initials,
      color: '#6366f1',
      userRole: 'member',
      status: 'active',
      joinedAt: new Date().toISOString().split('T')[0],
      phone: phone.trim(),
      password,
    };
    userPool = [...userPool, newMember];
    const authUser = toAuthUser(newMember);
    setUser(authUser);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser)); } catch { /* ignore */ }
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}