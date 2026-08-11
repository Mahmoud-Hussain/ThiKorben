import { StyleProp, View, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

import { buildLeafletHtml, type LeafletMapOptions } from './leaflet-map-html';

type LeafletMapProps = LeafletMapOptions & {
  style?: StyleProp<ViewStyle>;
};

/**
 * Native (Android/iOS) Leaflet + OpenStreetMap preview rendered inside a WebView.
 */
export function LeafletMap({ style, ...options }: LeafletMapProps) {
  return (
    <View style={[{ flex: 1 }, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: buildLeafletHtml(options) }}
        style={{ flex: 1, backgroundColor: '#e9ede4' }}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

export default LeafletMap;