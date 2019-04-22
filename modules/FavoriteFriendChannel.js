const { inject } = require('powercord/injector');
const { React, getModuleByDisplayName, Flux, getModule } = require('powercord/webpack');
let { DirectMessagesList } = require('./../components');

/*
 * [ Friend DM Channel ]
 * Creates and populates the "Favorited Friends" section on the private channel/DMs screen
 */
module.exports = async function () {
  const PrivateChannelsList = await getModuleByDisplayName('PrivateChannelsList');
  const typingStore = await getModule([ 'getTypingUsers' ]);
  const { getCurrentUser } = await getModule([ 'getCurrentUser' ]);

  DirectMessagesList = Flux.connectStores(
    [ typingStore ],
    ({ id }) => ({ typingCount: Object.keys(typingStore.getTypingUsers(id)).filter(id => id !== getCurrentUser().id).length })
  )(DirectMessagesList);

  inject('bf-direct-messages', PrivateChannelsList.prototype, 'render', () => React.createElement(DirectMessagesList, { thisObj: this }));
};
