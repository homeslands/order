import { useEffect, useMemo, useRef, useState } from 'react'
import { APIProvider, Map, Marker, type MapMouseEvent, useMap } from '@vis.gl/react-google-maps'
import { useDebouncedCallback } from 'use-debounce'
import { useTranslation } from 'react-i18next'
import { Clock, Home, MapPin, Ruler, Truck } from 'lucide-react'

import { googleMapAPIKey, PHONE_NUMBER_REGEX } from '@/constants'
import { useGetAddressByPlaceId, useGetAddressDirection, useGetAddressSuggestions, useGetDistanceAndDuration } from '@/hooks/use-google-map'
import { OrderTypeEnum, type IAddressSuggestion } from '@/types'
import { showToast, showErrorToastMessage, parseKm, useGetBranchDeliveryConfig } from '@/utils'
import { createLucideMarkerIcon, MAP_ICONS } from '@/utils'
import { useBranchStore, useOrderFlowStore } from '@/stores'
import { Button, Input } from '@/components/ui'
import { useUpdateOrderType } from '@/hooks'

type LatLng = { lat: number; lng: number }
type AddressChange = {
    coords: LatLng | null
    addressText?: string
    placeId?: string | null
}

interface MapAddressSelectorInUpdateOrderProps {
    onSubmit?: () => void
    defaultCenter?: LatLng
    defaultZoom?: number
    onLocationChange?: (coords: LatLng | null) => void
    onChange?: (payload: AddressChange) => void
}

export default function MapAddressSelectorInUpdateOrder({
    defaultCenter = { lat: 10.8231, lng: 106.6297 },
    defaultZoom = 14,
    onLocationChange,
    onChange,
    onSubmit,
}: MapAddressSelectorInUpdateOrderProps) {
    const { t } = useTranslation('menu')
    const { t: tToast } = useTranslation('toast')
    // const { userInfo } = useUserStore()
    const { branch } = useBranchStore()
    const wrapperRef = useRef<HTMLDivElement | null>(null)
    const { mutate: updateOrderType, isPending } = useUpdateOrderType()

    const [center, setCenter] = useState<LatLng>(defaultCenter)
    const [marker, setMarker] = useState<LatLng | null>(null)
    const [addressInput, setAddressInput] = useState('')
    const [queryAddress, setQueryAddress] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [_selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
    const [activeSuggestIndex, setActiveSuggestIndex] = useState<number>(-1)
    const [isLocating, setIsLocating] = useState(false)
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)
    const [pendingSelection, setPendingSelection] = useState<{ coords: LatLng | null; placeId: string | null; address?: string }>({ coords: null, placeId: null, address: undefined })
    const phoneInputRef = useRef<HTMLInputElement | null>(null)
    const lastProcessedKeyRef = useRef<string | null>(null)
    const lastRejectedKeyRef = useRef<string | null>(null)
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const { maxDistance } = useGetBranchDeliveryConfig(branch?.slug ?? '')

    const debouncedSetAddress = useDebouncedCallback((val: string) => {
        setQueryAddress(val)
        setShowSuggestions(!!val)
    }, 300)

    const { data: suggestionsResp, isLoading: isLoadingSuggest } = useGetAddressSuggestions(queryAddress)
    const suggestions = useMemo<IAddressSuggestion[]>(() => suggestionsResp?.result ?? [], [suggestionsResp])

    const { data: placeResp } = useGetAddressByPlaceId(_selectedPlaceId ?? '')

    // Order flow store actions
    const {
        setDraftDeliveryAddress: persistDraftDeliveryAddress,
        setDraftDeliveryCoords: persistDraftDeliveryCoords,
        setDraftDeliveryPlaceId: persistDraftDeliveryPlaceId,
        setDraftDeliveryDistanceDuration: persistDraftDeliveryDistanceDuration,
        updatingData,
        isHydrated,
        clearUpdatingData,
    } = useOrderFlowStore()

    const originalPhone = updatingData?.originalOrder?.deliveryPhone || ''
    const originalPlaceId = updatingData?.originalOrder?.deliveryTo?.placeId || ''
    const originalAddress = updatingData?.originalOrder?.deliveryAddress || ''
    const slug = updatingData?.originalOrder?.slug || ''

    const [phoneInput, setPhoneInput] = useState<string>('')

    // Check if there are changes from original values
    const hasAddressChanged = addressInput !== originalAddress || _selectedPlaceId !== originalPlaceId
    const hasPhoneChanged = phoneInput !== originalPhone
    const hasAnyChanges = hasAddressChanged || hasPhoneChanged

    // Validation for button enable/disable
    const hasValidPhone = !!phoneInput && PHONE_NUMBER_REGEX.test(phoneInput)
    const hasAddress = Boolean(addressInput || _selectedPlaceId)

    // Initialize from original order data on mount
    useEffect(() => {
        if (!isHydrated || !updatingData?.originalOrder) return

        // Set initial values from original order
        setPhoneInput(originalPhone)
        setAddressInput(originalAddress)
        setSelectedPlaceId(originalPlaceId)

        // Set map position from original order
        const originalCoords = updatingData.originalOrder.deliveryTo ? {
            lat: updatingData.originalOrder.deliveryTo.lat,
            lng: updatingData.originalOrder.deliveryTo.lng
        } : null

        if (originalCoords) {
            setMarker(originalCoords)
            setCenter(originalCoords)
            onLocationChange?.(originalCoords)
        }
    }, [isHydrated, updatingData?.originalOrder, originalPhone, originalAddress, originalPlaceId, onLocationChange])

    useEffect(() => {
        const coords = placeResp?.result
        if (!coords) return

        // Validate coordinates before using them
        if (typeof coords.lat !== 'number' || typeof coords.lng !== 'number' ||
            isNaN(coords.lat) || isNaN(coords.lng) ||
            !isFinite(coords.lat) || !isFinite(coords.lng)) {
            return
        }

        setCenter(coords)
        setMarker(coords)
        onLocationChange?.(coords)
        // Stage pending; actual persist after distance hook confirms within 3km
        setPendingSelection({ coords, placeId: _selectedPlaceId ?? null, address: addressInput || undefined })
    }, [placeResp, onLocationChange, _selectedPlaceId, addressInput])

    // Get the effective marker position (prioritize local marker over store data)
    const effectiveMarker = useMemo(() => {
        // If we have a local marker (from user interaction), use it
        if (marker) {
            return marker
        }

        // Otherwise, fall back to store data
        const storeLat = updatingData?.updateDraft?.deliveryTo?.lat
        const storeLng = updatingData?.updateDraft?.deliveryTo?.lng

        // Convert string to number if needed
        const lat = typeof storeLat === 'string' ? parseFloat(storeLat) : storeLat
        const lng = typeof storeLng === 'string' ? parseFloat(storeLng) : storeLng

        if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
            return { lat, lng }
        }
        return null
    }, [marker, updatingData?.updateDraft?.deliveryTo?.lat, updatingData?.updateDraft?.deliveryTo?.lng])

    // Directions: fetch and build path when we have branch and a destination marker
    const latForDirection = effectiveMarker?.lat ?? 0
    const lngForDirection = effectiveMarker?.lng ?? 0
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

    // Distance validation and persistence
    useEffect(() => {
        const distText = distanceResp?.result?.distance
        if (!effectiveMarker || !distText) return

        const km = parseKm(distText)
        if (km == null) return

        const within = km <= maxDistance
        const key = (() => {
            const c = pendingSelection.coords ?? effectiveMarker
            const p = pendingSelection.placeId ?? _selectedPlaceId ?? ''
            if (c && typeof c.lat === 'number' && typeof c.lng === 'number') {
                return `${c.lat.toFixed(6)},${c.lng.toFixed(6)}|${p}`
            }
            return `null|${p}`
        })()

        if (!within) {
            // Only show toast if this is a new rejection (different key)
            if (lastRejectedKeyRef.current !== key) {

                // Clear any existing timeout
                if (toastTimeoutRef.current) {
                    clearTimeout(toastTimeoutRef.current)
                }

                // Show toast immediately for new rejection
                showErrorToastMessage(tToast('toast.distanceTooFar'))
                lastRejectedKeyRef.current = key

                // Set timeout to allow new rejections after 2 seconds
                toastTimeoutRef.current = setTimeout(() => {
                    lastRejectedKeyRef.current = null
                }, 2000)
            }
            // Reset UI and map to original position
            const originalCoords = updatingData?.originalOrder?.deliveryTo ? {
                lat: updatingData.originalOrder.deliveryTo.lat,
                lng: updatingData.originalOrder.deliveryTo.lng
            } : null
            const originalPlaceId = updatingData?.originalOrder?.deliveryTo?.placeId || ''
            const originalAddress = updatingData?.originalOrder?.deliveryAddress || ''

            setMarker(originalCoords)
            setCenter(originalCoords || defaultCenter)
            setSelectedPlaceId(originalPlaceId)
            setAddressInput(originalAddress)
            setPendingSelection({ coords: null, placeId: null, address: undefined })
            onChange?.({ coords: originalCoords, addressText: originalAddress, placeId: originalPlaceId })
            // Don't clear all updating data, just clear specific delivery data
            // clearUpdatingData()
            return
        }

        if (lastProcessedKeyRef.current === key) return

        const coordsToPersist = pendingSelection.coords ?? effectiveMarker
        const placeIdToPersist = pendingSelection.placeId ?? _selectedPlaceId ?? undefined
        const addressToPersist = pendingSelection.address ?? addressInput

        // Persist to store update draft
        if (coordsToPersist) {
            persistDraftDeliveryCoords(coordsToPersist.lat, coordsToPersist.lng, placeIdToPersist)
        }
        if (addressToPersist) {
            persistDraftDeliveryAddress(addressToPersist)
        }
        if (placeIdToPersist) {
            persistDraftDeliveryPlaceId(placeIdToPersist)
        }
        if (distanceResp?.result?.distance && distanceResp?.result?.duration) {
            persistDraftDeliveryDistanceDuration(distanceResp.result.distance, distanceResp.result.duration)
        }

        setPendingSelection({ coords: null, placeId: null, address: undefined })
        onChange?.({ coords: coordsToPersist, addressText: addressToPersist, placeId: placeIdToPersist ?? null })
        lastProcessedKeyRef.current = key
    }, [distanceResp, effectiveMarker, pendingSelection, _selectedPlaceId, addressInput, updatingData?.originalOrder, defaultCenter, clearUpdatingData, onChange, maxDistance, persistDraftDeliveryCoords, persistDraftDeliveryAddress, persistDraftDeliveryPlaceId, persistDraftDeliveryDistanceDuration, tToast])

    const onMapClick = (event: MapMouseEvent) => {
        const { latLng } = event.detail
        if (latLng) {
            const coords = { lat: latLng.lat, lng: latLng.lng }

            // Clear selected place ID when clicking on map
            setSelectedPlaceId(originalPlaceId)

            // Reverse geocode to get human-readable address first
            const reverseGeocode = (coords: { lat: number; lng: number }): Promise<{ address?: string; placeId?: string | null }> => {
                return new Promise((resolve) => {
                    if (!window.google?.maps?.Geocoder) {
                        resolve({})
                        return
                    }
                    const geocoder = new window.google.maps.Geocoder()
                    geocoder.geocode({ location: coords }, (results, status) => {
                        if (status === 'OK' && results && results.length > 0) {
                            resolve({
                                address: results[0].formatted_address,
                                placeId: results[0].place_id
                            })
                        } else {
                            resolve({})
                        }
                    })
                })
            }

            // Set loading state
            setIsReverseGeocoding(true)

            // Get address from coordinates and update UI smoothly
            reverseGeocode(coords).then(({ address, placeId }) => {
                const addressText = address || t('cart.useCurrentLocation')

                // Update UI first
                setAddressInput(addressText)

                // Set marker and center after getting address to prevent flicker
                setMarker(coords)
                setCenter(coords)
                onLocationChange?.(coords)

                if (addressText) {
                    // Set place ID to trigger hooks (same as suggestion selection)
                    if (placeId) {
                        setSelectedPlaceId(placeId)
                        // Stage pending; persistence gated by distance hook
                        setPendingSelection({ coords, placeId: placeId ?? null, address: addressText })
                    } else {
                        // No place ID available, use coordinates directly
                        // Stage pending; persistence gated by distance hook
                        setPendingSelection({ coords, placeId: null, address: addressText })
                    }
                } else {
                    // Fallback if geocoding fails
                    setPendingSelection({ coords, placeId: null, address: addressInput })
                }
            }).finally(() => {
                setIsReverseGeocoding(false)
            })
        }
    }

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            showErrorToastMessage(tToast('toast.geolocationNotSupported'))
            return
        }
        setIsLocating(true)
        setShowSuggestions(false)

        const reverseGeocode = (coords: { lat: number; lng: number }): Promise<{ address?: string; placeId?: string | null }> => {
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
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                setCenter(coords)
                setMarker(coords)
                onLocationChange?.(coords)
                // Reverse geocode to get human-readable address & placeId
                reverseGeocode(coords).then(({ address, placeId }) => {
                    const addressText = address || t('cart.useCurrentLocation')
                    if (addressText) setAddressInput(addressText)
                    if (placeId) {
                        setSelectedPlaceId(placeId)
                    }
                    // Stage pending; persistence gated by distance hook like suggestion selection
                    setPendingSelection({ coords, placeId: placeId ?? null, address: addressText })
                }).finally(() => {
                    setIsLocating(false)
                })
            },
            (err) => {
                setIsLocating(false)
                if (err.code === 1) {
                    showErrorToastMessage(tToast('toast.locationPermissionDenied'))
                } else if (err.code === 2) {
                    showErrorToastMessage(tToast('toast.locationUnavailable'))
                } else if (err.code === 3) {
                    showErrorToastMessage(tToast('toast.locationTimeout'))
                } else {
                    showErrorToastMessage(tToast('toast.requestFailed'))
                }
            },
            { enableHighAccuracy: true, timeout: 10000 },
        )
    }

    const branchPosition = useMemo<LatLng | null>(() => {
        const lat = branch?.addressDetail?.lat
        const lng = branch?.addressDetail?.lng
        if (typeof lat === 'number' && typeof lng === 'number') return { lat, lng }
        return null
    }, [branch?.addressDetail?.lat, branch?.addressDetail?.lng])

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

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current)
            }
        }
    }, [])

    const handleConfirmAddress = () => {
        if (!slug) return

        // Use current local state values only
        const currentPhone = phoneInput
        const currentPlaceId = _selectedPlaceId || ''

        updateOrderType({
            slug,
            params: {
                type: OrderTypeEnum.DELIVERY,
                table: null,
                timeLeftTakeOut: 0,
                deliveryTo: currentPlaceId,
                deliveryPhone: currentPhone,
            },
        }, {
            onSuccess: () => {
                showToast(tToast('toast.confirmAddressSuccess'))
                // Update initial values to current values after successful confirmation
                // setInitialAddress(currentAddress)
                // setInitialPlaceId(currentPlaceId)
                // setInitialPhoneNumber(currentPhone)
                // Clear updating draft to allow page to re-initialize from refetched order
                clearUpdatingData()
                onSubmit?.()
            },
        })
    }

    return (
        <div className="flex flex-col gap-3 p-2 bg-white rounded-md border dark:bg-transparent" ref={wrapperRef}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
                <div className="flex flex-col col-span-1 gap-3 sm:col-span-2">
                    <div className="flex relative flex-col gap-2">
                        <Input
                            defaultValue={originalAddress}
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
                            aria-autocomplete="list"
                            aria-controls="address-suggestions"
                            aria-expanded={showSuggestions}
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
                                        setTimeout(() => phoneInputRef.current?.focus(), 0) // focus on phone input
                                    }
                                } else if (e.key === 'Escape') {
                                    setShowSuggestions(false)
                                    setActiveSuggestIndex(-1)
                                }
                            }}
                        />
                        {showSuggestions && (
                            <div id="address-suggestions" role="listbox" className="overflow-auto absolute right-0 left-0 top-full z-10 mt-2 max-h-72 bg-white rounded-md border shadow">
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
                                                setActiveSuggestIndex(-1)
                                                setTimeout(() => phoneInputRef.current?.focus(), 0)
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
                                defaultValue={originalPhone}
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder={t('cart.enterPhoneNumber')}
                                className={`w-full text-sm h-10 sm:h-9 ${phoneInput && !PHONE_NUMBER_REGEX.test(phoneInput) ? 'border-destructive' : ''}`}
                                ref={phoneInputRef}
                            // onKeyDown={(e) => {
                            //     if (e.key === 'Enter') {
                            //         const canConfirm = hasAddress && hasValidPhone && !isPending && !shouldDisableButton
                            //         if (canConfirm) {
                            //             e.preventDefault()
                            //             handleConfirmAddress()
                            //         }
                            //     }
                            // }}
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
                                <MapPin className="w-6 h-6 mt-0.5 text-muted-foreground" />
                                <div>
                                    <span className="font-medium">{t('cart.restaurantAddress')}: </span>
                                    <span>{branch?.address || t('cart.noAddressSelected')}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 items-start">
                                <Home className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                <div className="flex-1">
                                    <div className="flex gap-2 items-center mb-1">
                                        <span className="font-medium">{t('cart.deliveryAddress')}: </span>
                                    </div>
                                    <div>
                                        <span className="text-foreground">
                                            {addressInput || t('cart.noAddressSelected')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {effectiveMarker && (
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
                    <Button onClick={handleConfirmAddress} disabled={isPending || !hasAnyChanges || !hasValidPhone || !hasAddress} className="w-full min-w-32">{t('order.confirmAddress')}</Button>
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
                            {isReverseGeocoding && (
                                <div className="absolute top-2 right-2 z-20 px-2 py-1 text-xs rounded border text-muted-foreground bg-white/90">
                                    {t('cart.loading')}...
                                </div>
                            )}
                            {branchPosition && (
                                <Marker
                                    position={branchPosition}
                                    icon={createLucideMarkerIcon(MAP_ICONS.store, '#1a73e8', 30)}
                                />
                            )}
                            <MapPanner panToCoords={center} />
                            {effectiveMarker && (
                                <Marker
                                    position={effectiveMarker}
                                    icon={createLucideMarkerIcon(MAP_ICONS.mapPin, '#d93025', 30)}
                                />
                            )}
                            <RouteOverlay routePath={routePath} routeBounds={routeBounds} marker={effectiveMarker} />
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

        // Validate coordinates before panning
        const { lat, lng } = panToCoords
        if (typeof lat !== 'number' || typeof lng !== 'number' ||
            isNaN(lat) || isNaN(lng) ||
            !isFinite(lat) || !isFinite(lng)) {
            return
        }

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

