const { getModule } = require('powercord/webpack');
// Need to switch from Constants to settings file, where each Discord sound ID (ie. message1) is mapped to an mp3 link
const { Sounds } = require('./../Constants');

/*
 * [ Notification Sounds ]
 * Handles custom notification sounds
 */
module.exports = async function () {
  const playSound = getModule([ 'playSound' ]);
  const custom = this.settings.config.notifsounds;

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
      audio.src = custom[type].url;
      audio.volume = custom[type].volume;
      audio.play();
    }
  };

  // Overwrite the original `playSound` function
  playSound.playSound = function (e) {
    if (!Sounds[e] || (!custom[e] || !custom[e].url)) {
      playSound.createSound(e).play();
    } else {
      play(e);
    }
  };
};
