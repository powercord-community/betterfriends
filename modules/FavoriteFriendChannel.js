const { inject } = require('powercord/injector');
const { React } = require('powercord/webpack');
const { waitFor, getOwnerInstance, sleep } = require('powercord/util');
const { DirectMessagesList } = require('./../components');

/*
 * [ Friend DM Channel ]
 * Creates and populates the "Favorited Friends" section on the private channel/DMs screen
 */
module.exports = async function () {
  if (!document.querySelector('.privateChannels-1nO12o')) {
    await waitFor('.privateChannels-1nO12o');
  }

  const updateDirectMessagesInstance = () =>
    (this.directMessagesInstance = getOwnerInstance(document.querySelector('.privateChannels-1nO12o')));
  const directMessagesInstance = Object.getPrototypeOf(updateDirectMessagesInstance());
  updateDirectMessagesInstance();

  inject('bf-direct-messages-mount', directMessagesInstance, 'componentDidMount', async (args, res) => {
    await sleep(1);
    if (document.querySelector('div.channel-2QD9_O')) {
      updateDirectMessagesInstance();
      this.directMessagesInstance.render();
      this.directMessagesInstance.forceUpdate();
    }
    return res;
  });

  inject('bf-direct-messages', directMessagesInstance, 'render', (args, res) => {
    if (document.querySelector('div.channel-2QD9_O')) {
      updateDirectMessagesInstance();
      this.directMessagesInstance.forceUpdate();
      this.log('Monkeypatching Direct Messages list component');
      // Implement typing code here
      return React.createElement(DirectMessagesList, { thisObj: this });
    }
    return res;
  });
};
