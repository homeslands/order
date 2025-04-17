import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { googleMapAPIKey } from '@/constants';

export default function GoogleMap() {
  const mapCenter = { lat: 10.847359, lng: 106.771239 };

  const handleMarkerClick = () => {
    const destination = `${mapCenter.lat},${mapCenter.lng}`;
    window.open(`https://www.google.com/maps?q=${destination}`, '_blank');
  };

  return (
    <APIProvider apiKey={googleMapAPIKey}>
      <Map
        className="h-full w-full rounded-md border-2 border-white"
        defaultCenter={mapCenter}
        defaultZoom={17}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        <Marker position={mapCenter} onClick={handleMarkerClick} />
      </Map>
    </APIProvider>
  );
}
