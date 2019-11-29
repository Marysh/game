import {Service} from 'react-services-injector';

class AudioService extends Service {
  constructor() {
    super();
    this.changeNumber();
  }

  changeNumber() {
    this.randomNumber = Math.random();
  }

  get number() {
    //we can store pure data and format it in getters
    return Math.floor(this.randomNumber * 100);
  }
}

AudioService.publicName = 'AudioService';

export default AudioService;
