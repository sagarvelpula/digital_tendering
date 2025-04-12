
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

type Role = "admin" | "vendor" | null;

interface RoleBasedProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  fallbackPath?: string;
}

export const RoleBasedAccess: React.FC<RoleBasedProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/dashboard'
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Still loading authentication state
  if (isLoading) {
    return <div className="flex justify-center p-8">Loading access permissions...</div>;
  }

  // Not authenticated at all
  if (!isAuthenticated || !user) {
    toast({
      title: "Authentication required",
      description: "Please sign in to access this page",
      variant: "destructive",
    });
    return <Navigate to="/login" replace />;
  }

  // Has a role that's allowed
  if (user.role && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // Has a role that's not allowed
  toast({
    title: "Access denied",
    description: "You don't have permission to access this resource",
    variant: "destructive",
  });
  return <Navigate to={fallbackPath} replace />;
};

export default RoleBasedAccess;
