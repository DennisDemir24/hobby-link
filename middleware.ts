import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};


/* 

import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { checkUser } from "@/lib/checkUser";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    // Add other public routes here
  ],
  
  async afterAuth(auth, req) {
    // Skip for public routes or unauthenticated users
    if (!auth.userId || auth.isPublicRoute) {
      return NextResponse.next();
    }
    
    // For authenticated users, ensure they exist in the database
    try {
      await checkUser();
    } catch (error) {
      console.error("Error in middleware checkUser:", error);
      // Optionally handle errors
    }
    
    // Continue to the requested page
    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

*/