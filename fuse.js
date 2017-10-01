const { FuseBox } = require('fuse-box');

const fuse = FuseBox.init({
  target: 'browser',
  homeDir: 'public/js',
  output: 'public/js/dist/$name.js',
});

//fuse.bundle('settings')
  //.instructions('> settings.js')
  //.watch('public/js/settings.js');

fuse.bundle('chat')
  .instructions('> chat.js');
  //.watch('public/js/chat.js');

//fuse.bundle('messages')
  //.instructions('> messages.js')
  //.watch('public/js/messages.js');

fuse.run();
