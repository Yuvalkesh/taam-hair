export interface Review {
  author: string
  text: string
  rating?: number
  source?: string | null
}

export interface Place {
  id: string
  name: string
  city: string
  region: string
  category: string
  address: string
  description: string
  googleMapsUrl: string
  lat: number
  lng: number
  priceLevel?: string | null
  rating?: number | null
  submittedBy?: string | null
  needsConfirm?: boolean
  reviews: Review[]
}

// Shape of a brand-new place coming from the Add form (before id/coords assigned).
export interface NewPlaceInput {
  name: string
  city: string
  region: string
  category: string
  address: string
  description: string
  googleMapsUrl: string
  priceLevel?: string | null
  submittedBy?: string | null
  firstReview?: string
}
