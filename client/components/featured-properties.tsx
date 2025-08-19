import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Wifi, Car, Coffee } from "lucide-react"

const featuredProperties = [
  {
    id: 1,
    title: "Villa Sapa View",
    location: "Sapa, Lào Cai",
    price: "1,200,000",
    rating: 4.9,
    reviews: 127,
    image: "/sapa-mountain-villa.png",
    amenities: ["Wifi", "Parking", "Kitchen"],
    type: "Villa",
  },
  {
    id: 2,
    title: "Homestay Hội An Cổ Kính",
    location: "Hội An, Quảng Nam",
    price: "800,000",
    rating: 4.8,
    reviews: 89,
    image: "/hoi-an-traditional-house.png",
    amenities: ["Wifi", "Breakfast", "Bicycle"],
    type: "Traditional House",
  },
  {
    id: 3,
    title: "Beachfront Homestay",
    location: "Nha Trang, Khánh Hòa",
    price: "1,500,000",
    rating: 4.7,
    reviews: 156,
    image: "/nha-trang-beachfront-homestay.png",
    amenities: ["Wifi", "Pool", "Beach Access"],
    type: "Beachfront",
  },
]

export function FeaturedProperties() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredProperties.map((property) => (
        <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative">
            <img src={property.image || "/placeholder.svg"} alt={property.title} className="w-full h-52 object-cover" />
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">{property.type}</Badge>
          </div>

          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-serif font-semibold text-lg text-foreground line-clamp-1">{property.title}</h3>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{property.rating}</span>
                <span className="text-muted-foreground">({property.reviews})</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground mb-3">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{property.location}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {property.amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary" className="text-xs">
                  {amenity === "Wifi" && <Wifi className="h-3 w-3 mr-1" />}
                  {amenity === "Parking" && <Car className="h-3 w-3 mr-1" />}
                  {amenity === "Kitchen" && <Coffee className="h-3 w-3 mr-1" />}
                  {amenity}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-lg text-foreground">{property.price.toLocaleString()}₫</span>
                <span className="text-muted-foreground text-sm">/đêm</span>
              </div>
              <Button size="sm">Xem chi tiết</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
