import dataStore from 'nedb-promise';

function validateTeam(team) {
  let teamName = team.name;
  let teamLocation = team.location;
  let numberOfMatches = team.numberOfMatches;
  if (!teamName) {
    //throw new Error('Missing name property')
    console.log(teamName)
  } else if (!teamLocation) {
    throw new Error('Missing location property')
  }
   else if (!numberOfMatches || isNaN(numberOfMatches) || numberOfMatches < 1) {
    throw new Error('Team games played property is missing or invalid')
  }
}

export class TeamStore {
  constructor({ filename, autoload }) {
    this.store = dataStore({ filename, autoload });
  }
  
  async find(props) {
    return this.store.find(props);
  }
  
  async findOne(props) {
    return this.store.findOne(props);
  }
  
  async insert(team) {
    validateTeam(team)
    return this.store.insert(team);
  };

  async update(props, team) {
    return this.store.update(props, team);
  }
  
  async remove(props) {
    return this.store.remove(props);
  }
}

export default new TeamStore({ filename: './db/teams.json', autoload: true });