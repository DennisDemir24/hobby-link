"use client";

import { Button } from "@/components/ui/button";
import { CreateCommunityModal } from "@/components/modals/CreateCommunityModal";

interface CommunityModalWrapperProps {
  hobbyId?: string;
  variant?: "default" | "outline";
  className?: string;
  buttonText?: string;
}

export function CommunityModalWrapper({ 
  hobbyId = "", 
  variant = "default",
  className = "",
  buttonText = "Create a Community"
}: CommunityModalWrapperProps) {
  return (
    <CreateCommunityModal hobbyId={hobbyId}>
      <Button variant={variant} className={className}>
        {buttonText}
      </Button>
    </CreateCommunityModal>
  );
} 