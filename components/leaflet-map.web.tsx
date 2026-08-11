import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { buildTrackingMapHtml, type TrackingMapOptions } from './leaflet-map-html';

type LeafletMapProps = TrackingMapOptions & {
  style?: StyleProp<ViewStyle>;
};

/**
 * Web — renders Leaflet + OpenStreetMap tracking map inside an isolated iframe.
 */
export function LeafletMap({ style, ...options }: LeafletMapProps) {
  const htmlContent = buildTrackingMapHtml(options);

  return (
    <View style={[{ flex: 1, overflow: 'hidden' }, style]}>
      {React.createElement('iframe', {
        title: 'Worker tracking map',
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
