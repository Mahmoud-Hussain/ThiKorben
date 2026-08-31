/**
 * Builds a self-contained Leaflet + OpenStreetMap HTML page with route & worker/customer tracking markers.
 * Used by both the native WebView and the web iframe renderers.
 */
export interface TrackingMapOptions {
  workerLat?: number;
  workerLng?: number;
  customerLat?: number;
  customerLng?: number;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  label?: string;
  className?: string;
}

export function buildTrackingMapHtml(options: TrackingMapOptions = {}): string {
  const {
    workerLat,
    workerLng,
    customerLat,
    customerLng,
    latitude = customerLat ?? 23.7639,
    longitude = customerLng ?? 90.3589,
    zoom = 15,
    label = 'Location',
  } = options;

  const isTracking = workerLat !== undefined && workerLng !== undefined;
  const cLat = customerLat ?? latitude;
  const cLng = customerLng ?? longitude;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .marker-pin {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: 2px solid white;
    }
    .worker-pin { background-color: #fd9923; }
    .customer-pin { background-color: #2e3192; }
    .material-symbols-outlined { font-size: 20px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: false });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    var customerPos = [${cLat}, ${cLng}];
    var customerIcon = L.divIcon({
      html: '<div class="marker-pin customer-pin"><span class="material-symbols-outlined">home</span></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      className: ''
    });

    var cMarker = L.marker(customerPos, { icon: customerIcon }).addTo(map);
    ${label ? `cMarker.bindPopup("<b>${label}</b>").openPopup();` : ''}

    ${
      isTracking
        ? `
    var workerPos = [${workerLat}, ${workerLng}];
    var workerIcon = L.divIcon({
      html: '<div class="marker-pin worker-pin"><span class="material-symbols-outlined">handyman</span></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      className: ''
    });

    L.marker(workerPos, { icon: workerIcon }).addTo(map);

    // Route polyline
    var route = L.polyline([
      workerPos,
      [${(workerLat! + cLat) / 2 + 0.002}, ${(workerLng! + cLng) / 2 - 0.001}],
      customerPos
    ], {
      color: '#15157d',
      weight: 5,
      opacity: 0.85,
      dashArray: '8, 8'
    }).addTo(map);

    var bounds = L.latLngBounds([workerPos, customerPos]);
    map.fitBounds(bounds, { padding: [50, 50] });
    `
        : `
    map.setView(customerPos, ${zoom});
    `
    }
  </script>
</body>
</html>`;
}
