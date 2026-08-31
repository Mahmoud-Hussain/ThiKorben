import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

import { buildTrackingMapHtml, type TrackingMapOptions } from './leaflet-map-html';

export type LeafletMapProps = TrackingMapOptions & {
  style?: StyleProp<ViewStyle>;
  className?: string;
};

/**
 * Native (Android/iOS) — renders Leaflet + OpenStreetMap tracking map inside a WebView.
 */
export function LeafletMap({ style, className, ...options }: LeafletMapProps) {
  return (
    <View style={[{ flex: 1 }, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: buildTrackingMapHtml(options) }}
        style={{ flex: 1, backgroundColor: '#e9ede4' }}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

export default LeafletMap;
