'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { Menu, X, Heart, Puzzle, Users, ChevronRight } from 'lucide-react'

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Discover', href: '/discover' },
    { name: 'Community', href: '#community' },
    /* { name: 'Pricing', href: '#pricing' }, */
    /* { name: 'Blog', href: '/blog' }, */
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                HobbyLink
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 rounded-md transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" className="text-gray-700 hover:text-indigo-600 border border-indigo-100 cursor-pointer">
              Log in
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">
              Sign up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Menu className="h-6 w-6 text-gray-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[350px] p-0 border-l border-indigo-100">
                <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50">
                  {/* Mobile Menu Header */}
                  <div className="p-6 flex items-center justify-between border-b border-indigo-50">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      HobbyLink
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-full hover:bg-gray-100"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </Button>
                  </div>

                  {/* Mobile Menu Links */}
                  <div className="flex-1 overflow-auto py-6">
                    <nav className="flex flex-col space-y-1 px-6 mb-8">
                      {navLinks.map((link) => (
                        <Link
                          key={link.name}
                          href={link.href}
                          className="flex items-center justify-between px-4 py-3.5 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span>{link.name}</span>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </Link>
                      ))}
                    </nav>

                    {/* Feature Highlights in Mobile Menu */}
                    <div className="px-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 px-4">
                        Why people love HobbyLink
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-4 rounded-xl bg-white border border-indigo-50 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-xl mr-4">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Community</p>
                            <p className="text-xs text-gray-500 mt-0.5">Join enthusiast groups</p>
                          </div>
                        </div>
                        <div className="flex items-center p-4 rounded-xl bg-white border border-indigo-50 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-center w-10 h-10 bg-pink-50 rounded-xl mr-4">
                            <Heart className="w-5 h-5 text-pink-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Connections</p>
                            <p className="text-xs text-gray-500 mt-0.5">Meet like-minded people</p>
                          </div>
                        </div>
                        <div className="flex items-center p-4 rounded-xl bg-white border border-indigo-50 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-xl mr-4">
                            <Puzzle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Discovery</p>
                            <p className="text-xs text-gray-500 mt-0.5">Explore new hobbies</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Menu Footer */}
                  <div className="p-6 space-y-3 border-t border-indigo-50 bg-white">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 h-auto shadow-lg shadow-indigo-200 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-200">
                      Sign up for free
                    </Button>
                    <Button variant="outline" className="w-full rounded-xl py-6 h-auto border-gray-200 hover:bg-gray-50 hover:border-gray-300">
                      Log in to account
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}