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

var createPopup = function(name, days, price, id, isAdmin, isOwn, isDeveloper) {
  if (isOwn) {
    return new mapboxgl.Popup()
      .setHTML(`
        <h3>${name}</h3>
        <div>Thats you!</div>
      `)
  }

  if (isAdmin) {
    return new mapboxgl.Popup()
      .setHTML(`
        <form action="/api/conversation/${id}" method="POST">
          <input type="hidden" name="_csrf" value="${window.csrf}"/>
          <h3>${name}</h3><div>Dust Founder</div><div>ask me anything!</div>
          <button class="cta" type="submit">Chat</button>
        </form>
      `)
  }

  if (isDeveloper) {
    return new mapboxgl.Popup()
      .setHTML(`
        <form action="/api/conversation/${id}" method="POST">
          <input type="hidden" name="_csrf" value="${window.csrf}"/>
          <h3>${name}</h3><div>Last MVP built</div><div>in ${days} days for ${price}</div>
          <button class="cta" type="submit">Request Chat</button>
        </form>
      `)
  } else {
    return new mapboxgl.Popup()
      .setHTML(`
        <form action="/api/conversation/${id}" method="POST">
          <input type="hidden" name="_csrf" value="${window.csrf}"/>
          <h3>${name}</h3><div>Needs MVP built</div><div>in ${days} days for ${price}</div>
          <button class="cta" type="submit">Request Chat</button>
        </form>
      `)
  }
}

$.getJSON('/api/developers', function(res) {
  if (res && res.data) {
    res.data.map(person => {
      var el = document.createElement('div');

      // Show different marker for admins
      if (person.isAdmin) {
        el.className = 'isAdmin';
      } else if (person.isOwn) {
        el.className = 'isOwn';
      } else if (person.isDeveloper) {
        el.className = 'isDeveloper';
      } else {
        el.className = 'isFounder';
      }

      return new mapboxgl.Marker(el, { offset: [-11, -11] })
        .setLngLat(person.location)
        .setPopup(createPopup(
          person.name,
          person.lastDuration,
          person.lastPrice,
          person.id,
          person.isAdmin,
          person.isOwn,
          person.isDeveloper
        ))
        .addTo(map);
    })
  }
});

// Parse current query params in url
function getQueryParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

if (getQueryParam('welcome')) {
  $('#myModal').modal('show');
}
