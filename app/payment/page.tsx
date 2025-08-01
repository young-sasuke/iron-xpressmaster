"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { CreditCard, Smartphone, Wallet, ArrowLeft, CheckCircle } from "lucide-react"

export default function PaymentPage() {
  const router = useRouter()
  const [selectedPayment, setSelectedPayment] = useState("card")

  const orderItems = [
    { name: "Cotton Shirt", service: "Steam Iron", price: 25 },
    { name: "Formal Pants", service: "Electric Iron", price: 30 },
  ]

  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0)
  const deliveryFee = 20
  const discount = 10
  const total = subtotal + deliveryFee - discount

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Pay securely with your card",
    },
    {
      id: "upi",
      name: "UPI Payment",
      icon: Smartphone,
      description: "Pay using UPI apps",
    },
    {
      id: "wallet",
      name: "Digital Wallet",
      icon: Wallet,
      description: "Pay with digital wallets",
    },
  ]

  const handlePayment = () => {
    // Simulate payment processing
    alert("Payment successful! Order placed.")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={0} />

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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Payment</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Choose Payment Method</h2>

                <div className="space-y-3 sm:space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="relative">
                      <input
                        type="radio"
                        id={method.id}
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="sr-only"
                      />
                      <label
                        htmlFor={method.id}
                        className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                          selectedPayment === method.id
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20"
                            : "border-gray-200"
                        }`}
                      >
                        <method.icon
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${selectedPayment === method.id ? "text-blue-600" : "text-gray-400"}`}
                        />
                        <div className="flex-1">
                          <h3
                            className={`font-medium text-sm sm:text-base ${selectedPayment === method.id ? "text-blue-900" : "text-gray-900"}`}
                          >
                            {method.name}
                          </h3>
                          <p
                            className={`text-xs sm:text-sm ${selectedPayment === method.id ? "text-blue-700" : "text-gray-600"}`}
                          >
                            {method.description}
                          </p>
                        </div>
                        {selectedPayment === method.id && (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        )}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Card Details Form (shown when card is selected) */}
                {selectedPayment === "card" && (
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Card Details</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <input
                        type="text"
                        placeholder="Card Number"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                      />
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Cardholder Name"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 sticky top-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>

                {/* Order Items */}
                <div className="space-y-3 mb-4 sm:mb-6">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm sm:text-base">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600">{item.service}</p>
                      </div>
                      <p className="font-medium text-gray-900">₹{item.price}</p>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                  <div className="border-t pt-2 sm:pt-3">
                    <div className="flex justify-between font-semibold text-base sm:text-lg">
                      <span>Total</span>
                      <span className="text-blue-600">₹{total}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-sm sm:text-base transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Pay ₹{total}
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
