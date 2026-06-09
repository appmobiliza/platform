import MapGL, {
	GeolocateControl,
	type GeolocateControlInstance,
	Layer,
	type MapRef,
	Marker,
	NavigationControl,
	Source,
	type StyleSpecification,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/text";

import { useMapLogic } from "@/hooks/use-map-logic";
import type { ScholarPosition } from "@/lib/map-utils";
import { useAppColorScheme } from "@/lib/use-app-color-scheme";

import _dark from "@/assets/map-styles/dark.json";

const dark = _dark as StyleSpecification;

import { FromMarker, ToMarker } from "@/assets/route";

import type { Place, Stage } from "../request-flow-sheet/types";

// ─── Styles ───────────────────────────────────────────────────────────────────

const STYLES: Record<string, string | StyleSpecification> = {
	light: "https://tiles.openfreemap.org/styles/liberty",
	dark: dark,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface MapViewProps {
	/** Current stage in the request flow (determines rendering mode) */
	stage?: Stage;

	/** Origin point (shown in route / start-confirm modes) */
	origin?: Place | null;

	/** Destination point (shown in route / trip modes) */
	destination?: Place | null;

	/** Scholar real-time geographic position (for trip stage) */
	scholar?: ScholarPosition | null;

	/** All online scholar positions (for searching stage) */
	scholarPositions?: ScholarPosition[];

	/** Called when map center changes (destination selection mode) */
	onCenterChanged?: (latitude: number, longitude: number) => void;

	/** Initial viewport */
	initialViewState?: {
		longitude: number;
		latitude: number;
		zoom?: number;
	};

	/** Whether the map is interactive (pan/zoom enabled) */
	interactive?: boolean;

	/** Whether to show a crosshair at the center (destination mode) */
	showCenterMarker?: boolean;

	/** Path to use for the route polyline (array of [lng, lat]) */
	routePath?: Array<[number, number]>;

	/** Whether to show the route as dashed */
	routeDashed?: boolean;

	/** Whether to show the user's location on the map */
	showUserLocation?: boolean;

	/** Distance string to display above the scholar marker (e.g. "6 min") */
	scholarDistance?: string | null;
}

// ─── Default initial view (UFAL campus) ──────────────────────────────────────

const DEFAULT_VIEW = {
	longitude: -35.745,
	latitude: -9.555,
	zoom: 14.5,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapView({
	stage,
	origin,
	destination,
	scholar,
	scholarPositions = [],
	onCenterChanged,
	initialViewState,
	interactive = true,
	showCenterMarker = false,
	routePath,
	routeDashed = false,
	showUserLocation = true,
	scholarDistance,
}: MapViewProps) {
	const scheme = useAppColorScheme();
	const mapRef = useRef<MapRef>(null);
	const geolocateRef = useRef<GeolocateControlInstance | null>(null);
	const [mapLoaded, setMapLoaded] = useState(false);

	const enableUserTracking = showUserLocation && interactive && !routePath;

	// ─── Map logic for route/distance calculations ──────────────────────────

	const isRouteMode =
		stage === "start-confirm" || stage === "trip" || !!routePath;

	const { routeGeoJSON, distanceText, etaText } = useMapLogic({
		mode: isRouteMode
			? "route"
			: stage === "destination"
				? "destination"
				: "free",
		origin,
		destination: destination ?? (scholar ? { name: "", ...scholar } : null),
		trackUser: true,
	});

	// ─── Trigger geolocation on load (only when tracking enabled) ───────────

	useEffect(() => {
		if (enableUserTracking && mapLoaded && geolocateRef.current) {
			geolocateRef.current.trigger();
		}
	}, [enableUserTracking, mapLoaded]);

	// ─── Center crosshair: report center changes ────────────────────────────

	const [isMoving, setIsMoving] = useState(false);

	const handleMapMoveEnd = useCallback(() => {
		setIsMoving(false);
		const map = mapRef.current;
		if (!map || !onCenterChanged) return;
		const center = map.getCenter();
		onCenterChanged(center.lat, center.lng);
	}, [onCenterChanged]);

	const handleMapMoveStart = useCallback(() => {
		setIsMoving(true);
	}, []);

	// ─── Build scholar position markers ─────────────────────────────────────

	const allScholarPositions = useMemo(() => {
		const positions = [...scholarPositions];
		if (scholar && !positions.find((s) => s.id === scholar.id)) {
			positions.push(scholar);
		}
		return positions;
	}, [scholarPositions, scholar]);

	// ─── Camera follow scholar in trip mode ─────────────────────────────────

	useEffect(() => {
		if (stage === "trip" && scholar && mapRef.current && !isMoving) {
			mapRef.current.easeTo({
				center: [scholar.longitude, scholar.latitude],
				zoom: 16,
				duration: 1500,
			});
		}
	}, [scholar, stage, isMoving]);

	// ─── Route line style ───────────────────────────────────────────────────

	const routeStyle = useMemo(() => {
		if (routeDashed) {
			return {
				"line-color": "#0066CC",
				"line-width": 3,
				"line-dasharray": [2, 4] as [number, number],
				"line-opacity": 0.8,
			};
		}
		return {
			"line-color": "#0066CC",
			"line-width": 4,
			"line-opacity": 0.9,
		};
	}, [routeDashed]);

	// ─── Final route (from routePath or calculated) ─────────────────────────

	const finalRouteGeoJSON = useMemo(() => {
		if (routePath && routePath.length >= 2) {
			return {
				type: "Feature" as const,
				properties: {},
				geometry: {
					type: "LineString" as const,
					coordinates: routePath,
				},
			};
		}
		return routeGeoJSON;
	}, [routePath, routeGeoJSON]);

	return (
		<View className="flex-1 relative overflow-hidden">
			<MapGL
				ref={mapRef}
				mapStyle={STYLES[scheme ?? "light"]}
				initialViewState={initialViewState ?? DEFAULT_VIEW}
				style={{
					width: "100%",
					height: "100%",
					position: "absolute",
					inset: 0,
				}}
				onLoad={() => setMapLoaded(true)}
				onMoveStart={handleMapMoveStart}
				onMoveEnd={handleMapMoveEnd}
				dragPan={interactive}
				scrollZoom={interactive}
				doubleClickZoom={interactive}
				touchZoomRotate={interactive}
				keyboard={interactive}
			>
				{/* ── Geolocation ─────────────────────────────────────────── */}
				<GeolocateControl
					ref={geolocateRef}
					positionOptions={{ enableHighAccuracy: true }}
					showUserLocation={enableUserTracking}
					showAccuracyCircle={false}
					trackUserLocation={false}
					style={{ display: "none" }}
					onGeolocate={(event) => {
						if (enableUserTracking) {
							mapRef.current?.easeTo({
								center: [
									event.coords.longitude,
									event.coords.latitude,
								],
								zoom: 16,
								duration: 1000,
								padding:
									stage === "start-confirm"
										? {
												top: 0,
												right: 0,
												left: 0,
												bottom: 300,
											}
										: {
												top: 0,
												right: 0,
												left: 0,
												bottom: 0,
											},
							});
						}
					}}
				/>

				{/* ── Navigation controls ─────────────────────────────────── */}
				{interactive && <NavigationControl position="bottom-right" />}

				{/* ── Route line ──────────────────────────────────────────── */}
				{finalRouteGeoJSON &&
					(stage === "start-confirm" ||
						stage === "trip" ||
						routePath) && (
						<Source
							id="route"
							type="geojson"
							data={finalRouteGeoJSON}
						>
							<Layer
								id="line-route"
								type="line"
								paint={routeStyle}
								layout={{
									"line-cap": "round",
									"line-join": "round",
								}}
							/>
						</Source>
					)}

				{/* ── Origin marker (start-confirm / route) ──────────────── */}
				{(stage === "start-confirm" || stage === "trip") && origin && (
					<Marker
						longitude={origin.longitude}
						latitude={origin.latitude}
						anchor="bottom"
					>
						<FromMarker
							width={28}
							height={34}
							fill="var(--primary)"
						/>
					</Marker>
				)}

				{/* ── Destination marker (trip / route) ──────────────────── */}
				{stage === "trip" && destination && (
					<Marker
						longitude={destination.longitude}
						latitude={destination.latitude}
						anchor="bottom"
					>
						<ToMarker
							width={28}
							height={34}
							fill="var(--primary)"
						/>
					</Marker>
				)}

				{/* ── Scholar positions (searching / trip) ───────────────── */}
				{allScholarPositions.map((sp) => {
					const isPrimaryScholar =
						scholar?.id === sp.id && scholarDistance;

					return (
						<Marker
							key={sp.id}
							longitude={sp.longitude}
							latitude={sp.latitude}
							anchor="bottom"
						>
							<View className="items-center">
								{isPrimaryScholar ? (
									<View className="bg-primary rounded-md px-2 py-0.5 mb-1">
										<Text className="text-primary-foreground text-xs font-semibold">
											{scholarDistance}
										</Text>
									</View>
								) : null}
								<ScholarDot heading={sp.heading} />
							</View>
						</Marker>
					);
				})}
			</MapGL>

			{/* ── Center crosshair (destination mode) ────────────────────── */}
			{showCenterMarker && (
				<View className="absolute inset-0 pointer-events-none items-center justify-center">
					<View className="size-8 items-center justify-center">
						{/* Outer ring */}
						<View className="absolute size-8 rounded-full border-2 border-primary opacity-50" />
						{/* Center dot */}
						<View className="size-3 rounded-full bg-primary" />
						{/* Crosshair lines */}
						<View className="absolute h-6 w-0.5 rounded-full bg-primary/60" />
						<View className="absolute w-6 h-0.5 rounded-full bg-primary/60" />
					</View>
				</View>
			)}

			{/* ── ETA / Distance overlay (trip mode) ─────────────────────── */}
			{stage === "trip" && etaText !== "--" && (
				<View className="absolute top-4 left-4 bg-card/90 rounded-lg px-3 py-2 shadow-sm border border-border">
					<Text className="text-xs text-muted-foreground">
						Distância
					</Text>
					<Text className="text-sm font-bold text-foreground">
						{distanceText}
					</Text>
					<Text className="text-xs text-muted-foreground mt-1">
						ETA
					</Text>
					<Text className="text-sm font-bold text-foreground">
						{etaText}
					</Text>
				</View>
			)}
		</View>
	);
}

// ─── ScholarDot ──────────────────────────────────────────────────────────────

function ScholarDot({ heading }: { heading?: number }) {
	return (
		<View
			className="size-5 rounded-full bg-primary border-2 border-white shadow-sm"
			style={
				heading !== undefined
					? { transform: `rotate(${heading}deg)` }
					: undefined
			}
		/>
	);
}
