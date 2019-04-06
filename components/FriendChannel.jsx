const { React } = require('powercord/webpack');
const { getModule } = require('powercord/webpack');
const { getDMFromUserId } = getModule([ 'getDMFromUserId' ]);
const { open: openModal } = require('powercord/modal');
const InformationModal = require('./InformationModal');

module.exports = ({ user, status, statuses, data }) => (
  <div class="channel-2QD9_O pc-channel" style={{ height: '42px',
    opacity: 1 }} onClick={(e) => {
    getModule([ 'transitionTo' ]).transitionTo(`/channels/@me/${getDMFromUserId(user.id)}`);

    let { target } = e;
    const callNewTarget = () => {
      target = target.parentNode;
      if (![ ...target.classList ].includes('pc-channel')) {
        callNewTarget();
      }
    };
    callNewTarget();

    for (const elm of [ ...document.querySelectorAll('.pc-selected') ]) {
      elm.classList.remove('selected-1HYmZZ', 'pc-selected');
    }
    target.classList.add('selected-1HYmZZ', 'pc-selected');
  }}>
    <a>
      <div class="wrapper-2F3Zv8 pc-wrapper small-5Os1Bb pc-small forceDarkTheme-2cI4Hb pc-forceDarkTheme avatar-28BJzY pc-avatar avatarSmall-3ACRaI">
        <div user={user.username} status={status} class="inner-1W0Bkn pc-inner stop-animation" style={{ backgroundImage: `url(${user.avatarURL})` }}></div>
        <div class={`${statuses[status].class} status-oxiHuE pc-${status} pc-status small-5Os1Bb pc-small status-2zcSVk pc-status status-1ibiUI pc-status`}></div>
      </div>
      <div class="nameWrapper-10v56U pc-nameWrapper"><span class="name-2WpE7M pc-name">{user.username}</span></div>
      <button class="close-3hZ5Ni bf-information" onClick={(e) => {
        e.cancelBubble = true;
        e.stopPropagation();
        const info = data.FRIEND_DATA.lastMessageID[user.id];
        openModal(() => React.createElement(InformationModal, {
          user,
          channel: !info ? 'nothing' : info.channel,
          message: !info ? 'nothing' : info.id
        }));
      }}></button>
    </a>
  </div>
);
