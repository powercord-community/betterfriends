const { waitFor, getOwnerInstance } = require('powercord/util');
const { React } = require('powercord/webpack');
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

  await waitFor('.nameAndDecorators-5FJ2dg');
  await waitFor('.headerCozyMeta-rdohGq');

  const genericInjection = (res, id, inject, className = 'bf-star') => {
    if (this.FAV_FRIENDS.includes(id)) {
      inject.splice(1, 0, React.createElement(Star, { className }));
    }
    return res;
  };

  const INJECT_INTO = [
    {
      id: 'headerCozyMeta-rdohGq',
      className: '.headerCozyMeta-rdohGq',
      func (res, original) {
        if (original.props.children && original.props.children[0] && original.props.children[0].props && original.props.children[0].props.children) {
          const { user } = original.props.children[0].props.children[0].props;
          if (user) {
            genericInjection(original, user.id, original.props.children[0].props.children[1].props.children);
          }
        }
        return original;
      }
    },
    {
      id: 'nameAndDecorators-5FJ2dg',
      className: '.member-3-YXUe > .layout-2DM8Md > .content-3QAtGj > .nameAndDecorators-5FJ2dg',
      func (res, original) {
        if (original.props.className && original.props.className.includes('member-3-YXUe') && original.props.children) {
          const user = original.props.children.props.children[1].props.children[0].props.children[1]._owner.pendingProps.user.id;
          if (user) {
            genericInjection(original, user, original.props.children.props.children[1].props.children[0].props.children[1].props.children, 'bf-star bf-star-member');
          }
        }
        return original;
      }
    }
  ];

  for (const injection of INJECT_INTO) {
    const { id, className, func } = injection;
    await waitFor(className);
    const selector = document.querySelector(className);
    const updateInstance = () =>
      (this.instance = getOwnerInstance(selector));
    const instancePrototype = Object.getPrototypeOf(updateInstance());
    updateInstance();

    inject(`bf-star-${id}`, instancePrototype, 'render', function (_, res) {
      return func(this, res);
    });
  }
};
