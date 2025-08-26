"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { TravelHeader } from "@/components/travel/header"
import { TravelFooter } from "@/components/travel/footer"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Shield, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Clock,
  User,
  Mail,
  Phone
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

interface BookingData {
  roomId: string
  roomName: string
  homestayName: string
  location: string
  pricePerNight: number
  checkIn: string
  checkOut: string
  guests: number
  nights: number
  subtotal: number
  serviceFee: number
  total: number
  guestInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    specialRequests: string
  }
  paymentMethod: 'card' | 'bank' | 'wallet'
}

const steps = [
  { id: 1, title: "Guest Details", description: "Your information" },
  { id: 2, title: "Payment", description: "Secure payment" },
  { id: 3, title: "Confirmation", description: "Booking confirmed" }
]

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const roomId = params.roomId as string
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [bookingData, setBookingData] = useState<BookingData>({
    roomId,
    roomName: "Deluxe Mountain View Room",
    homestayName: "Mountain Villa Sapa",
    location: "Sapa, Lào Cai",
    pricePerNight: 1200000,
    checkIn: "2024-12-20",
    checkOut: "2024-12-22",
    guests: 2,
    nights: 2,
    subtotal: 2400000,
    serviceFee: 240000,
    total: 2640000,
    guestInfo: {
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      phone: '',
      specialRequests: ''
    },
    paymentMethod: 'card'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!bookingData.guestInfo.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!bookingData.guestInfo.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }
    if (!bookingData.guestInfo.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(bookingData.guestInfo.email)) {
      newErrors.email = "Email is invalid"
    }
    if (!bookingData.guestInfo.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      return
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setCurrentStep(3)
    } catch (error) {
      console.error("Booking failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateGuestInfo = (field: keyof BookingData['guestInfo'], value: string) => {
    setBookingData(prev => ({
      ...prev,
      guestInfo: {
        ...prev.guestInfo,
        [field]: value
      }
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Guest Information</h2>
        <p className="text-neutral-600">Please provide your details for the booking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={bookingData.guestInfo.firstName}
            onChange={(e) => updateGuestInfo('firstName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.firstName ? 'border-red-500' : 'border-neutral-300'
            }`}
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={bookingData.guestInfo.lastName}
            onChange={(e) => updateGuestInfo('lastName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.lastName ? 'border-red-500' : 'border-neutral-300'
            }`}
            placeholder="Enter your last name"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={bookingData.guestInfo.email}
            onChange={(e) => updateGuestInfo('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.email ? 'border-red-500' : 'border-neutral-300'
            }`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={bookingData.guestInfo.phone}
            onChange={(e) => updateGuestInfo('phone', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.phone ? 'border-red-500' : 'border-neutral-300'
            }`}
            placeholder="Enter your phone number"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Special Requests (Optional)
        </label>
        <textarea
          value={bookingData.guestInfo.specialRequests}
          onChange={(e) => updateGuestInfo('specialRequests', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Any special requests or notes for your stay..."
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Payment Method</h2>
        <p className="text-neutral-600">Choose your preferred payment method</p>
      </div>

      <div className="space-y-4">
        {[
          { id: 'card', title: 'Credit/Debit Card', description: 'Visa, Mastercard, American Express', icon: CreditCard },
          { id: 'bank', title: 'Bank Transfer', description: 'Direct bank transfer', icon: Shield },
          { id: 'wallet', title: 'Digital Wallet', description: 'MoMo, ZaloPay, VNPay', icon: Phone }
        ].map((method) => {
          const Icon = method.icon
          return (
            <div
              key={method.id}
              onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: method.id as any }))}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                bookingData.paymentMethod === method.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-6 w-6 text-primary-600" />
                <div>
                  <h3 className="font-medium text-neutral-900">{method.title}</h3>
                  <p className="text-sm text-neutral-600">{method.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {bookingData.paymentMethod === 'card' && (
        <div className="bg-neutral-50 p-6 rounded-lg">
          <h3 className="font-medium text-neutral-900 mb-4">Card Details</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Card Number"
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="CVV"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderStep3 = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Booking Confirmed!</h2>
        <p className="text-neutral-600">Your reservation has been successfully created</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-medium text-green-900 mb-2">Booking Reference</h3>
        <p className="text-2xl font-bold text-green-700">#BK{Date.now().toString().slice(-6)}</p>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={() => router.push('/profile/bookings')}
          className="w-full"
        >
          View My Bookings
        </Button>
        <Button 
          variant="outline"
          onClick={() => router.push('/')}
          className="w-full"
        >
          Back to Home
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50">
      <TravelHeader />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-8">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= step.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}>
                        {currentStep > step.id ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <div className="text-sm font-medium text-neutral-900">{step.title}</div>
                        <div className="text-xs text-neutral-600">{step.description}</div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        currentStep > step.id ? 'bg-primary-600' : 'bg-neutral-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-neutral-200">
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}

                  {/* Navigation Buttons */}
                  {currentStep < 3 && (
                    <div className="flex justify-between mt-8 pt-6 border-t border-neutral-200">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="flex items-center space-x-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                      </Button>
                      
                      <Button
                        onClick={currentStep === 2 ? handleSubmit : handleNext}
                        disabled={loading}
                        className="flex items-center space-x-2"
                      >
                        <span>{currentStep === 2 ? (loading ? 'Processing...' : 'Complete Booking') : 'Next'}</span>
                        {currentStep === 1 && <ArrowRight className="h-4 w-4" />}
                        {currentStep === 2 && loading && (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Summary */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Booking Summary</h3>
                  
                  {/* Room Info */}
                  <div className="flex space-x-4 mb-6">
                    <div className="w-16 h-16 bg-neutral-200 rounded-lg"></div>
                    <div>
                      <h4 className="font-medium text-neutral-900">{bookingData.roomName}</h4>
                      <p className="text-sm text-neutral-600">{bookingData.homestayName}</p>
                      <div className="flex items-center text-sm text-neutral-500 mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {bookingData.location}
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Check-in</span>
                      <span className="font-medium">{new Date(bookingData.checkIn).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Check-out</span>
                      <span className="font-medium">{new Date(bookingData.checkOut).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Guests</span>
                      <span className="font-medium">{bookingData.guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Nights</span>
                      <span className="font-medium">{bookingData.nights}</span>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="border-t border-neutral-200 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{bookingData.subtotal.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service fee</span>
                      <span>{bookingData.serviceFee.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t border-neutral-200 pt-2">
                      <span>Total</span>
                      <span>{bookingData.total.toLocaleString('vi-VN')}₫</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <TravelFooter />
    </div>
  )
}
