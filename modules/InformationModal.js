const { getModule } = require('powercord/webpack');
const { inject } = require('powercord/injector');

/*
 * [ Information Modal ]
 * Handles the collection of data used by the information modal (little info button found on favorited friends in DM channels)
 */
module.exports = async function () {
  if (this.settings.config.infomodal) {
    const mdl = await getModule([ 'receiveMessage' ]);
    inject('bf-message-listener', mdl, 'receiveMessage', (args, res) => {
      const message = args[1];
      if (message && this.FAV_FRIENDS.includes(message.author.id)) {
        this.FRIEND_DATA.lastMessageID[message.author.id] = {
          id: message.id,
          channel: message.channel_id
        };
      }
      return res;
    });
  }
};
