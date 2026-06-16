"use client";

import MapGL, {
	type MapLayerMouseEvent,
	type MapRef,
	Marker,
	NavigationControl,
	Popup,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import type { CampusLocation } from "@mobiliza/db/schema";

import { MapPin } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

// ─── Map style ─────────────────────────────────────────────────────────────────

const LIGHT_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const DARK_STYLE = "https://tiles.openfreemap.org/styles/dark";

// ─── Default initial view (UFAL campus) ─────────────────────────────────────────

const DEFAULT_VIEW = {
	latitude: -9.555,
	longitude: -35.745,
	zoom: 14.5,
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CampusMapProps {
	/** Locations to display as markers on the map */
	locations: CampusLocation[];

	/** Enable click-to-select coordinate mode */
	selectionMode?: boolean;

	/** Currently selected coordinates (used in selection mode) */
	selectedLatitude?: number | null;
	selectedLongitude?: number | null;

	/** Called when user clicks the map in selection mode */
	onSelectLocation?: (lat: number, lng: number) => void;

	/** Show navigation controls (zoom, compass) */
	showNavigation?: boolean;

	/** Additional CSS classes */
	className?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function CampusMap({
	locations,
	selectionMode = false,
	selectedLatitude,
	selectedLongitude,
	onSelectLocation,
	showNavigation = true,
	className,
}: CampusMapProps) {
	const { resolvedTheme } = useTheme();
	const mapRef = useRef<MapRef>(null);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [popupLocation, setPopupLocation] = useState<CampusLocation | null>(
		null,
	);
	const [cursor, setCursor] = useState<string>("grab");

	const mapStyle = resolvedTheme === "dark" ? DARK_STYLE : LIGHT_STYLE;

	// ─── Fit map to show all locations after map loads ───────────────────

	useEffect(() => {
		if (!mapRef.current || !mapLoaded || locations.length === 0) return;

		const lngs = locations.map((l) => l.longitude);
		const lats = locations.map((l) => l.latitude);

		mapRef.current.fitBounds(
			[
				[Math.min(...lngs) - 0.001, Math.min(...lats) - 0.001],
				[Math.max(...lngs) + 0.001, Math.max(...lats) + 0.001],
			] as [[number, number], [number, number]],
			{ padding: 60, maxZoom: 16, duration: 1000 },
		);
	}, [locations, mapLoaded]);

	// ─── Map click handler (selection mode or dismiss popup) ────────────

	const handleMapClick = useCallback(
		(event: MapLayerMouseEvent) => {
			if (selectionMode) {
				onSelectLocation?.(event.lngLat.lat, event.lngLat.lng);
			} else {
				// Close the popup when clicking on empty map area.
				// Marker clicks call stopPropagation so they won't reach here.
				setPopupLocation(null);
			}
		},
		[selectionMode, onSelectLocation],
	);

	const handleMouseEnter = useCallback(() => {
		if (selectionMode) setCursor("crosshair");
	}, [selectionMode]);

	const handleMouseLeave = useCallback(() => {
		setCursor("grab");
	}, []);

	// ─── Marker click handler ───────────────────────────────────────────

	const handleMarkerClick = useCallback(
		(location: CampusLocation) =>
			(e: { originalEvent: { stopPropagation: () => void } }) => {
				e.originalEvent.stopPropagation();
				setPopupLocation(
					popupLocation?.id === location.id ? null : location,
				);
			},
		[popupLocation?.id],
	);

	// ─── Render ─────────────────────────────────────────────────────────

	return (
		<div
			className={cn(
				"relative h-full w-full overflow-hidden rounded-xl",
				className,
			)}
			data-map-wrapper
		>
			{/* Override maplibre popup styles to match the theme */}
			<style>{`
				[data-map-wrapper] .maplibregl-popup-content {
					background: var(--card) !important;
					color: var(--card-foreground) !important;
					border-radius: 0.5rem !important;
					padding: 8px 12px !important;
					box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) !important;
					font-family: inherit !important;
					font-size: 0.875rem !important;
				}
				[data-map-wrapper] .maplibregl-popup-tip {
					border-top-color: var(--card) !important;
					border-bottom-color: var(--card) !important;
				}
				[data-map-wrapper] .maplibregl-popup-close-button {
					color: var(--muted-foreground) !important;
					font-size: 1rem !important;
					padding: 2px 6px !important;
					border-radius: 0.25rem !important;
				}
				[data-map-wrapper] .maplibregl-popup-close-button:hover {
					background: var(--accent) !important;
					color: var(--accent-foreground) !important;
				}
			`}</style>
			<MapGL
				ref={mapRef}
				mapStyle={mapStyle}
				initialViewState={DEFAULT_VIEW}
				style={{ width: "100%", height: "100%" }}
				attributionControl={false}
				onLoad={() => setMapLoaded(true)}
				onClick={handleMapClick}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				cursor={cursor}
				doubleClickZoom={!selectionMode}
				dragPan
				scrollZoom
			>
				{/* ── Navigation controls ──────────────────────────────── */}
				{showNavigation && (
					<NavigationControl position="bottom-right" />
				)}

				{/* ── Location markers ─────────────────────────────────── */}
				{locations.map((location) => (
					<Marker
						key={location.id}
						longitude={location.longitude}
						latitude={location.latitude}
						anchor="center"
						onClick={handleMarkerClick(location)}
					>
						<div
							className={cn(
								"flex size-10 cursor-pointer items-center justify-center rounded-full border-2 border-background text-xs font-bold text-primary-foreground shadow-md transition-transform hover:scale-110",
								popupLocation?.id === location.id
									? "bg-primary ring-2 ring-ring"
									: "bg-primary",
							)}
						>
							{location.abbreviation?.slice(0, 5) ?? "📍"}
						</div>
					</Marker>
				))}

				{/* ── Selection pin marker ─────────────────────────────── */}
				{selectionMode &&
					selectedLatitude != null &&
					selectedLongitude != null && (
						<Marker
							longitude={selectedLongitude}
							latitude={selectedLatitude}
							anchor="bottom"
						>
							<div className="flex flex-col items-center drop-shadow-lg">
								<MapPin className="size-7 -mb-1.5 text-destructive" />
							</div>
						</Marker>
					)}

				{/* ── Info popup ───────────────────────────────────────── */}
				{popupLocation && (
					<Popup
						longitude={popupLocation.longitude}
						latitude={popupLocation.latitude}
						anchor="bottom"
						onClose={() => setPopupLocation(null)}
						closeButton
						closeOnClick={false}
						offset={10}
					>
						<div className="p-1">
							<h3 className="text-sm text-foreground font-semibold">
								{popupLocation.name}
							</h3>
							{popupLocation.abbreviation && (
								<p className="text-xs text-muted-foreground">
									{popupLocation.abbreviation}
								</p>
							)}
							{popupLocation.description && (
								<p className="mt-1 max-w-60 text-xs text-muted-foreground">
									{popupLocation.description}
								</p>
							)}
							<p className="mt-1 text-xs text-muted-foreground">
								{popupLocation.latitude.toFixed(5)},{" "}
								{popupLocation.longitude.toFixed(5)}
							</p>
							{!popupLocation.isActive && (
								<p className="mt-1 text-xs font-medium text-destructive">
									Inativo
								</p>
							)}
						</div>
					</Popup>
				)}
			</MapGL>

			{/* ── Selection mode hint ──────────────────────────────────── */}
			{selectionMode && (
				<div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
					<div className="flex flex-col items-center">
						<MapPin className="size-6 text-destructive drop-shadow-lg" />
					</div>
				</div>
			)}
		</div>
	);
}
