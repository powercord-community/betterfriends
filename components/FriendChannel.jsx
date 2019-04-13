const { React } = require('powercord/webpack');
const { getModule } = require('powercord/webpack');
const { open: openModal } = require('powercord/modal');
const InformationModal = require('./InformationModal');
const { Tooltip } = require('powercord/components');
const { Info } = require('powercord/components/Icons');
const { Statuses } = require('./../Constants');
const { getDMFromUserId } = getModule([ 'getDMFromUserId' ]);
const { openPrivateChannel } = getModule([ 'openPrivateChannel' ]);
const { transitionTo } = getModule([ 'transitionTo' ]);
const { getCurrentUser } = getModule([ 'getCurrentUser' ]);
const { getStatus } = getModule([ 'getStatus' ]);
const { config: { infomodal } } = powercord.pluginManager.get('betterfriends').settings;

module.exports = class BetterFriendChannel extends React.Component {
  constructor ({ target }) {
    super();
    this.target = target;

    // bind this to button click event
    this.informationClick = this.informationClick.bind(this);
    this.userClick = this.userClick.bind(this);
  }

  // no usage of "this", no need to bind
  userClick (e) {
    e.stopPropagation();
    e.preventDefault();

    let { target } = e;
    const callNewTarget = () => {
      target = target.parentNode;
      if (![ ...target.classList ].includes('pc-channel')) {
        callNewTarget();
      }
    };
    callNewTarget();
    if (!target.firstChild.getAttribute('href').includes('undefined')) {
      transitionTo(target.firstChild.getAttribute('href'));
    } else {
      const user = getCurrentUser();
      openPrivateChannel(user.id, this.target.id);
    }

    for (const elm of [ ...document.querySelectorAll('.selected-1HYmZZ') ]) {
      elm.classList.remove('selected-1HYmZZ', 'pc-selected');
    }

    setTimeout(() => target.classList.add('selected-1HYmZZ', 'pc-selected'), 2);
  }

  informationClick (e) {
    e.preventDefault();
    const info = this.data.FRIEND_DATA.lastMessageID[this.target.id];
    openModal(() => React.createElement(InformationModal, {
      user: this.target,
      channel: !info ? 'nothing' : info.channel,
      message: !info ? 'nothing' : info.id
    }));
    e.stopPropagation();
  }

  render () {
    return (() => {
      if (this.target.icon) {
        return ((() => (
          <div className="channel-2QD9_O pc-channel pc-friendchannel" style={{ height: '42px',
            opacity: 1 }}>
            <a href={`/channels/@me/${this.target.id}`} onClick={this.userClick}>
              <div className="wrapper-2F3Zv8 pc-wrapper small-5Os1Bb pc-small forceDarkTheme-2cI4Hb pc-forceDarkTheme avatar-28BJzY pc-avatar avatarSmall-3ACRaI">
                <div className="inner-1W0Bkn pc-inner stop-animation" style={{ backgroundImage: `url("https://cdn.discordapp.com/channel-icons/${this.target.id}/${this.target.icon}")` }}></div>
              </div>
              <div className="nameWrapper-10v56U"><span className="name-2WpE7M">{this.target.name}</span></div>
            </a>
          </div>
        ))());
      }

      // This ain't a user, son! This is just a generic channel with a name and SVG avatar.
      if (!this.target.id) {
        return (<div className="channel-2QD9_O pc-channel pc-friendchannel" style={{ height: '42px',
          opacity: 1 }}>
          <a href={this.target.href} onClick={this.userClick}>
            <svg name={this.target.username} className='linkButtonIcon-Mlm5d6' width={this.target.width || '24'} height={this.target.height || '24'} viewBox='0 0 24 24'>
              <g fill='none' fill-rule='evenodd'>
                <path fill='currentColor' d={this.target.avatar}></path>
                <rect width='24' height='24'></rect>
              </g>
            </svg>
            <div className="name-2WpE7M pc-name">{this.target.name}</div>
          </a>
        </div>);
      }

      return ((() => {
        const status = getStatus(this.target.id);
        return (<div className="channel-2QD9_O pc-channel pc-friendchannel" style={{ height: '42px',
          opacity: 1 }}>
          <a href={`/channels/@me/${getDMFromUserId(this.target.id)}`} onClick={this.userClick}>
            <div className="wrapper-2F3Zv8 pc-wrapper small-5Os1Bb pc-small forceDarkTheme-2cI4Hb pc-forceDarkTheme avatar-28BJzY pc-avatar avatarSmall-3ACRaI">
              <div user={this.target.username} status={status} className="inner-1W0Bkn pc-inner stop-animation" style={{ backgroundImage: `url(${this.target.avatarURL})` }}></div>
              <div className={`${Statuses[status].class} status-oxiHuE pc-${status} pc-status small-5Os1Bb pc-small status-2zcSVk pc-status status-1ibiUI pc-status`}></div>
            </div>
            <div className="nameWrapper-10v56U"><span className="name-2WpE7M">{this.target.username}</span></div>
            {() => {
              if (infomodal) {
                return <Tooltip className="bf-information-tooltip" text='User Information' position='top'><Info className="bf-information" onClick={this.informationClick} /></Tooltip>;
              }
            }}
          </a>
        </div>);
      })());
    })();
  }
};
