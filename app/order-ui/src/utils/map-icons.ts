/**
 * Generate Google Maps icon from Lucide SVG path
 */
export function createLucideMarkerIcon(
  svgPath: string,
  color: string = 'red',
  size: number = 32,
): google.maps.Icon | undefined {
  // Check if Google Maps API is loaded
  if (
    !window.google?.maps ||
    !window.google.maps.Size ||
    !window.google.maps.Point
  ) {
    return undefined
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${svgPath}
    </svg>
  `

  try {
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new window.google.maps.Size(size, size),
      anchor: new window.google.maps.Point(size / 2, size),
    }
  } catch {
    // Silently fail if Google Maps API is not ready
    return undefined
  }
}

// Predefined Lucide icons for map markers
export const MAP_ICONS = {
  mapPin: `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
  home: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>`,
  store: `<path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/><polyline points="3,7 12,13 21,7"/>`,
  navigation: `<polygon points="3,11 22,2 13,21 11,13 3,11"/>`,
  target: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,
}
