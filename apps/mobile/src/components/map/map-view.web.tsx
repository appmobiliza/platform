import MapGL, {
	GeolocateControl,
	type GeolocateControlInstance,
	type StyleSpecification,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { useRef } from "react";

import { type ColorSchemeName, useColorScheme } from "react-native";

import dark from "@/assets/map-styles/dark.json";
import { useMapLogic } from "@/hooks/use-map-logic";

const STYLES = {
	light: "https://tiles.openfreemap.org/styles/liberty",
	dark: dark, // "https://tiles.openfreemap.org/styles/dark", // ou "positron" para cinza suave
	unspecified: "",
} as Record<ColorSchemeName, string | StyleSpecification>;

interface Props {
	scholar: {
		latitude: number;
		longitude: number;
	};
}

export default function MapView({ scholar }: Props) {
	const scheme = useColorScheme(); // 'light' | 'dark' | null
	const { currentPosition, route, distance } = useMapLogic({
		destinationCoords: [scholar.longitude, scholar.latitude],
	});
	const geolocateRef = useRef<GeolocateControlInstance | null>(null);

	return (
		<MapGL
			mapStyle={STYLES[scheme ?? "light"]}
			initialViewState={{ longitude: -35.7, latitude: -9.6, zoom: 14 }}
			style={{
				width: "100%",
				height: "100%",
				position: "absolute",
				inset: 0,
				zIndex: 0,
			}}
			onLoad={() => geolocateRef.current?.trigger()}
		>
			<GeolocateControl
				ref={geolocateRef}
				// style={{ display: "none" }}
				positionOptions={{ enableHighAccuracy: true }}
				trackUserLocation={true} // mantém rastreamento contínuo
				showUserLocation={true} // exibe o ícone de localização
				showAccuracyCircle={true} // exibe o círculo de precisão
			/>

			{/* {route && (
				<Source id="route" type="geojson" data={route}>
					<Layer
						id="line-route"
						type="line"
						paint={{ "line-color": "#0066CC", "line-width": 4 }}
						layout={{ "line-cap": "round", "line-join": "round" }}
					/>
				</Source>
			)} */}

			{/* {currentPosition && (
				<Marker longitude={currentPosition[0]} latitude={currentPosition[1]}>
					<DistanceMarker distancia={distance} />
				</Marker>
			)} */}
		</MapGL>
	);
}
