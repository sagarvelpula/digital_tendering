
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTender } from '@/context/TenderContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart4, Calendar, CheckCircle2, FileText, TrendingUp, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import VendorDashboard from '@/components/dashboard/VendorDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">
          {isAdmin 
            ? "Here's an overview of all tender activity."
            : "Here's an overview of your bidding activity and recommended tenders."
          }
        </p>
      </div>

      {isAdmin ? <AdminDashboard /> : <VendorDashboard />}
    </div>
  );
};

export default Dashboard;
