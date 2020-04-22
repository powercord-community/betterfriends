const { getModule } = require('powercord/webpack');
const { inject } = require('powercord/injector');

/*
 * [ Notification Sounds ]
 * Handles custom notification sounds
 */
module.exports = async function () {
  let doPlayCustomSound = false;
  const playSound = await getModule([ 'playSound' ]);
  const { getCurrentUser } = await getModule([ 'getCurrentUser' ]);
  const makeTextChatNotification = await getModule([ 'makeTextChatNotification' ]);

  const custom = this.settings.get('notifsounds', {});
  const isFavoriteFriend = (id) => this.FAV_FRIENDS.includes(id);

  const AUDIO = Object.keys(custom).map(s => {
    const sound = custom[s];
    const a = new Audio();
    a.src = sound.url;
    a.volume = sound.volume || 0.4;
    return a;
  });

  const play = (type) => {
    if (AUDIO[type]) {
      AUDIO[type].play();
    } else {
      this.log(`${type} was missing from audio cache, loading it manually`);
      const audio = new Audio();
      audio.pause();
      audio.src = custom[type].url;
      audio.volume = 0.1 || custom[type].volume;
      audio.play();
    }
  };

  // Overwrite the original `playSound` function
  playSound.playSound = function (e) {
    if (!doPlayCustomSound || !custom[e]) {
      playSound.createSound(e).play();
    } else {
      play(e);
      if (doPlayCustomSound) doPlayCustomSound = false;
    }
  };

  inject('bf-notification', makeTextChatNotification, 'makeTextChatNotification', (args, res) => {
    const self = getCurrentUser();
    const message = args[1];
    if (self.id !== message.author.id) {
      if (isFavoriteFriend(message.author.id)) {
        this.log('Playing custom sound for favorited friend')
        doPlayCustomSound = true;
      }
    }
    return res;
  });
};
