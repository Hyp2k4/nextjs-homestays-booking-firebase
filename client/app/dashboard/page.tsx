"use client"

import { useState, useEffect } from "react"
import { TravelHeader } from "@/components/travel/header"
import { TravelFooter } from "@/components/travel/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Calendar, 
  Heart, 
  Settings, 
  MapPin, 
  Star,
  Clock,
  CreditCard,
  Shield,
  Bell,
  Edit,
  Camera,
  Mail,
  Phone,
  Eye,
  Download
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useWishlist } from "@/hooks/use-wishlist"
import Image from "next/image"
import Link from "next/link"

interface Booking {
  id: string
  roomName: string
  homestayName: string
  location: string
  checkIn: string
  checkOut: string
  guests: number
  total: number
  status: 'upcoming' | 'completed' | 'cancelled'
  image: string
}

interface UserProfile {
  name: string
  email: string
  phone: string
  avatar: string
  joinDate: string
  totalBookings: number
  totalSpent: number
}

const sidebarItems = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'bookings', label: 'My Bookings', icon: Calendar },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function UserDashboard() {
  const { user } = useAuth()
  const { wishlistItems } = useWishlist()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        // Mock data - replace with actual API calls
        setUserProfile({
          name: user?.name || 'John Doe',
          email: user?.email || 'john@example.com',
          phone: '+84 123 456 789',
          avatar: '/avatar-placeholder.png',
          joinDate: '2024-01-15',
          totalBookings: 5,
          totalSpent: 12500000
        })

        setBookings([
          {
            id: '1',
            roomName: 'Deluxe Mountain View Room',
            homestayName: 'Mountain Villa Sapa',
            location: 'Sapa, Lào Cai',
            checkIn: '2024-12-20',
            checkOut: '2024-12-22',
            guests: 2,
            total: 2640000,
            status: 'upcoming',
            image: '/sapa-mountain-villa.png'
          },
          {
            id: '2',
            roomName: 'Ocean View Suite',
            homestayName: 'Beach House Da Nang',
            location: 'Đà Nẵng',
            checkIn: '2024-11-15',
            checkOut: '2024-11-17',
            guests: 2,
            total: 1800000,
            status: 'completed',
            image: '/danang-beach-apartment.png'
          }
        ])
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchUserData()
    }
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderProfile = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Profile Information</h2>
        
        {/* Avatar Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {userProfile?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-neutral-200">
                <Camera className="h-4 w-4 text-neutral-600" />
              </button>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">{userProfile?.name}</h3>
              <p className="text-neutral-600">{userProfile?.email}</p>
              <p className="text-sm text-neutral-500 mt-1">
                Member since {new Date(userProfile?.joinDate || '').toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 text-center">
            <Calendar className="h-8 w-8 text-primary-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-neutral-900">{userProfile?.totalBookings}</div>
            <div className="text-neutral-600">Total Bookings</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 text-center">
            <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-neutral-900">
              {userProfile?.totalSpent?.toLocaleString('vi-VN')}₫
            </div>
            <div className="text-neutral-600">Total Spent</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 text-center">
            <Heart className="h-8 w-8 text-red-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-neutral-900">{wishlistItems.length}</div>
            <div className="text-neutral-600">Saved Rooms</div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Personal Information</h3>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
              <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                <User className="h-5 w-5 text-neutral-400" />
                <span className="text-neutral-900">{userProfile?.name}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
              <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                <Mail className="h-5 w-5 text-neutral-400" />
                <span className="text-neutral-900">{userProfile?.email}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Phone Number</label>
              <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                <Phone className="h-5 w-5 text-neutral-400" />
                <span className="text-neutral-900">{userProfile?.phone}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Member Since</label>
              <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                <Calendar className="h-5 w-5 text-neutral-400" />
                <span className="text-neutral-900">
                  {new Date(userProfile?.joinDate || '').toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">My Bookings</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No bookings yet</h3>
          <p className="text-neutral-600 mb-6">Start exploring and book your first stay!</p>
          <Link href="/rooms-new">
            <Button>Browse Rooms</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-neutral-200 rounded-lg overflow-hidden">
                  <Image
                    src={booking.image}
                    alt={booking.roomName}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-neutral-900">{booking.roomName}</h3>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  
                  <p className="text-neutral-600 mb-2">{booking.homestayName}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-neutral-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{booking.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{booking.guests} guests</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-neutral-900 mb-2">
                    {booking.total.toLocaleString('vi-VN')}₫
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderWishlist = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-900">My Wishlist</h2>
      
      {wishlistItems.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No saved rooms yet</h3>
          <p className="text-neutral-600 mb-6">Save rooms you love to book them later!</p>
          <Link href="/rooms-new">
            <Button>Browse Rooms</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((roomId) => (
            <div key={roomId} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
              <div className="h-48 bg-neutral-200"></div>
              <div className="p-4">
                <h3 className="font-semibold text-neutral-900 mb-2">Room {roomId}</h3>
                <p className="text-neutral-600 text-sm mb-3">Beautiful room with amazing amenities</p>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-neutral-900">1,200,000₫</div>
                  <Button size="sm">View Room</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-900">Settings</h2>
      
      <div className="space-y-4">
        {[
          { title: 'Notifications', description: 'Manage your notification preferences', icon: Bell },
          { title: 'Privacy & Security', description: 'Control your privacy settings', icon: Shield },
          { title: 'Payment Methods', description: 'Manage your payment options', icon: CreditCard },
        ].map((setting) => {
          const Icon = setting.icon
          return (
            <div key={setting.title} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-neutral-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{setting.title}</h3>
                    <p className="text-neutral-600 text-sm">{setting.description}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <TravelHeader />
        <div className="pt-20 pb-16">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="animate-pulse">
              <div className="h-8 bg-neutral-200 rounded w-48 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="h-64 bg-neutral-200 rounded-2xl"></div>
                <div className="lg:col-span-3 h-96 bg-neutral-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
        <TravelFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <TravelHeader />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-neutral-900 mb-8">My Account</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 sticky top-24">
                  <nav className="space-y-2">
                    {sidebarItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                            activeTab === item.id
                              ? 'bg-primary-50 text-primary-700 border border-primary-200'
                              : 'text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      )
                    })}
                  </nav>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {activeTab === 'profile' && renderProfile()}
                {activeTab === 'bookings' && renderBookings()}
                {activeTab === 'wishlist' && renderWishlist()}
                {activeTab === 'settings' && renderSettings()}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <TravelFooter />
    </div>
  )
}
