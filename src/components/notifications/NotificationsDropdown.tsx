
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check, Clock, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { fetchNotifications, markNotificationAsRead } from '@/lib/supabase/users';
import { cn } from '@/lib/utils';

export type Notification = {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  user_id: string;
};

export const NotificationsDropdown = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => fetchNotifications(user?.id || ''),
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    const count = notifications.filter(
      (notification: Notification) => !notification.is_read
    ).length;
    setUnreadCount(count);
  }, [notifications]);

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMin = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMin < 60) {
      return `${diffInMin} min${diffInMin !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 md:w-96" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[300px] overflow-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Clock className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification: Notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start p-3",
                  !notification.is_read && "bg-blue-50 dark:bg-blue-900/20"
                )}
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex w-full justify-between items-start">
                  <span className="text-sm font-medium">
                    {notification.message}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={() => handleMarkAsRead(notification.id)}
                    disabled={notification.is_read}
                  >
                    {notification.is_read ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(notification.created_at)}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
