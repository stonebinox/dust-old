/* eslint-disable */

const socket = require('socket.io-client')('/');

socket.emit('enter conversation', window.conversationId);

socket.on('refresh messages', (msg) => {
  const sentAt = new Date().toLocaleString();
  const name = msg.name === window.currentUsersName ? 'You' : msg.name

  appendMessage(msg.message, sentAt, msg.email, name);
});

// Scroll chat to bottom..
const scrollToBottom = () => {
  const div1 = document.getElementById('js-chat');
  const div2 = document.getElementById('js-chat-area');

  div1.scrollTop = div1.scrollHeight - div1.clientHeight;
  div2.scrollTop = div2.scrollHeight - div2.clientHeight;
};

const getGravatar = (email, size) => {
  return 'https://api.adorable.io/avatars/285/' + email + '.png';
};

$.ajaxSetup({
  headers:
  { 'X-CSRF-TOKEN': window.csrf }
});

const sendMessage = (composedMessage) => {
  return new Promise((resolve, reject) => {
    $('.js-chat-reply .reload-small').removeClass('hidden');
    $('.js-chat-reply').prop('disabled', true);

    $.post(`/api/conversation/${window.conversationId}/reply`, { composedMessage, _csrf: window.csrf }, () => {
      resolve({
        sentAt: new Date().toLocaleString()
      })
    })
      .fail(function(err) {
        console.log(err);
        reject(err);
      })
      .always(function() {
        $('.js-chat-reply .reload-small').addClass('hidden');
        $('.js-chat-reply').prop('disabled', false);
      });
  })
};

const appendMessage = (msg, time, email, name) => {
  const avatar = getGravatar(email);

  const el = `
    <div class="media">
      <div class="pull-left">
        <div class="avatar">
          <img alt="64x64" class="media-object" src="${avatar}">
        </div>
      </div>
      <div class="media-body">
        <h5 class="media-heading">${name}</h5>
        <div class="pull-right">
          <h6 class="text-muted">${time}</h6>
        </div>
        <p>${msg}</p>
      </div>
    </div>
  `;

  $('#js-chat').append(el);
  scrollToBottom();
};

const persistMessage = () => {
  const msg = $('.js-chat-text').val();
  $('.js-chat-text').val('');

  sendMessage(msg).then((options) => {
    socket.emit('new message', {
      room: window.conversationId,
      message: msg,
      name: window.currentUsersName,
      email: window.currentUsersEmail
    });
  })
};

$('.js-chat-text').on('keypress', function(e) {
  const key = e.keyCode;

  // If the user has pressed enter
  if (key === 13) {
    persistMessage();
    return false;
  }
});

$('.js-chat-reply').on('click', () => {
  persistMessage();
});

// Load email gravatars
$('.js-avatar').each((e, i) => {
  const el = $(i);
  const uri = getGravatar(el.attr('data-email'));

  el.prop('src', uri);
});

// When page loads scroll chat to bottom of list..
scrollToBottom();
