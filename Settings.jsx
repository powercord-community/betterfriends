const { React } = require('powercord/webpack');
const { getModule, getModuleByDisplayName } = require('powercord/webpack');
const { SwitchItem, TextInput } = require('powercord/components/settings');
const { Sounds } = require('./Constants');

const GROUP_DM_ICONS = [
  'https://discord.com/assets/861ab526aa1fabb04c6b7da8074e3e21.png', // orange
  'https://discord.com/assets/b8912961ea6ab32f0655d583bbc26b4f.png', // yellow
  'https://discord.com/assets/773616c3c8a7e21f8a774eb0d5625436.png', // teal
  'https://discord.com/assets/f810dc5fedb7175c43a3389aa890534f.png', // green
  'https://discord.com/assets/e1fb24a120bdd003a84e021b16ec3bef.png', // blue
  'https://discord.com/assets/b3150d5cef84b9e82128a1131684f287.png', // purple
  'https://discord.com/assets/485a854d5171c8dc98088041626e6fea.png', // pink
  'https://discord.com/assets/1531b79c2f2927945582023e1edaaa11.png', // red
];

module.exports = class Settings extends React.Component {
  constructor (props) {
    super(props);

    const get = props.getSetting
    this.plugin = powercord.pluginManager.get('betterfriends');

    this.state = {
      friendsQuery: '',
      favfriends: get('favfriends', []),
      favdms: get('favdms', []),
      notifsounds: get('notifsounds', {}),
      infomodal: get('infomodal', true),
      displaystar: get('displaystar', true),
      statuspopup: get('statuspopup', true)
    };
  }

  async componentDidMount () {
    this.setState({
      VerticalScroller: (await getModule(['AdvancedScrollerThin'])).AdvancedScrollerThin,
      Flex: await getModuleByDisplayName('Flex'),
      Text: await getModuleByDisplayName('Text'),
      PopoutList: await getModuleByDisplayName('PopoutList'),
      playSound: (await getModule([ 'playSound' ])).playSound,
      getUser: (await getModule([ 'getUser', 'getUsers' ])).getUser,
      getRelationships: (await getModule([ 'getRelationships' ])).getRelationships,
      getMutablePrivateChannels: (await getModule([ 'getChannel' ])).getMutablePrivateChannels,
    });
  }

  render () {
    if (!this.state.VerticalScroller) {
      return null;
    }
    const { VerticalScroller, Flex, Text, PopoutList, playSound, getUser, getRelationships, getMutablePrivateChannels } = this.state;
    const PopoutListSearchBar = PopoutList.prototype.constructor.SearchBar;
    const PopoutListDivider = PopoutList.prototype.constructor.Divider;
    const FlexChild = Flex.prototype.constructor.Child;
    const SelectableItem = PopoutList.prototype.constructor.Item;

    const relationships = getRelationships();
    const friends = Object.keys(relationships)
      .filter(relation => relationships[relation] === 1)
      .map(getUser)
      .map((user) => ({
        id: user.id,
        name: user.username,
        subtext: `#${user.discriminator}`,
        icon: !user.avatar
          ? `https://cdn.discordapp.com/embed/avatars/${
              user.discriminator % 5
            }.png`
          : `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
        groupId: 'favfriends',
      }));

    const dms = Object.values(getMutablePrivateChannels())
      .filter((x) => x.type === 3)
      .map((dm) => ({
        id: dm.id,
        name: dm.name || dm.rawRecipients.map((x) => x.username).join(', '),
        subtext: `${dm.recipients.length + 1} Members`,
        icon: !dm.icon
          ? GROUP_DM_ICONS[
              (BigInt(dm.id) >> 22n) % BigInt(GROUP_DM_ICONS.length)
            ]
          : `https://cdn.discordapp.com/channel-icons/${dm.id}/${dm.icon}.png`,
        groupId: 'favdms',
      }));

    const items = [...friends, ...dms];

    return (
      <div>
        <h5 className='h5-18_1nd title-3sZWYQ size12-3R0845 height16-2Lv3qA weightSemiBold-NJexzi marginBottom8-AtZOdT'>
          Manage favorited friends and group DMs
        </h5>
        <div className='description-3_Ncsb formText-3fs7AJ marginBottom20-32qID7 modeDefault-3a2Ph1 primary-jw0I4K'>
          You can add or remove favorited friends and group DMs from your list
          here.
        </div>

        <PopoutList
          className='bf-user-settings guildSettingsAuditLogsUserFilterPopout-3Jg5NE pc-guildSettingsAuditLogsUserFilterPopout elevationBorderHigh-2WYJ09 pc-elevationBorderHigh'
          popoutKey='bf-users'
        >
          <PopoutListSearchBar
            autoFocus={true}
            placeholder='Search friends and group DMs'
            query={this.state.friendsQuery || ''}
            onChange={(e) => this.setState({ friendsQuery: e })}
            onClear={() => this.setState({ friendsQuery: '' })}
          />

          {this.state.friendsQuery ? (
            <PopoutListDivider />
          ) : (
            <div style={{ paddingTop: '8px' }} />
          )}

          {this.state.friendsQuery && (
            <VerticalScroller className='scroller-2CvAgC pc-scroller'>
              {items
                .filter(({ name }) =>
                  this.state.friendsQuery
                    ? name
                        .toLowerCase()
                        .includes(this.state.friendsQuery.toLowerCase())
                    : true
                )
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item, i) => (
                  <SelectableItem
                    className='bf-friend-item'
                    id={item.id}
                    key={i.toString()}
                    selected={this.state[item.groupId].includes(item.id)}
                    onClick={(e) => {
                  if (!e.selected) {
                        this.state[item.groupId].push(e.id);
                        this._set(item.groupId, this.state[item.groupId]);
                  } else {
                        this._set(item.groupId, this.state[item.groupId].filter((a) => a !== e.id));
                  }
                  this.plugin.reload();
                }}>
                  <Flex align='alignCenter-1dQNNs' basis='auto' grow={1} shrink={1}>
                    <div>
                      <Flex align='alignCenter-1dQNNs' basis='auto' grow={1} shrink={1}>
                        <FlexChild key='avatar' basis='auto' grow={0} shrink={0} wrap={false}>
                          <img
                            src={item.icon}
                            width={32}
                            height={32}
                            style={{ borderRadius: '360px' }}
                          />
                        </FlexChild>
                        <FlexChild key='user-text' basis='auto' grow={1} shrink={1} wrap={false}>
                          <div className='userText-1WDPps'>
                              <span className='userText-1WDPps'>{item.name}</span>
                              {' '}
                              <span className='discriminator-3tYCOD'>{item.subtext}</span>
                          </div>
                        </FlexChild>
                      </Flex>
                    </div>
                  </Flex>
                  </SelectableItem>
                ))}
          </VerticalScroller>
          )}
        </PopoutList>

        <SwitchItem
          note='Toggles the functionality of the information button within the DM list on favorited friends'
          style={{ marginTop: '16px' }}
          value={this.state.infomodal}
          onChange={() => {
            this._set('infomodal');
            this.plugin.reload('InformationModal');
          }}
        >
          Information Modal
        </SwitchItem>

        <SwitchItem
          value={this.state.displaystar}
          onChange={() => {
            this._set('displaystar');
            this.plugin.reload('DisplayStar');
          }}
        >
          Display star next to favorited friends
        </SwitchItem>

        <SwitchItem
          note='Receive notifications in the bottom right-hand corner whenever a favorited friend changes their status'
          value={this.state.statuspopup}
          onChange={() => {
            this._set('statuspopup');
            this.plugin.reload();
          }}
        >
          Show status notifications
        </SwitchItem>

        <h5 className='h5-18_1nd title-3sZWYQ size12-3R0845 height16-2Lv3qA weightSemiBold-NJexzi marginBottom8-AtZOdT marginTop40-i-78cZ'>
          Notification Sounds
        </h5>
        <div className='description-3_Ncsb formText-3fs7AJ marginBottom20-32qID7 modeDefault-3a2Ph1 primary-jw0I4K'>
          Customize notification sounds specifically for favorited friends. You can put a link to an MP3 file in the textbox, or leave it blank to play the default sound
        </div>
        {Object.keys(Sounds)
          .map((sound) =>
            <div className='bf-notification-sounds' style={{ marginBottom: '16px' }}>
              <div style={{ float: 'left' }}>
                <Text className='title-31JmR4 titleDefault-a8-ZSr medium-zmzTW- size16-14cGz5 height20-mO2eIN'>
                  <label className='title-31JmR4 titleDefault-a8-ZSr medium-zmzTW- size16-14cGz5 height20-mO2eIN'>
                    {Sounds[sound]}
                  </label>
                </Text>
              </div>

              <div style={{ float: 'right' }}>
                <div style={{ float: 'left' }}>
                  <button onClick={() => playSound(sound)} className='bf-notification-sounds-icon button-1Pkqso iconButton-eOTKg4 button-38aScr lookOutlined-3sRXeN colorWhite-rEQuAQ buttonSize-2Pmk-w iconButtonSize-U9SCYe grow-q77ONN'/>
                </div>
                <div style={{ float: 'right',
                  paddingLeft: '16px' }}>
                  <TextInput
                    onChange={(value) => {
                      this.state.notifsounds[sound] = { url: value,
                        volume: 0.4 };
                      this._set('notifsounds', this.state.notifsounds);
                    }}
                    className='bf-textarea-notifsounds'
                    style={{ height: '33px' }}
                    placeholder='Link to MP3 file'
                    defaultValue={this.state.notifsounds[sound] ? this.state.notifsounds[sound].url : ''}
                  />
                </div>
              </div>
            </div>
          )
        }
      </div>
    );
  }

  _set (key, value = !this.state[key], defaultValue) {
    if (!value && defaultValue) {
      value = defaultValue;
    }

    this.props.updateSetting(key, value);
    this.setState({ [key]: value });
  }
};
