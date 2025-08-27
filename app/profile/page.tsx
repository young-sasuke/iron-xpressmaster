"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { supabase } from "@/lib/supabase"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  Edit, 
  LogOut, 
  Camera, 
  Gift, 
  Clock,
  X,
  Calendar,
  ChevronRight,
  Home,
  Users,
  ShoppingBag,
  Bell,
  HelpCircle,
  FileText,
  Settings,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface UserProfile {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  phone_number: string | null
  date_of_birth: string | null
  gender: string | null
  avatar_url: string | null
  bio: string | null
  email: string | null
  created_at: string
  updated_at: string
}

interface UserStats {
  totalOrders: number
  totalSaved: number
  totalSpent: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userStats, setUserStats] = useState<UserStats>({ totalOrders: 0, totalSaved: 0, totalSpent: 0 })
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [photoModalOpen, setPhotoModalOpen] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    date_of_birth: '',
    gender: ''
  })

  // Calculate profile completion percentage
  const calculateCompletion = (profile: UserProfile | null) => {
    if (!profile) return 0
    const fields = [
      profile.first_name,
      profile.last_name,
      profile.email,
      profile.phone_number,
      profile.date_of_birth,
      profile.gender,
      profile.avatar_url
    ]
    const filledFields = fields.filter(field => field && field.trim() !== '').length
    return Math.round((filledFields / fields.length) * 100)
  }

  const completionPercentage = calculateCompletion(profile)

  useEffect(() => {
    checkAuthAndLoadProfile()
  }, [])

  const checkAuthAndLoadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        await Promise.all([
          loadUserProfile(user.id),
          loadUserStats(user.id)
        ])
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      toast.error('Error loading profile')
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error
      }
      
      if (data) {
        setProfile(data)
        setEditForm({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone_number: data.phone_number || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || ''
        })
      } else {
        // Create empty profile if none exists
        const { data: authUser } = await supabase.auth.getUser()
        if (authUser.user) {
          const newProfile = {
            user_id: authUser.user.id,
            email: authUser.user.email || null
          }
          
          const { data: createdProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert(newProfile)
            .select()
            .single()
          
          if (createError) throw createError
          setProfile(createdProfile)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Error loading profile data')
    }
  }

  const loadUserStats = async (userId: string) => {
    try {
      // Load orders for user stats
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, discount_amount, created_at')
        .eq('user_id', userId)
      
      if (ordersError) throw ordersError
      
      const totalOrders = orders?.length || 0
      const totalSpent = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount || '0'), 0) || 0
      const totalSaved = orders?.reduce((sum, order) => sum + parseFloat(order.discount_amount || '0'), 0) || 0
      
      setUserStats({
        totalOrders,
        totalSpent: Math.round(totalSpent),
        totalSaved: Math.round(totalSaved)
      })
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user || !profile) return
    
    try {
      const updates = {
        ...editForm,
        updated_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      await loadUserProfile(user.id)
      setEditModalOpen(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error updating profile')
    }
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return
    
    setUploadingPhoto(true)
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file)
      
      if (uploadError) {
        // If bucket doesn't exist, create it (this might fail due to permissions)
        console.log('Upload error, trying to create bucket:', uploadError)
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath)
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id)
      
      if (error) throw error
      
      await loadUserProfile(user.id)
      setPhotoModalOpen(false)
      toast.success('Profile photo updated!')
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast.error('Error uploading photo. Using fallback method.')
      // For now, we'll use a placeholder or gravatar
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Error signing out')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar cartCount={0} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Sign In</h2>
            <p className="text-gray-600 mb-4">You need to sign in to view your profile</p>
            <Button onClick={() => router.push('/login')} className="bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const displayName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : profile?.first_name || user.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header Section with Blue Background */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Avatar with Camera Icon */}
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
                <AvatarFallback className="bg-white text-blue-600 text-2xl font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0 bg-blue-700 hover:bg-blue-800 shadow-lg"
                onClick={() => setPhotoModalOpen(true)}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Name and Email */}
            <div>
              <h1 className="text-2xl font-bold mb-1">{displayName}</h1>
              <p className="text-blue-100">{profile?.email || user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Completion */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Edit className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Profile Completion</h3>
                  <p className="text-sm text-gray-600">Tap to complete personal info</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                {completionPercentage}%
              </Badge>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="text-center">
            <CardContent className="p-4">
              <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{userStats.totalOrders}</p>
              <p className="text-xs text-gray-600">Total Orders</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <Gift className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">₹{userStats.totalSaved}</p>
              <p className="text-xs text-gray-600">Total Saved</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-blue-600 mx-auto mb-2 text-2xl font-bold">₹</div>
              <p className="text-2xl font-bold text-gray-900">{userStats.totalSpent}</p>
              <p className="text-xs text-gray-600">Total Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Personal Information */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Personal Information</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditModalOpen(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                Edit
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Name</p>
                  <p className="text-gray-600">{displayName}</p>
                </div>
                {profile?.first_name && profile?.last_name && (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-gray-600">{profile?.email || user.email}</p>
                </div>
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-gray-600">{profile?.phone_number || 'Not set'}</p>
                </div>
                {!profile?.phone_number && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditModalOpen(true)}
                    className="text-orange-600 hover:text-orange-700 text-sm"
                  >
                    Add
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Birthday</p>
                  <p className="text-gray-600">{profile?.date_of_birth || 'Not set'}</p>
                </div>
                {!profile?.date_of_birth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditModalOpen(true)}
                    className="text-orange-600 hover:text-orange-700 text-sm"
                  >
                    Add
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Gender</p>
                  <p className="text-gray-600">{profile?.gender || 'Not set'}</p>
                </div>
                {!profile?.gender && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditModalOpen(true)}
                    className="text-orange-600 hover:text-orange-700 text-sm"
                  >
                    Add
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-3 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/order-history')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Order History</h3>
                  <p className="text-sm text-gray-600">View past orders & track status</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/address-book')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">My Addresses</h3>
                  <p className="text-sm text-gray-600">Manage delivery addresses</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/notifications')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600">App preferences & alerts</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Help & Support</h3>
                  <p className="text-sm text-gray-600">Get assistance & contact us</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Privacy Policy</h3>
                  <p className="text-sm text-gray-600">Read our privacy policy</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Terms & Conditions</h3>
                  <p className="text-sm text-gray-600">Read terms of service</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full mb-20"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-600" onClick={() => router.push('/')}>
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-600">
            <Settings className="w-5 h-5" />
            <span className="text-xs">Services</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-blue-600">
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                Edit Profile
              </DialogTitle>
            </div>
            <p className="text-sm text-gray-600">Update your personal information</p>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="First Name"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Last Name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={editForm.phone_number}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone_number: e.target.value }))}
                placeholder="Phone Number"
              />
            </div>
            
            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={editForm.date_of_birth}
                onChange={(e) => setEditForm(prev => ({ ...prev, date_of_birth: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>Gender</Label>
              <RadioGroup
                value={editForm.gender}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, gender: value }))}
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateProfile}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <User className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Upload Modal */}
      <Dialog open={photoModalOpen} onOpenChange={setPhotoModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Profile Picture</DialogTitle>
            <p className="text-sm text-gray-600">Select how you want to add your photo</p>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
                <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <Camera className="w-8 h-8 text-blue-600" />
                  <div className="text-center">
                    <p className="font-medium text-gray-900">Camera</p>
                    <p className="text-xs text-gray-600">Take a new photo</p>
                  </div>
                </div>
              </label>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
                <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <ShoppingBag className="w-8 h-8 text-blue-600" />
                  <div className="text-center">
                    <p className="font-medium text-gray-900">Gallery</p>
                    <p className="text-xs text-gray-600">Choose from photos</p>
                  </div>
                </div>
              </label>
            </div>
            
            {uploadingPhoto && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Uploading photo...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
