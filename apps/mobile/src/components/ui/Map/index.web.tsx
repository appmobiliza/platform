import { View, Text } from "react-native";

export const Marker = ({ coordinate }: any) => {
  return null;
};

const MapView = ({ style, children, ...props }: any) => {
  return (
    <View style={[style, { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#d1d5db' }]}>
      <Text style={{ color: '#6b7280', fontWeight: '500' }}>Mapa não disponível na Web</Text>
      <View style={{ display: 'none' }}>{children}</View>
    </View>
  );
};

export default MapView;
