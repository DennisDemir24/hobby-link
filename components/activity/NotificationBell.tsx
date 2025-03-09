"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { getUnreadActivities, markAllActivitiesAsRead } from "@/lib/actions/activity.action";
import ActivityItem from "./ActivityItem";
import { Activity, UnreadActivitiesResult } from "./types";

export default function NotificationBell() {
  const [unreadActivities, setUnreadActivities] = useState<Activity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const hasInitialized = useRef(false);

  const fetchUnreadActivities = async () => {
    try {
      const result = await getUnreadActivities() as UnreadActivitiesResult;
      setUnreadActivities(result.activities);
      setUnreadCount(result.totalUnread);
    } catch (error) {
      console.error("Error fetching unread activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasInitialized.current) {
      fetchUnreadActivities();
      hasInitialized.current = true;
    }

    // Set up polling for new notifications (every 30 seconds)
    const intervalId = setInterval(() => {
      if (!open) { // Only poll when dropdown is closed
        fetchUnreadActivities();
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    
    // When opening the popover, mark all as read
    if (newOpen && unreadCount > 0) {
      markAllActivitiesAsRead().then(() => {
        setUnreadCount(0);
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-full hover:bg-gray-100"
        >
          <Bell className="h-5 w-5 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 max-h-[400px] overflow-hidden flex flex-col" 
        align="end"
      >
        <div className="p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {loading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
          ) : unreadActivities.length > 0 ? (
            unreadActivities.map((activity) => (
              <ActivityItem 
                key={activity.id} 
                activity={activity} 
                compact={true} 
              />
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No new notifications
            </div>
          )}
        </div>
        
        <div className="p-2 border-t text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-muted-foreground w-full"
            onClick={() => window.location.href = "/dashboard"}
          >
            View all activity
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
} 