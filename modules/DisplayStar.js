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

  await waitFor('.pc-username');
  await waitFor('.pc-message');

  const genericInjection = (res, id, inject, className = 'bf-star') => {
    if (this.FAV_FRIENDS.includes(id)) {
      inject.splice(1, 0, React.createElement(Star, { className }));
    }
    return res;
  };

  const INJECT_INTO = [
    {
      id: 'message',
      className: '.pc-message',
      func (res, original) {
        if (original && original.props && original.props.children[0]) {
          const { message } = res.props;
          const { author } = message;
          return genericInjection(original, author.id, original.props.children[0].props.children[1].props.children);
        }
        return original;
      }
    },
    {
      id: 'memberInner',
      className: '.pc-memberInner',
      func (res, original) {
        const _original = original;
        original = original.props.children;
        if (original && original.props.children && original.props.children[1] && original.props.children[1].props.children) {
          const { id } = original.props.children[1].props.children[0].props.children[0].props.user;
          if (!id) {
            return _original;
          }
          return genericInjection(_original, id, original.props.children[1].props.children[0].props.children, 'bf-star-member');
        }
        return _original;
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
