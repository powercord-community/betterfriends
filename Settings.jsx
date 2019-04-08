const { React } = require('powercord/webpack');
const { getModule } = require('powercord/webpack');
const { getRelationships } = getModule([ 'getRelationships' ]);
const { getUser } = getModule([ 'getUser' ]);

module.exports = class Settings extends React.Component {
  constructor (props) {
    super(props);

    const get = props.settings.get.bind(props.settings);
    this.plugin = powercord.pluginManager.get('betterfriends');

    this.state = {
      favfriends: get('favfriends', [])
    };
  }

  render () {
    return (
      <div>
        {() => {
          const relationships = getRelationships();
          Object.keys(relationships.filter(relation => relationships[relation] === 1)).map((em) => {
            const user = getUser(em);
            return (<button type="button" class={`bf-friends-container pc-grow pc-button ${this.state.favfriends.find(a => a === em) ? 'bf-friend-selected' : ''}`} onClick={(e) => {
              let { target } = e;
              const callNewTarget = () => {
                target = target.parentNode;
                if (![ ...target.classList ].includes('bf-friends-container')) {
                  callNewTarget();
                }
              };
              if (![ ...target.classList ].includes('bf-friends-container')) {
                callNewTarget();
              }

              if (![ ...target.classList ].includes('bf-friend-selected')) {
                target.classList.add('bf-friend-selected');
                this.state.favfriends.push(em);
                this._set('favfriends', this.state.favfriends);
              } else {
                target.classList.remove('bf-friend-selected');
                this._set('favfriends', this.state.favfriends.filter(a => a !== em));
              }
              this.plugin.reload('friends');
            }}>
              <div class='bf-friend-content'>
                <img class='bf-friend' src={!user.avatar ? `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png` : `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}></img>
                <h1 class='bf-friend-name'>{user.username}</h1>
                <h2 class='bf-friend-discrim'>{user.discriminator}</h2>
              </div>
            </button>);
          });
        }
        }
      </div>
    );
  }

  _set (key, value = !this.state[key], defaultValue) {
    if (!value && defaultValue) {
      value = defaultValue;
    }

    this.props.settings.set(key, value);
    this.setState({ [key]: value });
  }
};
