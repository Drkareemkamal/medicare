import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Phone, MapPin, Heart, Droplets, User } from 'lucide-react'

interface PageProps {
  params: { employeeId: string }
}

export default async function EmergencyPage({ params }: PageProps) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: params.employeeId }
  })

  if (!profile) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Emergency Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Medical Emergency Information</h1>
          <p className="text-red-600 font-semibold text-lg">
            ⚠️ EMERGENCY USE ONLY - For Life-Threatening Situations
          </p>
          <p className="text-sm text-gray-600 mt-2">
            This information is confidential and should only be accessed in medical emergencies
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Basic identification details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-lg font-semibold text-gray-900">{profile.name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Payroll Number</label>
                    <p className="text-lg font-mono bg-gray-100 px-2 py-1 rounded">{profile.payroll}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="text-lg">{profile.dob.toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Age</label>
                    <p className="text-lg">
                      {new Date().getFullYear() - profile.dob.getFullYear()} years old
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Position</label>
                    <p className="text-lg">{profile.position}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <p className="text-lg">{profile.department}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Photo Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Photo</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={`${profile.name} photo`}
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Critical Medical Information */}
        <div className="mt-6">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-900">
                <Heart className="w-5 h-5" />
                Critical Medical Information
              </CardTitle>
              <CardDescription>Essential medical details for emergency response</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Blood Group */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-5 h-5 text-red-600" />
                    <label className="text-sm font-medium text-red-900">Blood Group</label>
                  </div>
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    {profile.bloodGroup || 'Not Specified'}
                  </Badge>
                </div>

                {/* Chronic Diseases */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <label className="text-sm font-medium text-orange-900">Chronic Diseases</label>
                  </div>
                  <p className="text-lg font-medium">
                    {profile.chronicDisease || 'None reported'}
                  </p>
                </div>

                {/* Special Habits */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-yellow-600" />
                    <label className="text-sm font-medium text-yellow-900">Special Habits</label>
                  </div>
                  <p className="text-lg">
                    {profile.specialHabit || 'None reported'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="mt-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Phone className="w-5 h-5" />
                Emergency Contact Information
              </CardTitle>
              <CardDescription>Contact details for emergency situations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Mobile Number
                  </label>
                  <p className="text-xl font-mono bg-green-100 px-3 py-2 rounded border">
                    {profile.mobile}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </label>
                  <p className="text-lg leading-relaxed">
                    {profile.address}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Notes */}
        {profile.note && (
          <div className="mt-6">
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <AlertTriangle className="w-5 h-5" />
                  Emergency Notes
                </CardTitle>
                <CardDescription>Additional medical information and instructions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    {profile.note}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Privacy and Legal Notice */}
        <div className="mt-8">
          <Card className="border-2 border-yellow-300 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                    ⚠️ Important Privacy Notice
                  </h3>
                  <div className="text-sm text-yellow-800 space-y-2">
                    <p>
                      <strong>This page contains confidential medical information</strong> intended
                      <strong>only for emergency medical situations</strong> where immediate access
                      to critical health information is required to save a life.
                    </p>
                    <p>
                      Access to this page is monitored and logged for security and compliance purposes.
                      Unauthorized access or misuse of this information may result in legal consequences.
                    </p>
                    <p>
                      If you are not a medical professional responding to an emergency involving this individual,
                      please close this page immediately and contact emergency services if needed.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Actions */}
        <div className="mt-6 text-center">
          <div className="bg-red-600 text-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">🚨 Emergency Actions</h3>
            <p className="mb-3">If this is a medical emergency:</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`tel:${profile.mobile}`}
                className="inline-flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition-colors"
              >
                📞 Call {profile.name}
              </a>
              <a
                href="tel:911"
                className="inline-flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-400 transition-colors"
              >
                🚑 Call Emergency Services
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: params.employeeId }
  })

  return {
    title: `Emergency Info - ${profile?.name || 'Employee'}`,
    description: 'Medical emergency information - For emergency use only',
    robots: 'noindex, nofollow'
  }
}
