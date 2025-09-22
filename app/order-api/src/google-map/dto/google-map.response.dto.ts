import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class AutocompleteAddressResponseDto {
  @AutoMap()
  @ApiProperty()
  description: string;

  @AutoMap()
  @ApiProperty()
  place_id: string;
}

// Get address from gg api
export class PredictionDto {
  @AutoMap()
  @ApiProperty()
  description: string;

  @AutoMap()
  @ApiProperty()
  place_id: string;

  @AutoMap()
  @ApiProperty()
  reference: string;
}

export class PlaceAutocompleteResponseDto {
  @AutoMap(() => [PredictionDto])
  @ApiProperty({ type: [PredictionDto] })
  predictions: PredictionDto[];

  @AutoMap()
  @ApiProperty()
  status: string;
}

export class LocationResponseDto {
  @AutoMap()
  @ApiProperty()
  lat: number;

  @AutoMap()
  @ApiProperty()
  lng: number;
}

// Get address by place id from gg api
export class LocationDto {
  @AutoMap()
  @ApiProperty()
  lat: number;

  @AutoMap()
  @ApiProperty()
  lng: number;
}

export class ViewportDto {
  @AutoMap(() => LocationDto)
  @ApiProperty({ type: LocationDto })
  northeast: LocationDto;

  @AutoMap(() => LocationDto)
  @ApiProperty({ type: LocationDto })
  southwest: LocationDto;
}

export class GeometryDto {
  @AutoMap(() => LocationDto)
  @ApiProperty({ type: LocationDto })
  location: LocationDto;

  @AutoMap(() => ViewportDto)
  @ApiProperty({ type: ViewportDto })
  viewport: ViewportDto;
}

export class PlaceDetailsResultResponseDto {
  @AutoMap()
  @ApiProperty()
  formatted_address: string;

  @AutoMap(() => [Object])
  @ApiProperty({ type: [Object] })
  address_components: any[];

  @AutoMap(() => GeometryDto)
  @ApiProperty({ type: GeometryDto })
  geometry: GeometryDto;

  @AutoMap()
  @ApiProperty()
  name: string;

  @AutoMap()
  @ApiProperty()
  place_id: string;

  @AutoMap()
  @ApiProperty()
  reference: string;

  @AutoMap()
  @ApiProperty()
  url: string;

  @AutoMap()
  @ApiProperty()
  utc_offset: number;

  @AutoMap()
  @ApiProperty()
  vicinity: string;
}

export class PlaceDetailsResponseDto {
  @AutoMap()
  @ApiProperty()
  html_attributions: any[];

  @AutoMap(() => PlaceDetailsResultResponseDto)
  @ApiProperty({ type: PlaceDetailsResultResponseDto })
  result: PlaceDetailsResultResponseDto;
}

// Get distance and duration from gg api
export class DistanceValueDto {
  @AutoMap()
  @ApiProperty()
  text: string;

  @AutoMap()
  @ApiProperty()
  value: number;
}

export class ElementDto {
  @AutoMap(() => DistanceValueDto)
  @ApiProperty({ type: () => DistanceValueDto })
  distance: DistanceValueDto;

  @AutoMap(() => DistanceValueDto)
  @ApiProperty({ type: () => DistanceValueDto })
  duration: DistanceValueDto;
}

export class RowDto {
  @AutoMap(() => [ElementDto])
  @ApiProperty({ type: () => [ElementDto] })
  elements: ElementDto[];
}

export class DistanceMatrixResponseDto {
  @AutoMap(() => [String])
  @ApiProperty({ type: [String] })
  destination_addresses: string[];

  @AutoMap(() => [String])
  @ApiProperty({ type: [String] })
  origin_addresses: string[];

  @AutoMap(() => [RowDto])
  @ApiProperty({ type: () => [RowDto] })
  rows: RowDto[];

  @AutoMap()
  @ApiProperty()
  status: string;
}

// Get distance and duration
export class DistanceAndDurationResponseDto {
  // unit: km
  @AutoMap()
  @ApiProperty()
  distance: string;

  // unit: minutes
  @AutoMap()
  @ApiProperty()
  duration: string;
}

// Get address direction from gg api
export class LatLngDto {
  @AutoMap()
  @ApiProperty()
  lat: number;

  @AutoMap()
  @ApiProperty()
  lng: number;
}

export class DistanceDurationDto {
  @AutoMap()
  @ApiProperty()
  text: string;

  @AutoMap()
  @ApiProperty()
  value: number;
}

export class GeocodedWaypointDto {
  @AutoMap()
  @ApiProperty()
  geocoder_status: string;

  @AutoMap()
  @ApiProperty()
  place_id: string;

  @AutoMap(() => [String])
  @ApiProperty({ type: [String] })
  types: string[];
}

export class PolylineDto {
  @AutoMap()
  @ApiProperty()
  points: string;
}

export class StepDto {
  @AutoMap(() => DistanceDurationDto)
  @ApiProperty({ type: () => DistanceDurationDto })
  distance: DistanceDurationDto;

  @AutoMap(() => DistanceDurationDto)
  @ApiProperty({ type: () => DistanceDurationDto })
  duration: DistanceDurationDto;

  @AutoMap(() => LatLngDto)
  @ApiProperty({ type: () => LatLngDto })
  end_location: LatLngDto;

  @AutoMap()
  @ApiProperty()
  html_instructions: string;

  @AutoMap(() => PolylineDto)
  @ApiProperty({ type: () => PolylineDto })
  polyline: PolylineDto;

  @AutoMap(() => LatLngDto)
  @ApiProperty({ type: () => LatLngDto })
  start_location: LatLngDto;

  @AutoMap()
  @ApiProperty()
  travel_mode: string;

  @AutoMap()
  @ApiProperty({ required: false })
  maneuver?: string;
}

export class LegDto {
  @AutoMap(() => DistanceDurationDto)
  @ApiProperty({ type: () => DistanceDurationDto })
  distance: DistanceDurationDto;

  @AutoMap(() => DistanceDurationDto)
  @ApiProperty({ type: () => DistanceDurationDto })
  duration: DistanceDurationDto;

  @AutoMap()
  @ApiProperty()
  end_address: string;

  @AutoMap(() => LatLngDto)
  @ApiProperty({ type: () => LatLngDto })
  end_location: LatLngDto;

  @AutoMap()
  @ApiProperty()
  start_address: string;

  @AutoMap(() => LatLngDto)
  @ApiProperty({ type: () => LatLngDto })
  start_location: LatLngDto;

  @AutoMap(() => [StepDto])
  @ApiProperty({ type: [StepDto] })
  steps: StepDto[];

  @AutoMap(() => [Object])
  @ApiProperty({ type: [Object] })
  traffic_speed_entry: any[];

  @AutoMap(() => [Object])
  @ApiProperty({ type: [Object] })
  via_waypoint: any[];
}

export class BoundsDto {
  @AutoMap(() => LatLngDto)
  @ApiProperty({ type: () => LatLngDto })
  northeast: LatLngDto;

  @AutoMap(() => LatLngDto)
  @ApiProperty({ type: () => LatLngDto })
  southwest: LatLngDto;
}

export class RouteDto {
  @AutoMap(() => BoundsDto)
  @ApiProperty({ type: () => BoundsDto })
  bounds: BoundsDto;

  @AutoMap()
  @ApiProperty()
  copyrights: string;

  @AutoMap(() => [LegDto])
  @ApiProperty({ type: [LegDto] })
  legs: LegDto[];

  @AutoMap(() => PolylineDto)
  @ApiProperty({ type: () => PolylineDto })
  overview_polyline: PolylineDto;

  @AutoMap()
  @ApiProperty()
  summary: string;

  @AutoMap(() => [String])
  @ApiProperty({ type: [String] })
  warnings: string[];

  @AutoMap(() => [Number])
  @ApiProperty({ type: [Number] })
  waypoint_order: number[];
}

export class DirectionsResponseDto {
  @AutoMap(() => [GeocodedWaypointDto])
  @ApiProperty({ type: [GeocodedWaypointDto] })
  geocoded_waypoints: GeocodedWaypointDto[];

  @AutoMap(() => [RouteDto])
  @ApiProperty({ type: [RouteDto] })
  routes: RouteDto[];

  @AutoMap()
  @ApiProperty()
  status: string;
}

// Get direction
export class RouteAndDirectionResponseDto {
  @AutoMap(() => BoundsDto)
  @ApiProperty({ type: () => BoundsDto })
  bounds: BoundsDto;

  @AutoMap()
  @ApiProperty()
  copyrights: string;

  @AutoMap(() => [LegDto])
  @ApiProperty({ type: [LegDto] })
  legs: LegDto[];

  @AutoMap(() => PolylineDto)
  @ApiProperty({ type: () => PolylineDto })
  overview_polyline: PolylineDto;

  @AutoMap()
  @ApiProperty()
  summary: string;

  @AutoMap(() => [String])
  @ApiProperty({ type: [String] })
  warnings: string[];

  @AutoMap(() => [Number])
  @ApiProperty({ type: [Number] })
  waypoint_order: number[];
}

export class AddressResponseDto {
  @AutoMap()
  @ApiProperty()
  formattedAddress: string;

  @AutoMap()
  @ApiProperty()
  url: string;

  @AutoMap()
  @ApiProperty()
  lat: number;

  @AutoMap()
  @ApiProperty()
  lng: number;
}
