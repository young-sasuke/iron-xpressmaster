"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { ArrowLeft, Plus, Home, Briefcase, MapPinIcon, Edit, Trash2 } from "lucide-react"

export default function AddressBookPage() {
  const router = useRouter()
  const [addresses] = useState([
    {
      id: 1,
      name: "Home",
      type: "home",
      address: "123 Main Street, Sector 15, Gurgaon, Haryana 122001",
      phone: "+91 98765 43210",
      isDefault: true,
    },
    {
      id: 2,
      name: "Office",
      type: "work",
      address: "456 Business Park, Cyber City, Gurgaon, Haryana 122002",
      phone: "+91 98765 43210",
      isDefault: false,
    },
    {
      id: 3,
      name: "Mom's Place",
      type: "other",
      address: "789 Residential Area, Sector 22, Gurgaon, Haryana 122003",
      phone: "+91 98765 43211",
      isDefault: false,
    },
  ])

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
      case "work":
        return <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
      default:
        return <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
    }
  }

  const selectAddress = (address: any) => {
    // In a real app, you'd update the selected address in context/state
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={0} />

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </button>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Address Book</h1>
            </div>
            <button
              onClick={() => router.push("/map-picker")}
              className="bg-blue-600 text-white p-2 sm:p-3 rounded-full hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Address List */}
          <div className="space-y-3 sm:space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => selectAddress(address)}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      {getAddressIcon(address.type)}
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{address.name}</h3>
                      {address.isDefault && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="ml-6 sm:ml-8">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">{address.address}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{address.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 ml-3">
                    <button
                      onClick={() => router.push(`/add-address?edit=${address.id}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Address Button */}
          <button
            onClick={() => router.push("/map-picker")}
            className="w-full mt-4 sm:mt-6 bg-gray-100 text-gray-700 py-3 sm:py-4 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium text-sm sm:text-base flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add New Address
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
