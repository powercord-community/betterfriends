const { React, getModule } = require('powercord/webpack');
const { Confirm } = require('powercord/components/modal');
const { close: closeModal } = require('powercord/modal');

module.exports = class InformationModal extends React.Component {
  constructor ({ user, channel, message }) {
    super();
    this.user = user;
    this.channel = channel;
    this.message = message;
  }

  parse (time) {
    const fm = [
      Math.floor(time / 60 / 60 / 24 / 30), // MONTHS
      Math.floor(time / 60 / 60 / 24) % 30, // DAYS
      Math.floor(time / 60 / 60) % 24, // HOURS
      Math.floor(time / 60) % 60, // MINUTES
      Math.floor(time % 60) // SECONDS
    ];
    const timeArr = [ { type: { singular: 'month',
      plural: 'months' },
    amount: fm[0] },
    { type: { singular: 'day',
      plural: 'days' },
    amount: fm[1] },
    { type: { singular: 'hour',
      plural: 'hours' },
    amount: fm[2] },
    { type: { singular: 'minute',
      plural: 'minutes' },
    amount: fm[3] },
    { type: { singular: 'second',
      plural: 'seconds' },
    amount: fm[4] } ];
    const properArr = [];
    for (const i in timeArr) {
      if (timeArr[i].amount > 0) {
        properArr.push(`${timeArr[i].amount} ${(timeArr[i].amount === 1 ? timeArr[i].type.singular : timeArr[i].type.plural).slice(0)}`);
      }
    }
    return (properArr.slice(0, -2).join(', ') + (properArr.slice(0, -2).length ? ', ' : '') + properArr.slice(-2).join(' and ')) || '0 seconds';
  }

  async componentDidMount () {
    this.setState({
      getChannel: (await getModule([ 'getChannel' ])).getChannel,
      getUser: (await getModule([ 'getUser' ])).getUser,
      getGuild: (await getModule([ 'getGuild' ])).getGuild,
      getMessage: (await getModule([ 'getMessages' ])).getMessages
    });
  }

  render () {
    if (!this.state) {
      return null;
    }
    const { getUser, getChannel, getGuild, getMessage } = this.state;
    return (
      <Confirm
        red={false}
        header='Information'
        cancelText='Alright'
        onCancel={closeModal}
      >
        <div className='bf-information-modal'>
          {(() => {
            const { username } = getUser(this.user.id);
            const channel = getChannel(this.channel);
            if (!channel) {
              return (<div class='text-2F8PnX marginBottom20-32qID7 primary-jw0I4K'>{username} hasn't been seen anywhere recently.</div>);
            }
            const guild = getGuild(channel.guild_id);
            const message = getMessage(channel.id, this.message);
            return (<div class='text-2F8PnX marginBottom20-32qID7 primary-jw0I4K'>{username} was last seen in {guild ? `#${channel.name} (${guild.name})` : 'your DMs'} {message ? `around ${this.parse((Date.now() / 1000) - (message.timestamp / 1000))} ago` : ''}</div>);
          })()}
        </div>
      </Confirm>
    );
  }
};
