// The map component is named MapViewNative to avoid shadowing the global Map
import {
	Camera,
	type CameraRef,
	GeoJSONSource,
	Layer,
	Map as MapViewNative,
	Marker,
	UserLocation,
} from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type NativeSyntheticEvent, View } from "react-native";

import type { ScholarPosition } from "@/lib/map-utils";
import { useAppColorScheme } from "@/lib/use-app-color-scheme";

import { FromMarker, ToMarker } from "@/assets/route";

import type { Place, Stage } from "../request-flow-sheet/types";

// ─── Styles ───────────────────────────────────────────────────────────────────

const LIGHT_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const DARK_STYLE = "https://tiles.openfreemap.org/styles/dark";

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
}

// ─── Default initial view (UFAL campus) ──────────────────────────────────────

const DEFAULT_CENTER: [number, number] = [-35.745, -9.555];
const DEFAULT_ZOOM = 14.5;

// ─── Hook for user location (native) ─────────────────────────────────────────

function useNativeUserLocation() {
	const [location, setLocation] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let subscription: Location.LocationSubscription | null = null;

		const startWatching = async () => {
			const { status } =
				await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				setError("Permissão de localização negada");
				return;
			}

			subscription = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.High,
					timeInterval: 3000,
					distanceInterval: 5,
				},
				(newLocation) => {
					setLocation({
						latitude: newLocation.coords.latitude,
						longitude: newLocation.coords.longitude,
					});
				},
			);
		};

		startWatching();

		return () => {
			if (subscription) {
				subscription.remove();
			}
		};
	}, []);

	return { location, error };
}

// ─── Event type for region changes ───────────────────────────────────────────

interface ViewStateChangeEvent {
	center: [number, number];
	zoom: number;
	bearing: number;
	pitch: number;
	animated: boolean;
	userInteraction: boolean;
}

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
}: MapViewProps) {
	const scheme = useAppColorScheme();
	const { location: userLocation } = useNativeUserLocation();
	const cameraRef = useRef<CameraRef>(null);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [isMoving, setIsMoving] = useState(false);

	const enableUserTracking = showUserLocation && interactive && !routePath;

	const isDark = scheme === "dark";

	// ─── Build route line GeoJSON ───────────────────────────────────────────

	const routeGeoJSON = useMemo(() => {
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

		if (
			(stage === "start-confirm" || stage === "trip") &&
			origin &&
			destination
		) {
			return {
				type: "Feature" as const,
				properties: {},
				geometry: {
					type: "LineString" as const,
					coordinates: [
						[origin.longitude, origin.latitude] as [number, number],
						[destination.longitude, destination.latitude] as [
							number,
							number,
						],
					],
				},
			};
		}

		// For trip stage with destination but no origin, use user location
		if (stage === "trip" && destination && userLocation) {
			return {
				type: "Feature" as const,
				properties: {},
				geometry: {
					type: "LineString" as const,
					coordinates: [
						[userLocation.longitude, userLocation.latitude] as [
							number,
							number,
						],
						[destination.longitude, destination.latitude] as [
							number,
							number,
						],
					],
				},
			};
		}

		return null;
	}, [routePath, stage, origin, destination, userLocation]);

	// ─── All scholar positions ──────────────────────────────────────────────

	const allScholarPositions = useMemo(() => {
		const positions = [...scholarPositions];
		if (scholar && !positions.find((s) => s.id === scholar.id)) {
			positions.push(scholar);
		}
		return positions;
	}, [scholarPositions, scholar]);

	// ─── Camera: follow user on first location (only when tracking enabled) ──

	useEffect(() => {
		if (
			enableUserTracking &&
			mapLoaded &&
			userLocation &&
			stage !== "trip"
		) {
			cameraRef.current?.flyTo({
				center: [userLocation.longitude, userLocation.latitude],
				zoom: 16,
				duration: 1000,
			});
		}
	}, [enableUserTracking, mapLoaded, userLocation, stage]);

	// ─── Camera: follow scholar in trip mode ────────────────────────────────

	useEffect(() => {
		if (mapLoaded && stage === "trip" && scholar && !isMoving) {
			cameraRef.current?.flyTo({
				center: [scholar.longitude, scholar.latitude],
				zoom: 16,
				duration: 1500,
			});
		}
	}, [mapLoaded, scholar, stage, isMoving]);

	// ─── Center crosshair: report on region change ──────────────────────────

	const handleRegionDidChange = useCallback(
		(event: NativeSyntheticEvent<ViewStateChangeEvent>) => {
			setIsMoving(false);
			const { center } = event.nativeEvent;
			if (onCenterChanged && center) {
				const [lng, lat] = center;
				onCenterChanged(lat, lng);
			}
		},
		[onCenterChanged],
	);

	const handleRegionWillChange = useCallback(() => {
		setIsMoving(true);
	}, []);

	const showRoute =
		stage === "start-confirm" || stage === "trip" || !!routePath;
	const showOriginMarker = stage === "start-confirm" || stage === "trip";
	const showDestinationMarker = stage === "trip";

	const primaryColor = "#005E65";

	// Camera initial view state
	const cameraInitialState = {
		center: [
			initialViewState?.longitude ?? DEFAULT_CENTER[0],
			initialViewState?.latitude ?? DEFAULT_CENTER[1],
		] as [number, number],
		zoom: initialViewState?.zoom ?? DEFAULT_ZOOM,
	};

	return (
		<View className="flex-1 relative overflow-hidden">
			<MapViewNative
				style={{ flex: 1 }}
				mapStyle={isDark ? DARK_STYLE : LIGHT_STYLE}
				logo={false}
				attribution={false}
				onDidFinishLoadingMap={() => setMapLoaded(true)}
				onRegionDidChange={
					onCenterChanged ? handleRegionDidChange : undefined
				}
				onRegionWillChange={
					onCenterChanged ? handleRegionWillChange : undefined
				}
				dragPan={interactive}
				touchZoom={interactive}
				touchRotate={interactive}
			>
				{/* ── Camera ──────────────────────────────────────────────── */}
				<Camera ref={cameraRef} initialViewState={cameraInitialState} />

				{/* ── User location puck ────────────────────────────────── */}
				{showUserLocation && (
					<UserLocation animated accuracy={false} heading />
				)}

				{/* ── Route line ─────────────────────────────────────────── */}
				{showRoute && routeGeoJSON && (
					<GeoJSONSource id="route-source" data={routeGeoJSON}>
						<Layer
							id="route-line"
							type="line"
							paint={{
								"line-color": primaryColor,
								"line-width": routeDashed ? 3 : 4,
								"line-opacity": 0.9,
								...(routeDashed
									? { "line-dasharray": [2, 4] }
									: {}),
							}}
						/>
					</GeoJSONSource>
				)}

				{/* ── Origin marker ─────────────────────────────────────── */}
				{showOriginMarker && origin && (
					<Marker
						id="origin-marker"
						lngLat={[origin.longitude, origin.latitude]}
						anchor="bottom"
					>
						<View className="items-center justify-center">
							<FromMarker
								width={28}
								height={34}
								fill={primaryColor}
							/>
						</View>
					</Marker>
				)}

				{/* ── Destination marker ────────────────────────────────── */}
				{showDestinationMarker && destination && (
					<Marker
						id="dest-marker"
						lngLat={[destination.longitude, destination.latitude]}
						anchor="bottom"
					>
						<View className="items-center justify-center">
							<ToMarker
								width={28}
								height={34}
								fill={primaryColor}
							/>
						</View>
					</Marker>
				)}

				{/* ── Scholar positions ─────────────────────────────────── */}
				{allScholarPositions.map((sp) => (
					<Marker
						key={sp.id}
						id={`scholar-${sp.id}`}
						lngLat={[sp.longitude, sp.latitude]}
						anchor="center"
					>
						<View
							className="size-5 rounded-full bg-primary border-2 border-white"
							style={
								sp.heading !== undefined
									? {
											transform: [
												{
													rotate: `${sp.heading}deg`,
												},
											],
										}
									: undefined
							}
						/>
					</Marker>
				))}
			</MapViewNative>

			{/* ── Center crosshair (destination mode) ────────────────────── */}
			{showCenterMarker && (
				<View
					className="absolute inset-0 items-center justify-center"
					pointerEvents="none"
				>
					<View className="size-8 items-center justify-center">
						{/* Outer ring */}
						<View className="absolute size-8 rounded-full border-2 border-primary opacity-50" />
						{/* Center dot */}
						<View className="size-3 rounded-full bg-primary" />
						{/* Crosshair lines */}
						<View className="absolute h-6 w-0.5 bg-primary/60" />
						<View className="absolute w-6 h-0.5 bg-primary/60" />
					</View>
				</View>
			)}
		</View>
	);
}
