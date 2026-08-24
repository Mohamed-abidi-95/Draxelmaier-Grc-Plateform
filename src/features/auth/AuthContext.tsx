import React, { createContext, useContext, useState, useEffect } from 'react';
import { parseJwt } from '../../lib/authUtils';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  organizationId: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, email: string, firstName: string, lastName: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));

  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        // Extract roles which can be an array or a single string depending on claims
        const rolesClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
        const roles = Array.isArray(rolesClaim) ? rolesClaim : rolesClaim ? [rolesClaim] : [];
        
        setUser({
          id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.sub,
          email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.name || '',
          firstName: decoded.firstName || '', // Often in custom claims
          lastName: decoded.lastName || '',
          roles: roles,
          organizationId: decoded.OrganizationId,
        });
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken: string, _email: string, _firstName: string, _lastName: string) => {
    localStorage.setItem('jwt_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
