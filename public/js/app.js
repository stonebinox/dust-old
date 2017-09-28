/* eslint-disable */

mapboxgl.accessToken = 'pk.eyJ1Ijoic2FiYXJhc2FiYSIsImEiOiJjajd3MmowMW81Y2t3MndvMjA2Y3BmYWhlIn0.cPBB7UP-sNjWYRqumJCQXA';

var map = new mapboxgl.Map({
  container: 'js-map',
  style: 'mapbox://styles/mapbox/streets-v9',
  center: window.initialLocation.reverse(),
  zoom: 12
});

var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken
});

map.addControl(geocoder);

var createPopup = function(name, days, price, id) {
  return new mapboxgl.Popup()
    .setHTML(`
      <form action="/api/conversation/${id}" method="POST">
        <input type="hidden" name="_csrf" value="${window.csrf}"/>
        <h3>${name}</h3><div>Last MVP built</div><div>in ${days} days for $${price}</div>
        <button class="cta" type="submit">Request Chat</button>
      </form>
    `);
}

$.getJSON('/api/developers', function(res) {
  if (res && res.data) {
    res.data.map(person => {
      var el = document.createElement('div');
      return new mapboxgl.Marker(el, { offset: [-11, -11] })
        .setLngLat(person.location)
        .setPopup(createPopup(person.name, person.lastDuration, person.lastPrice, person.id))
        .addTo(map);
    })
  }
});
