const { inject } = require('powercord/injector');
const { React, getModule } = require('powercord/webpack');
const { waitFor, getOwnerInstance } = require('powercord/util');
const { DirectMessagesList } = require('./../components');

/*
 * [ Friend DM Channel ]
 * Creates and populates the "Favorited Friends" section on the private channel/DMs screen
 */
module.exports = async function () {
  if (!document.querySelector('.pc-privateChannels')) {
    await waitFor('.pc-privateChannels');
  }

  const updateDirectMessagesInstance = () =>
    (this.directMessagesInstance = getOwnerInstance(document.querySelector('.pc-privateChannels')));
  const directMessagesInstance = Object.getPrototypeOf(updateDirectMessagesInstance());
  updateDirectMessagesInstance();

  inject('bf-direct-messages', directMessagesInstance, 'render', (args, res) => {
    if (document.querySelector('div.channel-2QD9_O')) {
      return React.createElement(DirectMessagesList, { thisObj: this });
    }
    return res;
  });
};
