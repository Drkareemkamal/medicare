'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, User, FileText, Settings, LogOut } from 'lucide-react'

interface User {
  id: string
  email: string
  role: 'EMPLOYEE' | 'ADMIN'
  profile?: {
    name: string
    payroll: string
    position: string
    department: string
    bloodGroup: string
    mobile: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)

        // Redirect admin to admin panel
        if (userData.role === 'ADMIN') {
          router.push('/admin')
          return
        }
      } else {
        router.push('/')
      }
    } catch (error) {
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.profile?.name || user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {user.role}
            </Badge>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payroll ID</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.profile?.payroll || 'N/A'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Department</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.profile?.department || 'N/A'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Position</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.profile?.position || 'N/A'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Profile Management
              </CardTitle>
              <CardDescription>View and edit your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Medical Documents
              </CardTitle>
              <CardDescription>Upload and manage your medical documents</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Manage Documents
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Account Settings
              </CardTitle>
              <CardDescription>Update your account preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Information Section */}
        <div className="mt-8">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-900">
                <Shield className="w-5 h-5" />
                Emergency Information
              </CardTitle>
              <CardDescription>Your emergency contact information and medical details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Blood Group</label>
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    {user.profile?.bloodGroup || 'Not specified'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                  <p className="text-lg font-mono bg-gray-100 px-3 py-2 rounded">
                    {user.profile?.mobile || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Emergency URL:</strong>{' '}
                  <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                    /e/{user.id}
                  </code>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Share this URL with emergency contacts for quick access to your medical information
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}