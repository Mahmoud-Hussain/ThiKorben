/**
 * Builds a self-contained Leaflet + OpenStreetMap HTML document.
 * Shared by the native (WebView) and web (iframe) map implementations.
 */
export type LeafletMapOptions = {
  latitude: number;
  longitude: number;
  zoom?: number;
  label?: string;
};

export function buildLeafletHtml({
  latitude,
  longitude,
  zoom = 16,
  label = 'Customer location',
}: LeafletMapOptions): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html,
      body,
      #map {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        background: #e9ede4;
      }
      .leaflet-control-attribution {
        font-size: 8px;
        background: rgba(255, 255, 255, 0.65);
      }
      .pin {
        width: 12px;
        height: 12px;
        border-radius: 999px;
        background: #ef4444;
        border: 3px solid #ffffff;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      (function () {
        var map = L.map('map', {
          zoomControl: false,
          scrollWheelZoom: false,
          attributionControl: true,
        }).setView([${latitude}, ${longitude}], ${zoom});

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);

        var pinIcon = L.divIcon({
          className: '',
          html: '<div class="pin"></div>',
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        L.marker([${latitude}, ${longitude}], { icon: pinIcon })
          .addTo(map)
          .bindTooltip(${JSON.stringify(label)}, { direction: 'top' });
      })();
    </script>
  </body>
</html>`;
}