"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { ArrowLeft, MapPin, Navigation, Search } from "lucide-react"

export default function MapPickerPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
    address: string
  } | null>(null)

  // Simulate getting current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setCurrentLocation(location)
          setSelectedLocation({
            ...location,
            address: "Current Location - Fetching address...",
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          // Set default location (Gurgaon)
          const defaultLocation = { lat: 28.4595, lng: 77.0266 }
          setCurrentLocation(defaultLocation)
          setSelectedLocation({
            ...defaultLocation,
            address: "Gurgaon, Haryana, India",
          })
        },
      )
    }
  }, [])

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location)
  }

  const confirmLocation = () => {
    if (selectedLocation) {
      // Pass the selected location to add address page
      router.push(
        `/add-address?lat=${selectedLocation.lat}&lng=${selectedLocation.lng}&address=${encodeURIComponent(selectedLocation.address)}`,
      )
    }
  }

  // Mock nearby places
  const nearbyPlaces = [
    { id: 1, name: "Cyber Hub", address: "Cyber Hub, Sector 26, Gurgaon", lat: 28.4949, lng: 77.0869 },
    { id: 2, name: "Ambience Mall", address: "Ambience Mall, Sector 24, Gurgaon", lat: 28.5021, lng: 77.0876 },
    { id: 3, name: "Kingdom of Dreams", address: "Kingdom of Dreams, Sector 29, Gurgaon", lat: 28.4692, lng: 77.0824 },
    { id: 4, name: "Galleria Market", address: "Galleria Market, Sector 28, Gurgaon", lat: 28.4743, lng: 77.0826 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={0} />

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Select Location</h1>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for area, street name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
            />
          </div>

          {/* Map Placeholder */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 sm:mb-6 overflow-hidden">
            <div className="h-64 sm:h-80 bg-gradient-to-br from-blue-100 to-green-100 relative flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-2" />
                <p className="text-sm sm:text-base text-gray-600">Interactive Map</p>
                <p className="text-xs sm:text-sm text-gray-500">Tap to select location</p>
              </div>

              {/* Mock pin for selected location */}
              {selectedLocation && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <MapPin className="w-8 h-8 text-red-500 animate-bounce" />
                </div>
              )}
            </div>
          </div>

          {/* Current Location Button */}
          <button
            onClick={() => {
              if (currentLocation) {
                setSelectedLocation({
                  ...currentLocation,
                  address: "Current Location",
                })
              }
            }}
            className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-sm sm:text-base flex items-center justify-center gap-2 mb-4 sm:mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
            Use Current Location
          </button>

          {/* Selected Location Display */}
          {selectedLocation && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 text-sm sm:text-base mb-1">Selected Location</h3>
                  <p className="text-xs sm:text-sm text-blue-800">{selectedLocation.address}</p>
                </div>
              </div>
            </div>
          )}

          {/* Nearby Places */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">Nearby Places</h3>
            <div className="space-y-2 sm:space-y-3">
              {nearbyPlaces.map((place) => (
                <button
                  key={place.id}
                  onClick={() =>
                    handleLocationSelect({
                      lat: place.lat,
                      lng: place.lng,
                      address: place.address,
                    })
                  }
                  className="w-full text-left p-3 sm:p-4 hover:bg-gray-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{place.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{place.address}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={confirmLocation}
            disabled={!selectedLocation}
            className={`w-full py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 ${
              selectedLocation
                ? "bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Confirm Location
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
