"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { supabase } from "@/lib/supabase"
import { Plus, Minus, ShoppingBag, Tag, ChevronDown, ChevronUp, MapPin, CheckCircle, AlertCircle } from "lucide-react"

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [showCoupons, setShowCoupons] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [serviceablePincodes, setServiceablePincodes] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);

  // Availability check states
  const [pincode, setPincode] = useState("");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
  }>({
    checked: false,
    available: false,
    message: "",
  });

  useEffect(() => {
    // Initialize cart items from localStorage after component mounts
    setIsClient(true);
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    // Fetch available coupons
    const fetchCoupons = async () => {
      const { data, error } = await supabase.from('coupons').select('*');
      if (error) console.error('Error fetching coupons:', error);
      else setAvailableCoupons(data);
    };

    // Fetch serviceable pincodes
    const fetchPincodes = async () => {
      const { data, error } = await supabase.from('service_areas')
        .select('pincode')
        .eq('is_active', true);
      if (error) console.error('Error fetching pincodes:', error);
      else setServiceablePincodes(data.map((item: any) => item.pincode));
    };

    fetchCoupons();
    fetchPincodes();
  }, []);

  const updateQuantity = (id: number, action: 'increment' | 'decrement') => {
    setCartItems((prev) => {
      const updatedCart = prev.map((item) => {
        if (item.id === id) {
          const currentQuantity = item.quantity || 1;
          let newQuantity = currentQuantity;
          
          if (action === 'increment') {
            newQuantity = currentQuantity + 1;
          } else if (action === 'decrement') {
            newQuantity = currentQuantity - 1;
          }
          
          if (newQuantity > 0) {
            return {
              ...item,
              quantity: newQuantity,
              totalPrice: (item.price + (item.servicePrice || 0)) * newQuantity
            };
          } else {
            return null; // Mark for removal
          }
        }
        return item;
      });
      
      // Filter out null items (items with 0 quantity)
      const filteredCart = updatedCart.filter(item => item !== null);
      
      // Check if any items were removed
      if (filteredCart.length < prev.length) {
        const removedItem = prev.find(item => !filteredCart.some(cart => cart.id === item.id));
        if (removedItem) {
          showToastMessage(`"${removedItem.name}" has been removed from cart`);
        }
      }
      
      localStorage.setItem('cart', JSON.stringify(filteredCart));
      window.dispatchEvent(new Event('cartUpdated'));
      return filteredCart;
    });
  };

  const removeItem = (id: number) => {
    setCartItems((prev) => {
      const itemToRemove = prev.find(item => item.id === id);
      const updatedCart = prev.filter((item) => item.id !== id);
      
      if (itemToRemove) {
        showToastMessage(`"${itemToRemove.name}" has been removed from cart`);
      }
      
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('cartUpdated'));
      return updatedCart;
    });
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const applyCoupon = (couponCode: string) => {
    setSelectedCoupon(couponCode);
    setShowCoupons(false);
  };

  const checkAvailability = async () => {
    if (!pincode || pincode.length !== 6) {
      setAvailabilityStatus({
        checked: true,
        available: false,
        message: "Please enter a valid 6-digit pincode",
      });
      return;
    }

    setIsCheckingAvailability(true);

    const isAvailable = serviceablePincodes.includes(pincode);

    setAvailabilityStatus({
      checked: true,
      available: isAvailable,
      message: isAvailable
        ? "Great! We deliver to your location"
        : "Sorry, this location is currently not serviceable",
    });
    setIsCheckingAvailability(false);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const quantity = item.quantity || 1;
      const itemTotal = (item.price + (item.servicePrice || 0)) * quantity;
      return total + itemTotal;
    }, 0);
  };

  const calculateDiscount = () => {
    const appliedCoupon = availableCoupons.find((coupon) => coupon.code === selectedCoupon);
    if (!appliedCoupon) return 0;

    const subtotal = calculateSubtotal();
    if (subtotal < appliedCoupon.minimum_order_value) return 0;

    if (appliedCoupon.discount_type === 'percentage') {
      const discount = (subtotal * appliedCoupon.discount_value) / 100;
      return appliedCoupon.max_discount_amount 
        ? Math.min(discount, appliedCoupon.max_discount_amount) 
        : discount;
    }
    return appliedCoupon.discount_value;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const deliveryFee = 30; // Fixed delivery fee for now
    return subtotal + deliveryFee - discount;
  };

  const canProceed = availabilityStatus.checked && availabilityStatus.available;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartItems.length} />
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8 flex items-center gap-2 sm:gap-3">
            <ShoppingBag className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
            Your Cart
          </h1>
          {cartItems.length === 0 ? (
            <div className="text-center py-12 sm:py-16 lg:py-20">
              <ShoppingBag className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
              <p className="text-sm sm:text-base text-gray-500 mb-6">Add some items to get started</p>
              <button
                onClick={() => router.push("/")}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base font-medium"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base lg:text-lg">
                          {item.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-blue-600 mt-1">{item.service} (+₹{item.servicePrice || 0})</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">₹{((item.price || 0) + (item.servicePrice || 0)).toFixed(1)}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-100 rounded-full px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, 'decrement')}
                          className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-gray-900 font-medium">{item.quantity || 1}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 'increment')}
                          className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
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
                  {selectedCoupon && (
                    <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-800 text-sm sm:text-base">
                            Coupon Applied: {selectedCoupon}
                          </p>
                          <p className="text-xs sm:text-sm text-green-600">You'll save money on this order!</p>
                        </div>
                        <button
                          onClick={() => setSelectedCoupon(null)}
                          className="text-green-600 hover:text-green-700 text-xs sm:text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded px-2 py-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
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
                              onClick={() => applyCoupon(coupon.code)}
                              disabled={selectedCoupon === coupon.code}
                              className={`px-3 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                selectedCoupon === coupon.code
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 transform hover:scale-105"
                              }`}
                            >
                              {selectedCoupon === coupon.code ? "Applied" : "Apply"}
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-gray-900">{coupon.code}</p>
                          <p className="text-xs text-gray-600">{coupon.description}</p>
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
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Order Summary</h2>
                  <div className="space-y-3 sm:space-y-4 mb-6">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>Subtotal</span>
                      <span>₹{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>Delivery Fee</span>
                      <span>₹30.00</span>
                    </div>
                    {selectedCoupon && (
                      <div className="flex justify-between text-green-600 text-sm sm:text-base">
                        <span>Coupon Discount</span>
                        <span>-₹{calculateDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-semibold text-base sm:text-lg">
                        <span>Total</span>
                        <span>₹{calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Check Availability Section */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Check Availability</h3>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Enter pincode"
                        value={pincode}
                        onChange={(e) => {
                          setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                          // Reset availability status when pincode changes
                          if (availabilityStatus.checked) {
                            setAvailabilityStatus({
                              checked: false,
                              available: false,
                              message: "",
                            })
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                        maxLength={6}
                      />
                      <button
                        onClick={checkAvailability}
                        disabled={isCheckingAvailability || pincode.length !== 6}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          isCheckingAvailability || pincode.length !== 6
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 transform hover:scale-105"
                        }`}
                      >
                        {isCheckingAvailability ? "Checking..." : "Check"}
                      </button>
                    </div>
                    {/* Availability Status */}
                    {availabilityStatus.checked && (
                      <div
                        className={`flex items-center gap-2 p-3 rounded-lg ${
                          availabilityStatus.available
                            ? "bg-green-50 border border-green-200"
                            : "bg-red-50 border border-red-200"
                        }`}
                      >
                        {availabilityStatus.available ? (
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        )}
                        <p
                          className={`text-sm font-medium ${
                            availabilityStatus.available ? "text-green-800" : "text-red-800"
                          }`}
                        >
                          {availabilityStatus.message}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => router.push("/login")}
                    disabled={!canProceed}
                    className={`w-full py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      canProceed
                        ? "bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105 focus:ring-blue-500"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {!availabilityStatus.checked
                      ? "Check Availability to Continue"
                      : canProceed
                        ? "Proceed to Login"
                        : "Location Not Serviceable"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out">
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
