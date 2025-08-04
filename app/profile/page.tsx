"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { supabase } from "@/lib/supabase"
import { User, Mail, Phone, MapPin, Package, Star, Calendar, Edit, LogIn, LogOut } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current auth state
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = () => {
    router.push('/login')
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const userStats = [
    { label: "Total Orders", value: "24", icon: Package },
    { label: "Rating", value: "4.8", icon: Star },
    { label: "Years with us", value: "2", icon: Calendar },
  ]

  const pastOrders = [
    {
      id: "ORD001",
      date: "Dec 15, 2023",
      items: "3 items",
      status: "Delivered",
      statusColor: "text-green-600 bg-green-100",
    },
    {
      id: "ORD002",
      date: "Dec 10, 2023",
      items: "5 items",
      status: "Processing",
      statusColor: "text-blue-600 bg-blue-100",
    },
    {
      id: "ORD003",
      date: "Dec 5, 2023",
      items: "2 items",
      status: "Delivered",
      statusColor: "text-green-600 bg-green-100",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={0} />

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-blue-600" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">John Doe</h1>
                  <button className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-sm sm:text-base flex items-center gap-2 mx-auto sm:mx-0 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <Edit className="w-4 h-4" />
                    Edit Profile
</button> 
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 text-white px-3 sm:px-4 py-2 mt-2 rounded-lg hover:bg-red-600 transition-all duration-200 font-medium text-sm sm:text-base flex items-center gap-2 mx-auto sm:mx-0 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={handleLogin}
                      className="bg-blue-600 text-white px-3 sm:px-4 py-2 mt-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-sm sm:text-base flex items-center gap-2 mx-auto sm:mx-0 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <LogIn className="w-4 h-4" />
                      Login
                    </button>
                  )}
                </div>
                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span>john.doe@email.com</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>Mumbai, Maharashtra</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
            {userStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 text-center hover:shadow-md transition-all duration-200 transform hover:scale-105"
              >
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2 sm:mb-3" />
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Past Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Past Orders</h2>
            <div className="space-y-3 sm:space-y-4">
              {pastOrders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-all duration-200 hover:border-blue-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Order #{order.id}</h3>
                        <span className="text-xs sm:text-sm text-gray-600">{order.date}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">{order.items}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${order.statusColor}`}
                      >
                        {order.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
