/* eslint-disable */

const getGravatar = (email, size) => {
  return 'https://api.adorable.io/avatars/285/' + email + '.png';
};

// Load email gravatars
$('.js-avatar').each((e, i) => {
  const el = $(i);
  const uri = getGravatar(el.attr('data-email'), 200);

  el.prop('src', uri);
});
