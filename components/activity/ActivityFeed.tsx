"use client";

import { useEffect, useState } from "react";
import { getUserActivityFeed } from "@/lib/actions/activity.action";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ActivityItem from "./ActivityItem";

// Import the Activity type from ActivityItem
import type { Activity } from "./types";

interface ActivityFeedResult {
  activities: Activity[];
  totalPages: number;
  currentPage: number;
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchActivities = async (pageNum = 1) => {
    setLoading(true);
    try {
      const result = await getUserActivityFeed(10, pageNum) as ActivityFeedResult;
      setActivities(pageNum === 1 ? result.activities : [...activities, ...result.activities]);
      setTotalPages(result.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const loadMore = () => {
    if (page < totalPages) {
      fetchActivities(page + 1);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Activity Feed</h2>
      
      <div className="space-y-3">
        {loading && page === 1 ? (
          // Loading skeletons
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
        ) : activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No activities to show. Join communities to see updates!
          </div>
        )}
        
        {loading && page > 1 && (
          <div className="flex justify-center py-4">
            <Skeleton className="h-10 w-24" />
          </div>
        )}
        
        {page < totalPages && !loading && (
          <div className="flex justify-center pt-2">
            <Button variant="outline" onClick={loadMore}>
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 