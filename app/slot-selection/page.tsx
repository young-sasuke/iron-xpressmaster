"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { MapPin, Clock, Calendar, Truck, Zap, CreditCard, Banknote, ArrowLeft, ShoppingBag } from "lucide-react"

export default function SlotSelectionPage() {
  const router = useRouter()
  const [selectedAddress, setSelectedAddress] = useState({
    name: "Home",
    address: "123 Main Street, Sector 15, Gurgaon, Haryana 122001",
    phone: "+91 98765 43210",
  })

  const [deliveryType, setDeliveryType] = useState<"standard" | "express">("standard")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online")
  
  // Cart and pricing states
  const [cartItems, setCartItems] = useState([])
  const [appliedCoupon, setAppliedCoupon] = useState(null)

  // Generate next 7 days
  const [availableDates, setAvailableDates] = useState<
    Array<{
      date: string
      day: string
      dayNum: string
      month: string
    }>
  >([])

  const [timeSlots, setTimeSlots] = useState([])

  useEffect(() => {
    const generateDates = () => {
      const dates = []
      const today = new Date()

      for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)

        dates.push({
          date: date.toISOString().split("T")[0],
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          dayNum: date.getDate().toString(),
          month: date.toLocaleDateString("en-US", { month: "short" }),
        })
      }

      setAvailableDates(dates)
      setSelectedDate(dates[0].date) // Select first date by default
    }

    generateDates()
    // Fetch timeslots from Supabase
    const fetchTimeSlots = async () => {
      try {
        const { data, error } = await supabase
          .from('delivery_slots')
          .select('*')

        if (error) throw error

        setTimeSlots(data || [])
      } catch (error) {
        console.error('Error fetching delivery slots:', error)
        // Set default time slots if Supabase is not available
        setTimeSlots([
          { id: "08:00-10:00", label: "08:00 AM - 10:00 AM", available: true },
          { id: "10:00-12:00", label: "10:00 AM - 12:00 PM", available: true },
          { id: "12:00-14:00", label: "12:00 PM - 02:00 PM", available: false },
          { id: "14:00-16:00", label: "02:00 PM - 04:00 PM", available: true },
          { id: "16:00-18:00", label: "04:00 PM - 06:00 PM", available: true },
          { id: "18:00-20:00", label: "06:00 PM - 08:00 PM", available: true },
        ])
      }
    }

    // Load cart items and applied coupon
    const loadCart = () => {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        const cartData = JSON.parse(savedCart)
        setCartItems(cartData)
      }

      const savedCoupon = localStorage.getItem('appliedCoupon')
      if (savedCoupon) {
        setAppliedCoupon(savedCoupon)
      }
    }

    loadCart()
    fetchTimeSlots()
  }, [])

  // Calculate pricing
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const quantity = item.quantity || 1
      const itemTotal = (item.price + (item.servicePrice || 0)) * quantity
      return total + itemTotal
    }, 0)
  }

  const calculateDiscount = () => {
    // For now, return 0. You can add coupon logic here
    return 0
  }

  const subtotal = calculateSubtotal()
  const deliveryFee = 30
  const discount = calculateDiscount()
  const totalAmount = subtotal + deliveryFee - discount

  const isSlotSelected = selectedDate && selectedTimeSlot

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartItems.length} />

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Select Pickup Slot</h1>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Delivery Address</h3>
                  </div>
                  <div className="ml-6 sm:ml-7">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">{selectedAddress.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{selectedAddress.address}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{selectedAddress.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/address-book")}
                  className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                >
                  Change Address
                </button>
              </div>
            </div>

            {/* Delivery Type */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">Delivery Type</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => setDeliveryType("standard")}
                  className={`flex items-center gap-3 p-3 sm:p-4 border rounded-lg transition-all duration-200 ${
                    deliveryType === "standard"
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Truck className={`w-5 h-5 ${deliveryType === "standard" ? "text-blue-600" : "text-gray-400"}`} />
                  <div className="text-left">
                    <p
                      className={`font-medium text-sm sm:text-base ${deliveryType === "standard" ? "text-blue-900" : "text-gray-900"}`}
                    >
                      Standard
                    </p>
                    <p
                      className={`text-xs sm:text-sm ${deliveryType === "standard" ? "text-blue-700" : "text-gray-600"}`}
                    >
                      24-48 hours
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setDeliveryType("express")}
                  className={`flex items-center gap-3 p-3 sm:p-4 border rounded-lg transition-all duration-200 ${
                    deliveryType === "express"
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Zap className={`w-5 h-5 ${deliveryType === "express" ? "text-blue-600" : "text-gray-400"}`} />
                  <div className="text-left">
                    <p
                      className={`font-medium text-sm sm:text-base ${deliveryType === "express" ? "text-blue-900" : "text-gray-900"}`}
                    >
                      Express
                    </p>
                    <p
                      className={`text-xs sm:text-sm ${deliveryType === "express" ? "text-blue-700" : "text-gray-600"}`}
                    >
                      Same day
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Select Pickup Date */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Select Pickup Date</h3>
              </div>
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
                {availableDates.map((date) => (
                  <button
                    key={date.date}
                    onClick={() => setSelectedDate(date.date)}
                    className={`flex-shrink-0 flex flex-col items-center p-3 sm:p-4 rounded-lg border transition-all duration-200 min-w-[70px] sm:min-w-[80px] ${
                      selectedDate === date.date
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium">{date.day}</span>
                    <span className="text-lg sm:text-xl font-bold">{date.dayNum}</span>
                    <span className="text-xs text-gray-500">{date.month}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule Pickup */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Schedule Pickup</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => slot.available && setSelectedTimeSlot(slot.id)}
                    disabled={!slot.available}
                    className={`p-3 sm:p-4 rounded-lg border text-left transition-all duration-200 ${
                      !slot.available
                        ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                        : selectedTimeSlot === slot.id
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className="text-sm sm:text-base font-medium">{slot.label}</span>
                    {!slot.available && <span className="block text-xs text-red-500 mt-1">Not Available</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Selection Summary */}
            {isSlotSelected && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                <h3 className="font-semibold text-blue-900 text-sm sm:text-base mb-2">Selection Summary</h3>
                <p className="text-sm sm:text-base text-blue-800">
                  Pickup: {availableDates.find((d) => d.date === selectedDate)?.day}{" "}
                  {availableDates.find((d) => d.date === selectedDate)?.dayNum} at{" "}
                  {timeSlots.find((t) => t.id === selectedTimeSlot)?.label}
                </p>
              </div>
            )}

            {/* Bill Summary */}
            {isSlotSelected && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">Bill Summary</h3>
                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-base sm:text-lg">
                      <span>Total</span>
                      <span className="text-blue-600">₹{totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Methods */}
            {isSlotSelected && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">Payment Method</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={() => setPaymentMethod("online")}
                    className={`flex items-center gap-3 p-3 sm:p-4 border rounded-lg transition-all duration-200 ${
                      paymentMethod === "online"
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <CreditCard
                      className={`w-5 h-5 ${paymentMethod === "online" ? "text-blue-600" : "text-gray-400"}`}
                    />
                    <span
                      className={`font-medium text-sm sm:text-base ${paymentMethod === "online" ? "text-blue-900" : "text-gray-900"}`}
                    >
                      Pay Online
                    </span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("cod")}
                    className={`flex items-center gap-3 p-3 sm:p-4 border rounded-lg transition-all duration-200 ${
                      paymentMethod === "cod"
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Banknote className={`w-5 h-5 ${paymentMethod === "cod" ? "text-blue-600" : "text-gray-400"}`} />
                    <span
                      className={`font-medium text-sm sm:text-base ${paymentMethod === "cod" ? "text-blue-900" : "text-gray-900"}`}
                    >
                      Pay on Delivery
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Pay Now Button */}
            <div className="sticky bottom-4 bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-lg sm:text-xl font-bold text-gray-900">Total Amount</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-600">₹{totalAmount}</span>
              </div>
              <button
                onClick={() => router.push("/payment")}
                disabled={!isSlotSelected}
                className={`w-full py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 ${
                  isSlotSelected
                    ? "bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isSlotSelected ? "Pay Now" : "Select a slot to continue"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
