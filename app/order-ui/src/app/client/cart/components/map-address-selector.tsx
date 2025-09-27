import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { APIProvider, Map, Marker, type MapMouseEvent, useMap } from '@vis.gl/react-google-maps'
import { useDebouncedCallback } from 'use-debounce'

import { GOOGLE_MAP_DISTANCE_LIMIT, googleMapAPIKey, PHONE_NUMBER_REGEX } from '@/constants'
import { useGetAddressByPlaceId, useGetAddressDirection, useGetAddressSuggestions, useGetDistanceAndDuration } from '@/hooks/use-google-map'
import type { IAddressSuggestion } from '@/types'
import { parseKm, showErrorToastMessage } from '@/utils'
import { createLucideMarkerIcon, MAP_ICONS } from '@/utils'
import { useBranchStore, useOrderFlowStore, useUserStore } from '@/stores'
import { Button, Input } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { Clock, Home, Info, MapPin, Ruler, Truck } from 'lucide-react'

type LatLng = { lat: number; lng: number }
type AddressChange = {
    coords: LatLng | null
    addressText?: string
    placeId?: string | null
}

interface MapAddressSelectNewProps {
    defaultCenter?: LatLng
    defaultZoom?: number
    onLocationChange?: (coords: LatLng | null) => void
    onChange?: (payload: AddressChange) => void
}

export default function MapAddressSelectNew({
    defaultCenter = { lat: 10.8231, lng: 106.6297 },
    defaultZoom = 14,
    onLocationChange,
    onChange,
}: MapAddressSelectNewProps) {
    const { t } = useTranslation('menu')
    const { branch } = useBranchStore()
    const { userInfo } = useUserStore()
    const wrapperRef = useRef<HTMLDivElement | null>(null)

    const [center, setCenter] = useState<LatLng>(defaultCenter)
    const [marker, setMarker] = useState<LatLng | null>(null)
    const [addressInput, setAddressInput] = useState('')
    const [queryAddress, setQueryAddress] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [_selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
    const [isLocating, setIsLocating] = useState(false)
    const [activeSuggestIndex, setActiveSuggestIndex] = useState<number>(-1)
    const [pendingSelection, setPendingSelection] = useState<{ coords: LatLng | null; placeId: string | null; address?: string }>({ coords: null, placeId: null, address: undefined })
    const onChangeRef = useRef(onChange)
    const onLocationChangeRef = useRef(onLocationChange)
    useEffect(() => {
        onChangeRef.current = onChange
        onLocationChangeRef.current = onLocationChange
    }, [onChange, onLocationChange])
    const lastProcessedKeyRef = useRef<string | null>(null)
    const lastRejectedKeyRef = useRef<string | null>(null)


    const debouncedSetAddress = useDebouncedCallback((val: string) => {
        setQueryAddress(val)
        setShowSuggestions(!!val)
    }, 300)

    const { data: suggestionsResp, isLoading: isLoadingSuggest } = useGetAddressSuggestions(queryAddress)
    const suggestions = useMemo<IAddressSuggestion[]>(() => suggestionsResp?.result ?? [], [suggestionsResp])

    const { data: placeResp } = useGetAddressByPlaceId(_selectedPlaceId ?? '')

    // Order flow store actions to persist delivery info
    const {
        setDeliveryAddress: persistDeliveryAddress,
        setDeliveryCoords: persistDeliveryCoords,
        setDeliveryPlaceId: persistDeliveryPlaceId,
        setDeliveryDistanceDuration: persistDeliveryDistanceDuration,
        setDeliveryPhone: persistDeliveryPhone,
        clearDeliveryInfo,
        orderingData,
        isHydrated,
    } = useOrderFlowStore()

    const [phoneInput, setPhoneInput] = useState<string>('')

    // Initialize from persisted store on mount/hydration
    useEffect(() => {
        if (!isHydrated) return
        const lat = orderingData?.deliveryLat
        const lng = orderingData?.deliveryLng
        const address = orderingData?.deliveryAddress || ''
        setPhoneInput(orderingData?.deliveryPhone || userInfo?.phonenumber || '')
        // Persist default delivery phone if not set yet
        if (!orderingData?.deliveryPhone && userInfo?.phonenumber) {
            persistDeliveryPhone(userInfo.phonenumber)
        }
        if (address) setAddressInput(address)
        if (typeof lat === 'number' && typeof lng === 'number') {
            const coords = { lat, lng }
            setMarker(coords)
            setCenter(coords)
            onLocationChangeRef.current?.(coords)
            onChange?.({ coords, addressText: address || undefined, placeId: orderingData?.deliveryPlaceId || undefined })
        }
    }, [isHydrated, orderingData?.deliveryLat, orderingData?.deliveryLng, orderingData?.deliveryAddress, orderingData?.deliveryPlaceId, orderingData?.deliveryPhone, userInfo?.phonenumber, onLocationChange, onChange, persistDeliveryPhone])

    useEffect(() => {
        const coords = placeResp?.result
        if (!coords) return
        setCenter(coords)
        setMarker(coords)
        onLocationChangeRef.current?.(coords)
        // Stage pending; actual persist after distance hook confirms within 3km
        setPendingSelection({ coords, placeId: _selectedPlaceId ?? null, address: addressInput || undefined })
    }, [placeResp, onLocationChange, _selectedPlaceId, addressInput])

    // Directions: fetch and build path when we have branch and a destination marker
    const latForDirection = marker?.lat ?? 0
    const lngForDirection = marker?.lng ?? 0
    const { data: directionResp, isFetching: isFetchingDirection } = useGetAddressDirection(
        branch?.slug ?? '',
        latForDirection,
        lngForDirection,
    )

    const routePath = useMemo<{ lat: number; lng: number }[]>(() => {
        const dir = directionResp?.result
        if (!dir || !dir.legs || dir.legs.length === 0) return []
        const points: { lat: number; lng: number }[] = []
        dir.legs.forEach((leg) => {
            leg.steps.forEach((step) => {
                points.push(step.start_location)
                points.push(step.end_location)
            })
        })
        return points
    }, [directionResp])

    // Prepare data for route overlay
    const routeBounds = useMemo(() => directionResp?.result?.bounds, [directionResp])

    // Distance & Duration (Step 6)
    const { data: distanceResp } = useGetDistanceAndDuration(
        branch?.slug ?? '',
        latForDirection,
        lngForDirection,
    )

    // Gate persistence by actual distance from hook
    useEffect(() => {
        const distText = distanceResp?.result?.distance
        if (!marker || !distText) return
        const km = parseKm(distText)
        if (km == null) return
        const within = km <= GOOGLE_MAP_DISTANCE_LIMIT
        const key = (() => {
            const c = pendingSelection.coords ?? marker
            const p = pendingSelection.placeId ?? _selectedPlaceId ?? ''
            return c ? `${c.lat.toFixed(6)},${c.lng.toFixed(6)}|${p}` : `null|${p}`
        })()
        if (!within) {
            if (lastRejectedKeyRef.current === key) return
            showErrorToastMessage('toast.distanceTooFar')
            // reset map/UI and staged data
            setMarker(null)
            setSelectedPlaceId(null)
            setAddressInput('')
            setPendingSelection({ coords: null, placeId: null, address: undefined })
            setCenter(defaultCenter)
            onChangeRef.current?.({ coords: null, addressText: undefined, placeId: null })
            clearDeliveryInfo()
            lastRejectedKeyRef.current = key
            return
        }
        if (lastProcessedKeyRef.current === key) return
        const coordsToPersist = pendingSelection.coords ?? marker
        const placeIdToPersist = pendingSelection.placeId ?? _selectedPlaceId ?? undefined
        const addressToPersist = pendingSelection.address ?? addressInput
        if (coordsToPersist) {
            persistDeliveryCoords(coordsToPersist.lat, coordsToPersist.lng, placeIdToPersist)
        }
        if (addressToPersist) persistDeliveryAddress(addressToPersist)
        if (placeIdToPersist) persistDeliveryPlaceId(placeIdToPersist)
        persistDeliveryDistanceDuration(distanceResp.result.distance, distanceResp.result.duration)
        setPendingSelection({ coords: null, placeId: null, address: undefined })
        onChangeRef.current?.({ coords: coordsToPersist, addressText: addressToPersist, placeId: placeIdToPersist ?? null })
        lastProcessedKeyRef.current = key
    }, [distanceResp, marker, pendingSelection, _selectedPlaceId, addressInput, persistDeliveryCoords, persistDeliveryAddress, persistDeliveryPlaceId, persistDeliveryDistanceDuration, defaultCenter, clearDeliveryInfo])

    const reverseGeocode = useCallback((coords: { lat: number; lng: number }): Promise<{ address?: string; placeId?: string | null }> => {
        return new Promise((resolve) => {
            if (!window.google?.maps?.Geocoder) {
                resolve({})
                return
            }
            const geocoder = new window.google.maps.Geocoder()
            geocoder.geocode({ location: coords }, (results, status) => {
                if (status === 'OK' && results && results.length > 0) {
                    resolve({ address: results[0].formatted_address, placeId: results[0].place_id })
                } else {
                    resolve({})
                }
            })
        })
    }, [])

    const handleUseCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            showErrorToastMessage('toast.geolocationNotSupported')
            return
        }
        setIsLocating(true)
        setShowSuggestions(false)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                setCenter(coords)
                setMarker(coords)
                onLocationChangeRef.current?.(coords)
                // Reverse geocode to get human-readable address & placeId
                reverseGeocode(coords).then(({ address, placeId }) => {
                    const addressText = address || t('cart.useCurrentLocation')
                    if (addressText) setAddressInput(addressText)
                    // Stage pending; persistence gated by distance hook
                    setPendingSelection({ coords, placeId: placeId ?? null, address: addressText })
                }).finally(() => {
                    setIsLocating(false)
                })
            },
            (err) => {
                setIsLocating(false)
                if (err.code === 1) {
                    showErrorToastMessage('toast.locationPermissionDenied')
                } else if (err.code === 2) {
                    showErrorToastMessage('toast.locationUnavailable')
                } else if (err.code === 3) {
                    showErrorToastMessage('toast.locationTimeout')
                } else {
                    showErrorToastMessage('toast.requestFailed')
                }
            },
            { enableHighAccuracy: true, timeout: 10000 },
        )
    }, [reverseGeocode, t])

    const onMapClick = useCallback((event: MapMouseEvent) => {
        const { latLng } = event.detail
        if (latLng) {
            const coords = { lat: latLng.lat, lng: latLng.lng }
            setMarker(coords)
            setCenter(coords)
            onLocationChangeRef.current?.(coords)
            // Reverse geocode clicked point to update address and placeId
            reverseGeocode(coords).then(({ address, placeId }) => {
                const addressText = address || addressInput
                if (addressText) setAddressInput(addressText)
                setSelectedPlaceId(placeId ?? null)
                // Stage pending; persistence gated by distance hook
                setPendingSelection({ coords, placeId: placeId ?? _selectedPlaceId ?? null, address: addressText })
            })
        }
    }, [addressInput, reverseGeocode, _selectedPlaceId])

    const branchPosition = useMemo<LatLng | null>(() => {
        const lat = branch?.addressDetail?.lat
        const lng = branch?.addressDetail?.lng
        if (typeof lat === 'number' && typeof lng === 'number') return { lat, lng }
        return null
    }, [branch])

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!wrapperRef.current) return
            if (!wrapperRef.current.contains(e.target as Node)) {
                setShowSuggestions(false)
                setActiveSuggestIndex(-1)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div className="flex flex-col gap-3 p-2 bg-white rounded-md border dark:bg-transparent" ref={wrapperRef}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
                <div className="flex flex-col col-span-1 gap-3 sm:col-span-2">
                    <span className="flex gap-1 items-center text-xs text-destructive">
                        <Info className="w-3 h-3" />
                        {t('cart.deliveryAddressNote')}
                    </span>
                    <div className="flex relative flex-col gap-2">
                        <Input
                            value={addressInput}
                            onChange={(e) => {
                                const val = e.target.value
                                setAddressInput(val)
                                debouncedSetAddress(val)
                                setSelectedPlaceId(null)
                                setActiveSuggestIndex(-1)
                            }}
                            placeholder={t('cart.enterAddress')}
                            className="h-10 text-sm sm:h-9"
                            onFocus={() => setShowSuggestions(!!addressInput)}
                            onKeyDown={(e) => {
                                if (!showSuggestions) return
                                if (e.key === 'ArrowDown') {
                                    e.preventDefault()
                                    setActiveSuggestIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
                                } else if (e.key === 'ArrowUp') {
                                    e.preventDefault()
                                    setActiveSuggestIndex((prev) => Math.max(prev - 1, 0))
                                } else if (e.key === 'Enter') {
                                    e.preventDefault()
                                    const idx = activeSuggestIndex >= 0 ? activeSuggestIndex : 0
                                    const s = suggestions[idx]
                                    if (s) {
                                        const main = s.placePrediction.structuredFormat.mainText.text
                                        const secondary = s.placePrediction.structuredFormat.secondaryText?.text
                                        const pid = s.placePrediction.placeId
                                        const text = `${main}${secondary ? `, ${secondary}` : ''}`
                                        setAddressInput(text)
                                        setSelectedPlaceId(pid)
                                        setShowSuggestions(false)
                                        setActiveSuggestIndex(-1)
                                        onChange?.({ coords: null, addressText: text, placeId: pid })
                                    }
                                } else if (e.key === 'Escape') {
                                    setShowSuggestions(false)
                                    setActiveSuggestIndex(-1)
                                }
                            }}
                        />
                        {showSuggestions && (
                            <div className="overflow-auto absolute right-0 left-0 top-full z-10 mt-2 max-h-72 bg-white rounded-md border shadow">
                                <div className="sticky top-0 z-10 px-3 py-2 text-xs bg-white border-b text-muted-foreground">{t('cart.suggestions')}</div>
                                {isLoadingSuggest && (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">{t('cart.loading')}</div>
                                )}
                                {!isLoadingSuggest && suggestions.length === 0 && (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">{t('cart.noSuggestions')}</div>
                                )}
                                {!isLoadingSuggest && suggestions.map((s) => {
                                    const main = s.placePrediction.structuredFormat.mainText.text
                                    const secondary = s.placePrediction.structuredFormat.secondaryText?.text
                                    const pid = s.placePrediction.placeId
                                    const idx = suggestions.findIndex((x) => x.placePrediction.placeId === pid)
                                    return (
                                        <Button
                                            variant="ghost"
                                            key={pid}
                                            role="option"
                                            onClick={() => {
                                                const text = `${main}${secondary ? `, ${secondary}` : ''}`
                                                setAddressInput(text)
                                                setSelectedPlaceId(pid)
                                                setShowSuggestions(false)
                                                onChange?.({ coords: null, addressText: text, placeId: pid })
                                                setActiveSuggestIndex(-1)
                                                // do not persist here; wait for placeResp distance check
                                            }}
                                            onMouseEnter={() => setActiveSuggestIndex(idx)}
                                            onMouseDown={(e) => e.preventDefault()}
                                        >
                                            <div className="text-sm font-medium">{main}</div>
                                            {secondary && <div className="text-xs text-muted-foreground">{secondary}</div>}
                                        </Button>
                                    )
                                })}
                            </div>
                        )}
                        <Button
                            onClick={handleUseCurrentLocation}
                            disabled={isLocating}
                            className="h-10 sm:h-9"
                        >
                            {isLocating ? t('cart.loading') : t('cart.useCurrentLocation')}
                        </Button>
                    </div>

                    {/* Phone input */}
                    <div className="flex flex-col gap-2 items-start">
                        <label className="w-32 text-sm text-muted-foreground">{t('cart.phoneNumber')}</label>
                        <div className="flex flex-row gap-2 items-center w-full">
                            <Input
                                inputMode="tel"
                                value={phoneInput}
                                onChange={(e) => {
                                    const sanitized = e.target.value.replace(/\D/g, '').slice(0, 10)
                                    setPhoneInput(sanitized)
                                    persistDeliveryPhone(sanitized)
                                }}
                                placeholder={t('cart.enterPhoneNumber')}
                                className={`w-full text-sm h-10 sm:h-9 ${phoneInput && !PHONE_NUMBER_REGEX.test(phoneInput) ? 'border-destructive' : ''}`}
                            />
                        </div>
                        {phoneInput && !PHONE_NUMBER_REGEX.test(phoneInput) && (
                            <div className="mt-1 text-xs text-destructive">{t('cart.invalidPhoneNumber')}</div>
                        )}
                    </div>
                    {/* Delivery summary inside left column */}
                    <div className="p-4 bg-white rounded-xl border dark:bg-transparent">
                        <h3 className="flex gap-2 items-center mb-3 text-base font-semibold text-foreground">
                            <Truck className="w-4 h-4 text-primary" />
                            {t('cart.deliveryInfo')}
                        </h3>

                        <div className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex gap-2 items-start">
                                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                <div>
                                    <span className="font-medium">{t('cart.restaurantAddress')}: </span>
                                    <span>{branch?.address || t('cart.noAddressSelected')}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 items-start">
                                <Home className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                <div>
                                    <span className="font-medium">{t('cart.deliveryAddress')}: </span>
                                    <span>{orderingData?.deliveryAddress || addressInput || t('cart.noAddressSelected')}</span>
                                </div>
                            </div>

                            {marker && (
                                <div className="flex flex-wrap gap-6 pl-6">
                                    <div className="flex gap-1 items-center">
                                        <Ruler className="w-4 h-4 text-muted-foreground" />
                                        <span>{distanceResp?.result?.distance || '-'}</span>
                                    </div>
                                    <div className="flex gap-1 items-center">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span>{distanceResp?.result?.duration || '-'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                <div className="col-span-1 w-full h-64 sm:col-span-3 sm:h-80 lg:h-auto">
                    <APIProvider apiKey={googleMapAPIKey}>
                        <Map
                            className="w-full h-full rounded-md border"
                            defaultCenter={center}
                            defaultZoom={defaultZoom}
                            gestureHandling={'greedy'}
                            disableDefaultUI={false}
                            onClick={onMapClick}
                        >
                            {isFetchingDirection && (
                                <div className="absolute top-2 left-2 z-20 px-2 py-1 text-xs rounded border text-muted-foreground bg-white/90">
                                    {t('cart.drawingRoute')}
                                </div>
                            )}
                            {branchPosition && (
                                <Marker
                                    position={branchPosition}
                                    icon={createLucideMarkerIcon(MAP_ICONS.store, '#1a73e8', 30)}
                                />
                            )}
                            <MapPanner panToCoords={center} />
                            {marker && (
                                <Marker
                                    position={marker}
                                    icon={createLucideMarkerIcon(MAP_ICONS.mapPin, '#d93025', 30)}
                                />
                            )}
                            <RouteOverlay routePath={routePath} routeBounds={routeBounds} marker={marker} />
                        </Map>
                    </APIProvider>
                </div>
            </div>
        </div>
    )
}

function MapPanner({ panToCoords }: { panToCoords: { lat: number; lng: number } }) {
    const map = useMap()
    useEffect(() => {
        if (!map || !panToCoords) return
        map.panTo(panToCoords)
    }, [map, panToCoords])
    return null
}

function RouteOverlay({
    routePath,
    routeBounds,
    marker,
}: {
    routePath: { lat: number; lng: number }[]
    routeBounds?: { northeast: { lat: number; lng: number }; southwest: { lat: number; lng: number } }
    marker: { lat: number; lng: number } | null
}) {
    const map = useMap()
    const polylineRef = useRef<google.maps.Polyline | null>(null)

    useEffect(() => {
        if (!map) return
        if (polylineRef.current) {
            polylineRef.current.setMap(null)
            polylineRef.current = null
        }
        if (routePath.length === 0) return

        const poly = new google.maps.Polyline({
            path: routePath,
            geodesic: true,
            strokeColor: '#1a73e8',
            strokeOpacity: 0.9,
            strokeWeight: 5,
        })
        poly.setMap(map)
        polylineRef.current = poly

        const bounds = new google.maps.LatLngBounds()
        routePath.forEach((p) => bounds.extend(new google.maps.LatLng(p.lat, p.lng)))
        if (marker) bounds.extend(new google.maps.LatLng(marker.lat, marker.lng))
        if (routeBounds) {
            const apiBounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(routeBounds.southwest.lat, routeBounds.southwest.lng),
                new google.maps.LatLng(routeBounds.northeast.lat, routeBounds.northeast.lng),
            )
            map.fitBounds(apiBounds)
        } else if (!bounds.isEmpty()) {
            map.fitBounds(bounds)
        }

        return () => {
            if (polylineRef.current) {
                polylineRef.current.setMap(null)
                polylineRef.current = null
            }
        }
    }, [map, routePath, marker, routeBounds])

    return null
}

