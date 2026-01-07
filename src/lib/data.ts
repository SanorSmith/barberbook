import { Service, Barber } from './types'

export const services: Service[] = [
  { id: 1, name: "Classic Haircut", price: 35, duration: 30, icon: "scissors", description: "Traditional cut tailored to your style", category: "HAIRCUT" },
  { id: 2, name: "Signature Fade", price: 45, duration: 45, icon: "layers", description: "Precision fade with seamless blending", category: "HAIRCUT" },
  { id: 3, name: "Beard Sculpting", price: 25, duration: 20, icon: "user", description: "Expert shaping and conditioning", category: "BEARD" },
  { id: 4, name: "Hot Towel Shave", price: 40, duration: 30, icon: "wind", description: "Luxurious traditional straight razor shave", category: "SHAVE" },
  { id: 5, name: "The Executive", price: 65, duration: 60, icon: "crown", description: "Haircut + beard + hot towel treatment", category: "PACKAGE" },
  { id: 6, name: "Junior Cut", price: 25, duration: 20, icon: "smile", description: "Expert cuts for young gentlemen (under 12)", category: "HAIRCUT" }
]

export const barbers: Barber[] = [
  { 
    id: 1, 
    name: "Marcus Williams", 
    role: "Senior Barber", 
    rating: 4.9, 
    reviews: 127, 
    experience: "12 years", 
    image: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=600", 
    specialties: ["Fades", "Designs", "Classic"] 
  },
  { 
    id: 2, 
    name: "James Chen", 
    role: "Master Barber", 
    rating: 4.8, 
    reviews: 94, 
    experience: "8 years", 
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600", 
    specialties: ["Beards", "Hot Shaves"] 
  },
  { 
    id: 3, 
    name: "David Thompson", 
    role: "Style Specialist", 
    rating: 4.9, 
    reviews: 78, 
    experience: "6 years", 
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600", 
    specialties: ["Modern", "Textures"] 
  }
]
