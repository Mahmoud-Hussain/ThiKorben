/**
 * Builds a self-contained Leaflet + OpenStreetMap HTML page with route & worker/customer tracking markers.
 * Used by both the native WebView and the web iframe renderers.
 */
export interface TrackingMapOptions {
  workerLat?: number;
  workerLng?: number;
  customerLat?: number;
  customerLng?: number;
  zoom?: number;
}

export function buildTrackingMapHtml({
  workerLat = 23.7700,
  workerLng = 90.3600,
  customerLat = 23.7639,
  customerLng = 90.3589,
  zoom = 15,
}: TrackingMapOptions = {}): string {
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
    html, body, #map { width: 100%; height: 100%; }
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
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    var workerPos = [${workerLat}, ${workerLng}];
    var customerPos = [${customerLat}, ${customerLng}];

    var workerIcon = L.divIcon({
      html: '<div class="marker-pin worker-pin"><span class="material-symbols-outlined">handyman</span></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      className: ''
    });

    var customerIcon = L.divIcon({
      html: '<div class="marker-pin customer-pin"><span class="material-symbols-outlined">home</span></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      className: ''
    });

    L.marker(workerPos, { icon: workerIcon }).addTo(map);
    L.marker(customerPos, { icon: customerIcon }).addTo(map);

    // Route polyline between worker and customer
    var route = L.polyline([
      workerPos,
      [${(workerLat + customerLat) / 2 + 0.002}, ${(workerLng + customerLng) / 2 - 0.001}],
      customerPos
    ], {
      color: '#15157d',
      weight: 5,
      opacity: 0.8,
      dashArray: '8, 8'
    }).addTo(map);

    var bounds = L.latLngBounds([workerPos, customerPos]);
    map.fitBounds(bounds, { padding: [50, 50] });
  </script>
</body>
</html>`;
}
