/* eslint-disable */
// https://goodies.pixabay.com/jquery/auto-complete/demo.html

const MapboxClient = require('mapbox');

const token = 'pk.eyJ1Ijoic2FiYXJhc2FiYSIsImEiOiJjajd3MmowMW81Y2t3MndvMjA2Y3BmYWhlIn0.cPBB7UP-sNjWYRqumJCQXA';
const client = new MapboxClient(token);

$('.js-location').autoComplete({
  delay: 250,

  source: function(term, response){
    client.geocodeForward(term, function(err, data) {
      const serialized = data.features.map(e => {
        return [e.place_name, JSON.stringify(e.center)]
      })

      response(serialized);
    });
  },

  renderItem: function(item) {
    return `
      <div class="autocomplete-suggestion" data-val="${item[0]}" data-sel="${item[1]}">
        ${item[0]}
      </div>
    `
  },

  onSelect: function(e, term, item) {
    const $item = $(item);

    $('.js-location-ll').val($item.attr('data-sel'));
    $('.js-location-pretty').val($item.attr('data-val'));
  }
});
