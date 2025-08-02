"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import BannerCarousel from "@/components/BannerCarousel"
import CategoriesSection from "@/components/CategoriesSection"
import Footer from "@/components/Footer"

export default function HomePage() {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    // Function to update cart count
    const updateCartCount = () => {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        const cartItems = JSON.parse(savedCart)
        const totalQuantity = cartItems.reduce((total, item) => total + (item.quantity || 1), 0)
        setCartCount(totalQuantity)
      } else {
        setCartCount(0)
      }
    }

    // Initial cart count
    updateCartCount()

    // Listen for storage changes to update cart count in real-time
    const handleStorageChange = (e) => {
      if (e.key === 'cart') {
        updateCartCount()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Custom event listener for cart updates within the same tab
    const handleCartUpdate = () => {
      updateCartCount()
    }
    
    window.addEventListener('cartUpdated', handleCartUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} />

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <BannerCarousel />
        <CategoriesSection />
      </main>

      <Footer />
    </div>
  )
}
