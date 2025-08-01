"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { ShoppingBag, Tag, CheckCircle } from "lucide-react"

export default function ReviewCartPage() {
  const router = useRouter()
  const [cartItems] = useState([
    {
      id: 1,
      name: "Cotton Shirt",
      service: "Steam Iron",
      price: 25,
      image: "/placeholder.svg?height=80&width=80&text=Shirt",
    },
    {
      id: 2,
      name: "Formal Pants",
      service: "Electric Iron",
      price: 30,
      image: "/placeholder.svg?height=80&width=80&text=Pants",
    },
  ])

  const [appliedCoupon] = useState("FIRST20")
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  const deliveryFee = 20
  const discount = Math.floor(subtotal * 0.2) // 20% discount
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
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{item.service}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">₹{item.price}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Applied Coupon */}
              {appliedCoupon && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <span className="font-medium text-green-800 text-sm sm:text-base">
                      Coupon Applied: {appliedCoupon}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-green-600 mt-1 ml-6">You saved ₹{discount} on this order!</p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 sticky top-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>

                <div className="space-y-3 sm:space-y-4 mb-6">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-green-600 text-sm sm:text-base">
                    <span>Coupon Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg sm:text-xl font-bold text-gray-900">Total Amount</span>
                      <span className="text-xl sm:text-2xl font-bold text-blue-600">₹{totalAmount}</span>
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
        </div>
      </main>

      <Footer />
    </div>
  )
}
