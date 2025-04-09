
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { 
  Home, 
  FileText, 
  Users, 
  ShoppingBag, 
  Settings, 
  BarChart4,
  HelpCircle
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Home, showFor: ['admin', 'vendor'] },
    { name: 'Tenders', href: '/tenders', icon: FileText, showFor: ['admin', 'vendor'] },
    { name: 'My Bids', href: '/my-bids', icon: ShoppingBag, showFor: ['vendor'] },
    { name: 'Vendors', href: '/vendors', icon: Users, showFor: ['admin'] },
    { name: 'Reports', href: '/reports', icon: BarChart4, showFor: ['admin'] },
    { name: 'Settings', href: '/settings', icon: Settings, showFor: ['admin', 'vendor'] },
    { name: 'Help', href: '/help', icon: HelpCircle, showFor: ['admin', 'vendor'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.showFor.includes(user?.role as string)
  );

  return (
    <div className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground">
      <div className="p-4 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-white text-sidebar flex items-center justify-center font-bold">
            TMS
          </div>
          <span className="text-xl font-bold">TenderFlow</span>
        </div>
      </div>

      <div className="p-3">
        <div className="bg-sidebar-accent/20 rounded-lg p-3">
          <div className="text-sm opacity-70 mb-2">
            Logged in as
          </div>
          <div className="font-medium mb-1">
            {user?.name}
          </div>
          <div className="text-sm bg-sidebar-accent/30 inline-block px-2 py-0.5 rounded capitalize">
            {user?.role}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) => cn(
              "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
              isActive 
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="text-center text-sm opacity-70">
          TenderFlow v1.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
