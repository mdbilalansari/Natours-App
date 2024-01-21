/* eslint-disable */

export const dispalyMap = function(locations) {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibWRiaWxhbGFuc2FyaTEyMzQiLCJhIjoiY2xyZHlkbTJjMTV6cTJqbGRybmcwMXp0ZSJ9.sUmO_J6NQ0t0bEimHjv_QQ';

  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mdbilalansari1234/clre1cy9j00c601pig9oc3g28', // style URL
    scrollZoom: false
    // center: [-74.5, 40], // starting position [lng, lat]
    // zoom: 9 // starting zoom
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create Marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extends the bounds to include the current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
