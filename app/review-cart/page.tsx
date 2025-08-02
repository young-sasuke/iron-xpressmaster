"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { supabase } from "@/lib/supabase"
import { ShoppingBag, Tag, CheckCircle, ChevronUp, ChevronDown } from "lucide-react"

export default function ReviewCartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState([])
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [availableCoupons, setAvailableCoupons] = useState([])
  const [showCoupons, setShowCoupons] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        // Get cart items from localStorage
        const savedCart = localStorage.getItem('cart')
        if (!savedCart) {
          setIsLoading(false)
          return
        }

        const cartData = JSON.parse(savedCart)
        
        // Fetch fresh product data from Supabase
        const productIds = cartData.map(item => item.productId || item.id)
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds)

        if (productsError) {
          console.error('Error fetching products:', productsError)
        }

        // Fetch services data
        const serviceIds = cartData.map(item => item.serviceId).filter(Boolean)
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .in('id', serviceIds)

        if (servicesError) {
          console.error('Error fetching services:', servicesError)
        }

        // Fetch coupons
        const { data: coupons, error: couponsError } = await supabase
          .from('coupons')
          .select('*')
          .eq('is_active', true)

        if (couponsError) {
          console.error('Error fetching coupons:', couponsError)
        } else {
          setAvailableCoupons(coupons || [])
        }

        // Update cart items with fresh data
        const updatedCartItems = cartData.map(item => {
          const product = products?.find(p => p.id === (item.productId || item.id))
          const service = services?.find(s => s.id === item.serviceId)
          
          return {
            ...item,
            name: product?.name || item.name,
            price: product?.price || item.price,
            image: product?.image || item.image,
            service: service?.name || item.service,
            servicePrice: service?.price || item.servicePrice || 0,
            quantity: item.quantity || 1
          }
        })

        setCartItems(updatedCartItems)
        
        // Check if there's a saved coupon in localStorage and validate it
        const savedCoupon = localStorage.getItem('appliedCoupon')
        if (savedCoupon && coupons) {
          const coupon = coupons.find(c => c.code === savedCoupon)
          if (coupon) {
            setAppliedCoupon(coupon)
          }
        }
        
      } catch (error) {
        console.error('Error fetching cart data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCartData()
  }, [])

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const quantity = item.quantity || 1
      const itemTotal = (item.price + (item.servicePrice || 0)) * quantity
      return total + itemTotal
    }, 0)
  }

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0
    
    const subtotal = calculateSubtotal()
    if (subtotal < (appliedCoupon.minimum_order_value || 0)) return 0

    if (appliedCoupon.discount_type === 'percentage') {
      const discount = (subtotal * appliedCoupon.discount_value) / 100
      return appliedCoupon.max_discount_amount 
        ? Math.min(discount, appliedCoupon.max_discount_amount)
        : discount
    }
    return appliedCoupon.discount_value
  }

  const subtotal = calculateSubtotal()
  const deliveryFee = 30
  const discount = calculateDiscount()
  const totalAmount = subtotal + deliveryFee - discount

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartItems.length} />

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <ShoppingBag className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
              Review Your Order
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Please review your items before proceeding</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading your order...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No items in cart</h2>
              <p className="text-gray-500 mb-6">Add some items to review your order</p>
              <button
                onClick={() => router.push("/")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Order Items */}
              <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg">{item.name}</h3>
                        <p className="text-xs sm:text-sm text-blue-600 mt-1">{item.service} (+₹{item.servicePrice || 0})</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Quantity: {item.quantity || 1}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          ₹{((item.price + (item.servicePrice || 0)) * (item.quantity || 1)).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">₹{(item.price + (item.servicePrice || 0)).toFixed(2)} each</p>
                      </div>
                    </div>
                  </div>
                ))}

              {/* Coupon Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Apply Coupon</h3>
                  </div>
                  <button
                    onClick={() => setShowCoupons(!showCoupons)}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm sm:text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                  >
                    View Coupons
                    {showCoupons ? (
                      <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </button>
                </div>
                
                {/* Applied Coupon */}
                {appliedCoupon && (
                  <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800 text-sm sm:text-base">
                          Coupon Applied: {appliedCoupon.code}
                        </p>
                        <p className="text-xs sm:text-sm text-green-600">
                          You saved ₹{discount.toFixed(2)} on this order!
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setAppliedCoupon(null)
                          localStorage.removeItem('appliedCoupon')
                        }}
                        className="text-green-600 hover:text-green-700 text-xs sm:text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Available Coupons */}
                {showCoupons && (
                  <div className="space-y-3">
                    {availableCoupons.map((coupon) => (
                      <div
                        key={coupon.code}
                        className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-all duration-200 hover:border-blue-300"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs sm:text-sm font-bold">
                              {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                            </div>
                            <span className="font-semibold text-gray-900 text-xs sm:text-sm">{coupon.code}</span>
                          </div>
                          <button
                            onClick={() => {
                              setAppliedCoupon(coupon)
                              localStorage.setItem('appliedCoupon', coupon.code)
                              setShowCoupons(false)
                            }}
                            disabled={appliedCoupon && appliedCoupon.code === coupon.code}
                            className={`px-3 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              appliedCoupon && appliedCoupon.code === coupon.code
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 transform hover:scale-105"
                            }`}
                          >
                            {appliedCoupon && appliedCoupon.code === coupon.code ? "Applied" : "Apply"}
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900">{coupon.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Min order: ₹{coupon.minimum_order_value || 0}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 sticky top-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>

                  <div className="space-y-3 sm:space-y-4 mb-6">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>Delivery Fee</span>
                      <span>₹{deliveryFee.toFixed(2)}</span>
                    </div>
                    {appliedCoupon && discount > 0 && (
                      <div className="flex justify-between text-green-600 text-sm sm:text-base">
                        <span>Coupon Discount</span>
                        <span>-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg sm:text-xl font-bold text-gray-900">Total Amount</span>
                        <span className="text-xl sm:text-2xl font-bold text-blue-600">₹{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/slot-selection")}
                    className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-sm sm:text-base transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Select Slot
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
