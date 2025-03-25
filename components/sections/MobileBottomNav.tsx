"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Users, MessageSquare, User } from 'lucide-react';
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Navigation items with icons
  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      public: true
    },
    {
      name: 'Discover',
      href: '/discover',
      icon: Search,
      public: true
    },
    {
      name: 'Community',
      href: '/community',
      icon: Users,
      public: true
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: MessageSquare,
      public: false // Only for signed-in users
    },
    {
      name: 'Profile',
      href: '/dashboard',
      icon: User,
      public: false // Only for signed-in users
    }
  ];

  // Public navigation items for signed-out users
  const publicNavItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home
    },
    {
      name: 'Discover',
      href: '/discover',
      icon: Search
    },
    {
      name: 'Community',
      href: '/community',
      icon: Users
    },
    {
      name: 'Sign In',
      href: '/sign-in',
      icon: User
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-md">
      <SignedIn>
        <nav className="flex justify-around items-center h-16">
          {navItems.filter(item => item.public || !item.public).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full px-2 py-1",
                  isActive ? "text-indigo-600" : "text-gray-500 hover:text-indigo-500"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 mb-1",
                  isActive ? "text-indigo-600" : "text-gray-500"
                )} />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </SignedIn>

      <SignedOut>
        <nav className="flex justify-around items-center h-16">
          {publicNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full px-2 py-1",
                  isActive ? "text-indigo-600" : "text-gray-500 hover:text-indigo-500"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 mb-1",
                  isActive ? "text-indigo-600" : "text-gray-500"
                )} />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </SignedOut>
    </div>
  );
} 