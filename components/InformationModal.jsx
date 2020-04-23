const { React, getModule } = require('powercord/webpack');
const { Confirm } = require('powercord/components/modal');
const { close: closeModal } = require('powercord/modal');

module.exports = class InformationModal extends React.Component {
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
    const getUser = (await getModule([ 'getUser' ])).getUser;
    const getGuild = (await getModule([ 'getGuild' ])).getGuild;
    const getChannel = (await getModule([ 'getChannel' ])).getChannel;
    const channel = await getChannel(this.props.channel);
    this.setState({
      getChannel,
      getUser,
      getGuild,
      extractTimestamp: (await getModule([ 'extractTimestamp' ])).extractTimestamp,
      user: await getUser(this.props.user.id),
      channel,
      guild: channel ? await getGuild(channel.guild_id) : null
    });
  }

  render () {
    if (!this.state) {
      return null;
    }
    const { user, channel, guild, extractTimestamp } = this.state;
    return (
      <Confirm
        red={false}
        header='Information'
        cancelText='Alright'
        onCancel={closeModal}
      >
        <div className='bf-information-modal'>
          {(() => {
            if (!channel) {
              return (<div className='text-2F8PnX colorStandard-2KCXvj marginBottom20-32qID7 primary-jw0I4K'>{user.username} hasn't been seen anywhere recently.</div>);
            }
            const timestamp = extractTimestamp(this.props.message);
            return (<div className='text-2F8PnX colorStandard-2KCXvj marginBottom20-32qID7 primary-jw0I4K'>{user.username} was last seen in {guild
              ? <span><span className='wrapperHover-1GktnT wrapper-3WhCwL'>#{channel.name}</span> ({guild.name})</span>
              : channel.recipients.length <= 2 ? 'your DMs' : <span className='wrapperHover-1GktnT wrapper-3WhCwL'>{channel.name}</span>
            } around {this.parse((Date.now() - timestamp) / 1000)} ago</div>);
          })()}
        </div>
      </Confirm>
    );
  }
};
