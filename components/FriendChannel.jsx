const { React } = require('powercord/webpack');
const { open: openModal } = require('powercord/modal');
const InformationModal = require('./InformationModal');
const { Tooltip } = require('powercord/components');
const { Info } = require('powercord/components/Icons');
const { Statuses } = require('./../Constants');
const { Spinner } = require('powercord/components');
const Plugin = powercord.pluginManager.get('betterfriends');
const infomodal = Plugin.settings.get('infomodal');

module.exports = class BetterFriendChannel extends React.Component {
  constructor ({ _modules, target, selected }) {
    super();
    this._modules = _modules;
    this.target = target;
    this.selected = selected;

    // Bind this to button click event
    this.informationClick = this.informationClick.bind(this);
    this.userClick = this.userClick.bind(this);
  }

  userClick (e) {
    const { transitionTo, getCurrentUser, openPrivateChannel } = this._modules;
    e.stopPropagation();
    e.preventDefault();

    let { target } = e;
    const callNewTarget = () => {
      target = target.parentElement;
      if (![ ...target.classList ].includes('channel-2QD9_O')) {
        callNewTarget();
      }
    };
    callNewTarget();
    for (const elm of [ ...document.querySelectorAll('.selected-1HYmZZ') ]) {
      elm.classList.remove('selected-1HYmZZ');
    }

    target.classList.add('selected-1HYmZZ');

    // Need to improve how we detect whether or not we're transitioning to a Discord channel or private channel
    if (!target.firstChild.getAttribute('href').includes('undefined')) {
      transitionTo(target.firstChild.getAttribute('href'));
    } else {
      const user = getCurrentUser();
      openPrivateChannel(user.id, this.target.id);
    }
  }

  informationClick (e) {
    e.preventDefault();
    const info = Plugin.FRIEND_DATA.lastMessageID[this.target.id];
    openModal(() => React.createElement(InformationModal, {
      user: this.target,
      channel: !info ? 'nothing' : info.channel,
      message: !info ? 'nothing' : info.id
    }));
    e.stopPropagation();
  }

  render () {
    const { getDMFromUserId, getRelationships, getStatus, typingStore, isMobileOnline, getPrimaryActivity } = this._modules;
    return (() => {
      // Group DM
      if (this.target.type === 3) {
        return ((() => (
          <div className={`channel-2QD9_O pc-channel pc-friendchannel ${this.selected ? 'selected-1HYmZZ' : ''}`} style={{ height: '42px',
            opacity: 1 }}>
            <a href={`/channels/@me/${this.target.id}`} onClick={this.userClick}>
              <div className='wrapper-2F3Zv8 pc-wrapper small-5Os1Bb pc-small forceDarkTheme-2cI4Hb pc-forceDarkTheme avatar-28BJzY pc-avatar avatarSmall-3ACRaI'>
                <div className='inner-1W0Bkn pc-inner stop-animation' style={{ backgroundImage: `url('${this.target.icon
                  ? `https://cdn.discordapp.com/channel-icons/${this.target.id}/${this.target.icon}`
                  : '/assets/f046e2247d730629309457e902d5c5b3.svg'}')` }}></div>
              </div>
              <div className='name-2WpE7M'>{this.target.name}
                <div className='activity-525YDR'>{this.target.recipients.length + 1} Members</div>
              </div>
              <button className='close-3hZ5Ni'></button>
            </a>
          </div>
        ))());
      }

      // This ain't a user, son! This is just a generic channel with a name and SVG avatar.
      if (!this.target.id) {
        return (<div className={`channel-2QD9_O pc-channel pc-friendchannel ${this.selected ? 'selected-1HYmZZ' : ''}`} style={{ height: '42px',
          opacity: 1 }}>
          <a href={this.target.href} onClick={this.userClick}>
            <svg name={this.target.name} className='linkButtonIcon-Mlm5d6' width={this.target.width || '24'} height={this.target.height || '24'} viewBox={this.target.viewBox || '0 0 24 24'}>
              {(this.target.avatar && this.target.avatar.entireElement) || <g fill='none' fill-rule='evenodd'>
                <path fill='currentColor' d={this.target.avatar}></path>
                <rect width='24' height='24'></rect>
              </g>}
            </svg>
            <div className='name-2WpE7M pc-name'>{this.target.name}</div>
            {(() => {
              if (this.target.name === 'Friends') {
                const rel = getRelationships();
                const pending = Object.keys(rel).filter(r => rel[r] === 3);
                if (pending.length) {
                  return (<div className='wrapper-232cHJ pc-wrapper'>{pending.length}</div>);
                }
              }
            })()}
          </a>
        </div>);
      }

      return ((() => {
        const status = getStatus(this.target.id);
        const mobile = isMobileOnline(this.target.id);
        const activity = getPrimaryActivity(this.target.id);
        const channel = getDMFromUserId(this.target.id);
        const isTyping = Object.keys(typingStore.getTypingUsers(channel)).includes(this.target.id);

        const MOBILE_ICON = <svg name='MobileDevice' className='mobileIndicator-3gyhuE' width='16' height='16' viewBox='0 0 24 24'><g fill='none' fill-rule='evenodd'><path fill='currentColor' d='M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z'></path></g></svg>;

        return (<div className={`channel-2QD9_O pc-channel pc-friendchannel bf-channel ${this.selected ? 'selected-1HYmZZ' : ''}`} style={{ height: '42px',
          opacity: 1 }}>
          <a href={`/channels/@me/${channel}`} onClick={this.userClick}>
            <div className='wrapper-2F3Zv8 pc-wrapper small-5Os1Bb pc-small forceDarkTheme-2cI4Hb pc-forceDarkTheme avatar-28BJzY pc-avatar avatarSmall-3ACRaI'>
              <div user={this.target.username} status={status} className='inner-1W0Bkn pc-inner stop-animation' style={{ backgroundImage: `url(${this.target.avatarURL})` }}></div>
              <div className={`${Statuses[status].class} ${isTyping && 'typing-1KJk_j'} status-oxiHuE pc-${status} pc-status small-5Os1Bb pc-small status-2zcSVk pc-status status-1ibiUI pc-status`}>
                {isTyping && <Spinner type='pulsingEllipsis' style={{
                  opacity: 0.7,
                  transform: 'scale(0.8, 0.8)'
                }} />}
              </div>
            </div>
            {(() => {
              if (activity) {
                return <div className='name-2WpE7M'>
                  <span className='nameWithActivity-1ceSyU'>{this.target.username}</span>
                  {mobile && MOBILE_ICON}
                  <div className='flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6 activity-525YDR'>
                    <div className='activityText-OW8WYb'>
                      Playing <strong>{activity.name}</strong>
                    </div>
                    {activity.application_id && <svg name='RichActivity' className='activityIcon-1mtTk4' width='16' height='16' viewBox='0 0 16 16'><path className='activityIconForeground-3VIgI8' fill='currentColor' d='M6,7 L2,7 L2,6 L6,6 L6,7 Z M8,5 L2,5 L2,4 L8,4 L8,5 Z M8,3 L2,3 L2,2 L8,2 L8,3 Z M8.88888889,0 L1.11111111,0 C0.494444444,0 0,0.494444444 0,1.11111111 L0,8.88888889 C0,9.50253861 0.497461389,10 1.11111111,10 L8.88888889,10 C9.50253861,10 10,9.50253861 10,8.88888889 L10,1.11111111 C10,0.494444444 9.5,0 8.88888889,0 Z' transform='translate(3 3)'></path></svg>}
                  </div>
                </div>;
              }
              return <div className='nameWrapper-10v56U'><span className='name-2WpE7M'>{this.target.username}</span>{mobile && MOBILE_ICON}</div>;
            })()}

            {Plugin.FAV_FRIENDS.includes(this.target.id) && infomodal && <Tooltip className='bf-information-tooltip' text='User Information' position='top'><Info className='bf-information' onClick={this.informationClick} /></Tooltip>}
            {!Plugin.FAV_FRIENDS.includes(this.target.id) && <button className='close-3hZ5Ni'></button>}
          </a>
        </div>);
      })());
    })();
  }
};
