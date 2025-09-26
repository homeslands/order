export interface IAddress {
  description: string
  place_id: string
}

export interface IAddressSuggestion {
  placePrediction: {
    place: string
    placeId: string
    text: {
      text: string
      matches: {
        endOffset: number
      }[]
    }
    structuredFormat: {
      mainText: {
        text: string
        matches: {
          endOffset: number
        }[]
      }
      secondaryText: {
        text: string
      }
    }
    types: string[]
  }
}

export interface IAddressByPlaceId {
  lat: number
  lng: number
}

export interface ILatLng {
  lat: number
  lng: number
}

export interface IBounds {
  northeast: ILatLng
  southwest: ILatLng
}

export interface IDistance {
  text: string
  value: number
}

export interface IDuration {
  text: string
  value: number
}

export interface IPolyline {
  points: string
}

export interface IStep {
  distance: IDistance
  duration: IDuration
  end_location: ILatLng
  html_instructions: string
  polyline: IPolyline
  start_location: ILatLng
  travel_mode: string
  maneuver?: string
}

export interface ILeg {
  distance: IDistance
  duration: IDuration
  end_address: string
  end_location: ILatLng
  start_address: string
  start_location: ILatLng
  steps: IStep[]
}

export interface IAddressDirection {
  bounds: IBounds
  copyrights: string
  legs: ILeg[]
}

export interface IDistanceAndDuration {
  distance: string
  duration: string
}
