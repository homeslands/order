import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { googleMapAPIKey } from '@/constants';

export default function GoogleMap() {
    return (
        <APIProvider apiKey={googleMapAPIKey}>
            <Map
                className='w-full h-full rounded-md border-2 border-white'
                defaultCenter={{ lat: 10.858258, lng: 106.784329 }}
                defaultZoom={17}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
            >
                <Marker position={{ lat: 10.858258, lng: 106.784329 }} />
            </Map>
        </APIProvider>
    )
}