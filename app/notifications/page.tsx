"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { CheckCircle, Info, AlertTriangle } from "lucide-react"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })

        if (error) throw error

        setNotifications(data || [])
      } catch (error) {
        console.error('Error fetching notifications:', error)
        setNotifications([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={0} />

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" /> Notifications
          </h1>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Info className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No notifications</h2>
              <p className="text-gray-500 mb-6">You have no notifications at the moment.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {notification.title || 'Notification'}
                      </h2>
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.content || 'No details available'}
                      </p>
                    </div>
                    <button className={`ml-4 inline-flex items-center gap-1 text-sm font-medium rounded-lg px-2 py-1 focus:outline-none focus:ring-2 ${notification.is_read ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-all duration-200`}
                    >
                      {notification.is_read ? <CheckCircle /> : <AlertTriangle />}
                      {notification.is_read ? 'Read' : 'Unread'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
