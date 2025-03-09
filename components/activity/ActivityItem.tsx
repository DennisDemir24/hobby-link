import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

// Icons for different activity types
import { MessageSquare, Users, FileText, Bell, Heart } from "lucide-react";

// Import the Activity type
import { Activity } from "./types";

interface ActivityItemProps {
  activity: Activity;
  compact?: boolean;
}

export default function ActivityItem({ activity, compact = false }: ActivityItemProps) {
  const getActivityIcon = () => {
    switch (activity.type) {
      case "post_created":
        return <FileText className={`${compact ? "h-3 w-3" : "h-4 w-4"}`} />;
      case "post_commented":
        return <MessageSquare className={`${compact ? "h-3 w-3" : "h-4 w-4"}`} />;
      case "post_liked":
        return <Heart className={`${compact ? "h-3 w-3" : "h-4 w-4"}`} />;
      case "user_joined":
        return <Users className={`${compact ? "h-3 w-3" : "h-4 w-4"}`} />;
      default:
        return <Bell className={`${compact ? "h-3 w-3" : "h-4 w-4"}`} />;
    }
  };

  const getActivityLink = () => {
    if (activity.postId) {
      return `/community/${activity.communityId}/post/${activity.postId}`;
    }
    if (activity.communityId) {
      return `/community/${activity.communityId}`;
    }
    return "#";
  };

  const getActivityColor = () => {
    switch (activity.type) {
      case "post_created":
        return "bg-blue-50 text-blue-600";
      case "post_commented":
        return "bg-green-50 text-green-600";
      case "post_liked":
        return "bg-pink-50 text-pink-600";
      case "user_joined":
        return "bg-purple-50 text-purple-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  return (
    <div className={`flex items-start gap-3 ${compact ? "p-2" : "p-3"} rounded-lg ${!compact && "border"} hover:bg-muted/50 transition-colors`}>
      {activity.user ? (
        <Avatar className={compact ? "h-8 w-8" : "h-10 w-10"}>
          <AvatarImage src={activity.user.imageUrl || ""} alt={activity.user.name || ""} />
          <AvatarFallback>{getInitials(activity.user.name)}</AvatarFallback>
        </Avatar>
      ) : (
        <div className={`${compact ? "h-8 w-8" : "h-10 w-10"} rounded-full ${getActivityColor()} flex items-center justify-center`}>
          {getActivityIcon()}
        </div>
      )}
      
      <div className="flex-1 space-y-1">
        <Link href={getActivityLink()} className="hover:underline">
          <p className={`${compact ? "text-xs" : "text-sm"} font-medium`}>{activity.content}</p>
        </Link>
        
        {activity.community && (
          <Link href={`/community/${activity.community.id}`} className={`${compact ? "text-[10px]" : "text-xs"} text-muted-foreground hover:underline`}>
            in {activity.community.name}
          </Link>
        )}
        
        <p className={`${compact ? "text-[10px]" : "text-xs"} text-muted-foreground`}>
          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
} 