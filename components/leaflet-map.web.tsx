import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { buildLeafletHtml, type LeafletMapOptions } from './leaflet-map-html';

type LeafletMapProps = LeafletMapOptions & {
  style?: StyleProp<ViewStyle>;
};

/**
 * Web Leaflet + OpenStreetMap preview rendered inside an isolated iframe.
 * Uses React.createElement to cleanly render standard iframe on React Native Web.
 */
export function LeafletMap({ style, ...options }: LeafletMapProps) {
  const htmlContent = buildLeafletHtml(options);

  return (
    <View style={[{ flex: 1, overflow: 'hidden' }, style]}>
      {React.createElement('iframe', {
        title: 'Customer location map',
        srcDoc: htmlContent,
        style: {
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          backgroundColor: '#e9ede4',
        },
      })}
    </View>
  );
}

export default LeafletMap;