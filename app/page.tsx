"use client"

import Navbar from "@/components/Navbar"
import BannerCarousel from "@/components/BannerCarousel"
import CategoriesSection from "@/components/CategoriesSection"
import Footer from "@/components/Footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={2} />

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <BannerCarousel />
        <CategoriesSection />
      </main>

      <Footer />
    </div>
  )
}
