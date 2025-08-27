"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  MapPin,
  Phone,
  RefreshCcw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface Order {
  id: string
  total_amount: string
  order_status: string
  pickup_date: string
  delivery_date: string
  payment_method: string
  payment_status: string
  delivery_address: string
  created_at: string
  pickup_slot_display_time: string | null
  delivery_slot_display_time: string | null
}

export default function OrderHistoryPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrderHistory()
  }, [])

  const loadOrderHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          order_status,
          pickup_date,
          delivery_date,
          payment_method,
          payment_status,
          delivery_address,
          created_at,
          pickup_slot_display_time,
          delivery_slot_display_time
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setOrders(data || [])
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Error loading order history')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'confirmed':
      case 'picked_up':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      case 'processing':
      case 'confirmed':
        return <RefreshCcw className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(parseFloat(amount))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Order History</h1>
              <p className="text-sm text-gray-600">View your past orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {orders.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <Button 
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          // Orders list
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(order.order_status)} flex items-center gap-1`}>
                      {getStatusIcon(order.order_status)}
                      {order.order_status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Order Amount */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Amount</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>

                  <Separator />

                  {/* Pickup & Delivery Info */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Pickup</p>
                        <p className="text-xs text-gray-600">
                          {formatDate(order.pickup_date)}
                          {order.pickup_slot_display_time && (
                            <span className="ml-2">{order.pickup_slot_display_time}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Delivery</p>
                        <p className="text-xs text-gray-600">
                          {formatDate(order.delivery_date)}
                          {order.delivery_slot_display_time && (
                            <span className="ml-2">{order.delivery_slot_display_time}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Delivery Address</p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {order.delivery_address}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Payment</p>
                      <p className="text-xs text-gray-600">
                        {order.payment_method} • {order.payment_status}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    {(order.order_status.toLowerCase() === 'delivered') && (
                      <Button variant="outline" size="sm">
                        Reorder
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
