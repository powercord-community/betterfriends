const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { inject } = require('powercord/injector');
const { Star } = require('./../components');

/*
 * [ Display Star ]
 * Handles the displaying of the little star emoji next to favorited friends in both chat and in member lists.
 */
module.exports = async function () {
  if (!this.settings.get('displaystar', true)) {
    return;
  }
  const classes = await getModule([ 'profileBadgeStaff' ]);
  const isFavoriteFriend = (id) => this.FAV_FRIENDS.includes(id);

  /**
   * Thanks to Bowser65 for some of the code provided below
   */
  const _injectMembers = async () => {
    const MemberListItem = await getModuleByDisplayName('MemberListItem')
    inject('bf-star-members', MemberListItem.prototype, 'renderDecorators', function (args, res) {
      if (!isFavoriteFriend(this.props.user.id)) return res;
      res.props.children.unshift(
        React.createElement('div', { className: `bf-badge ${classes.topSectionNormal}` },
          React.createElement(Star, { className: 'bf-star-member' })
        )
      )
      return res
    })
  }

  const _injectMessages = async () => {
    const MessageTimestamp = await getModule(['MessageTimestamp']);
    inject('bf-star-messages', MessageTimestamp, 'default', (args, res) => {
      if (!isFavoriteFriend(args[0].message.author.id)) return res;
      const header = res.props.children[1];
      // eslint-disable-next-line prefer-destructuring
      header.props.children[3] = header.props.children[2];
      header.props.children[2] = React.createElement('div', { className: `bf-badge ${classes.topSectionNormal}` },
        React.createElement(Star)
      )
      return res
    });
  }

  _injectMembers();
  _injectMessages();
};
