'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Drawer, IconButton, List, ListItem, Box } from '@mui/material'
import { Menu as MenuIcon, Close as CloseIcon, Dashboard, Add, Settings, Message, Visibility, VideoLibrary } from '@mui/icons-material'

interface AdminNavigationProps {
  className?: string
}

export default function AdminNavigation({ className = '' }: AdminNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const navigationItems = [
    { href: '/', label: 'Dashboard', icon: <Dashboard /> },
    { href: '/products/add', label: 'Add New Goat', icon: <Add /> },
    { href: '/videos', label: 'Video Management', icon: <VideoLibrary /> },
    { href: '/settings', label: 'Settings', icon: <Settings /> },
  ]

  const isActive = (href: string) => pathname === href

  const drawer = (
    <Box sx={{ width: 280 }} role="presentation">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center">
          <img src="/logo.jpeg" alt="Zohan Goat Farm Logo" className="h-8 w-8 rounded-full object-cover mr-2" />
          <span className="text-lg font-bold text-white">
            Admin Panel
          </span>
        </div>
        <IconButton onClick={handleDrawerToggle} className="text-white">
          <CloseIcon />
        </IconButton>
      </div>
      <List className="pt-4">
        {navigationItems.map((item) => (
          <ListItem key={item.href} className="px-6 py-2">
            <Link 
              href={item.href} 
              className={`w-full flex items-center py-3 px-4 rounded-lg text-base font-medium transition-all ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700 font-semibold'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600'
              }`}
              onClick={handleDrawerToggle}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          </ListItem>
        ))}
      </List>
      
      {/* Admin Info in Drawer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-t">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">🔐 Admin Access</p>
          <p className="text-xs text-gray-500">Zohan Goat Farm Management</p>
        </div>
      </div>
    </Box>
  )

  return (
    <>
      <nav className={`bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg sticky top-0 z-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img src="/logo.jpeg" alt="Zohan Goat Farm Logo" className="h-10 w-10 rounded-full object-cover mr-3" />
              <div className="text-xl md:text-2xl font-bold text-white">
                Zohan Goat Farm - Admin
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <div className="ml-10 flex items-baseline space-x-6">
                {navigationItems.map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className={`flex items-center px-4 py-2 rounded-lg text-base font-semibold transition-all transform hover:scale-105 ${
                      isActive(item.href)
                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                <Link 
                  href="http://localhost:3000" 
                  target="_blank"
                  className="flex items-center px-4 py-2 rounded-lg text-base font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-all transform hover:scale-105"
                >
                  <span className="mr-2"><Visibility /></span>
                  View Public Site
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <IconButton
                onClick={handleDrawerToggle}
                className="text-white hover:bg-white/10 p-2"
                size="large"
              >
                <MenuIcon fontSize="large" />
              </IconButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            background: 'linear-gradient(135deg, #eff6ff 0%, #f3e8ff 50%, #ffffff 100%)'
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  )
}
