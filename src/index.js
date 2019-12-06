import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './audioService'
import ReactSlider from "react-slider";

class Wrapper extends React.Component {
  render() {
    return (
      <div className="wrapper">
        <Toolbar></Toolbar>
      </div>
    )
  }
}


class Toolbar extends React.Component {
  state = {
    audios: [],
  };

  handleOnDropAudio = (droppedAudios) => {
    const {audios} = this.state;
    this.setState({audios: [...audios, ...droppedAudios]})
  };

  render() {
    const {audios} = this.state;

    return (
      <div className="wrapper">
        <div className="toolbar">Drop your mp3 below</div>
        <DropArea onDrop={this.handleOnDropAudio}></DropArea>
        {
          audios.map((audio, index) => {
            return <MediaContainer key={index} audio={audio}></MediaContainer>
          })
        }
      </div>
    )
  }
}


class DropArea extends React.Component {
  constructor(props) {
    super(props);
    this.dropArea = React.createRef();
  }

  componentDidMount() {
    const {onDrop} = this.props;

    function dropEvent(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      onDrop(evt.dataTransfer.files);
      evt.target.style.opacity = "1";
    }

    function dragOver(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      return false;
    }

    this.dropArea.current.addEventListener('drop', dropEvent, false);
    this.dropArea.current.addEventListener('dragover', dragOver, false);
    this.dropArea.current.addEventListener("dragenter", (event) => {
      event.target.style.opacity = "0.5";
    }, false);
  }

  render() {
    return (
      <div>
        <div className="dropArea" ref={this.dropArea}>
          <div>Drop here</div>
        </div>
      </div>
    )
  }

  // componentWillUnmount() {
  //   this.dropArea.current.removeEventListener();
  //   this.dropArea.current.removeEventListener();
  //   this.dropArea.current.removeEventListener();
  // }
}

class MediaContainer extends React.Component {
  state = {
    isPlaying: false,
    currentAudioTime: 0,
    audioDuration: 0,
  }

  componentDidMount() {
    const audioUrl = window.URL.createObjectURL(this.props.audio);
    this.audioRef.src = audioUrl;

    this.audioContext = new AudioContext();
    this.source = this.audioContext.createMediaElementSource(this.audioRef);

    this.audioRef.addEventListener('timeupdate', (e) => {
      this.setState({currentAudioTime: e.target.currentTime})
    });
    this.audioRef.addEventListener('ended', (e) => {
      this.setState({isPlaying: false, currentAudioTime: this.audioRef.duration})
    });
    this.audioRef.addEventListener('durationchange', (e) => {
      this.setState({audioDuration: this.audioRef.duration})
    });

    this.connectAudio();
  }

  get duration() {
    if (!this.audioRef) {
      return '0:00';
    }
    const { currentAudioTime, audioDuration } = this.state;

    const duration = Math.floor(audioDuration);
    const minutes = Math.floor((duration - currentAudioTime) / 60);
    let seconds = Math.floor((duration - currentAudioTime) % 60);

    if (seconds < 10) {
      seconds = '0' + seconds;
    }

    return `${minutes}:${seconds}`;
  }

  connectAudio = () => {
    this.audioGain = this.audioContext.createGain();

    this.highShelf = this.audioContext.createBiquadFilter();
    this.lowShelf = this.audioContext.createBiquadFilter();
    this.highPass = this.audioContext.createBiquadFilter();
    this.lowPass = this.audioContext.createBiquadFilter();

    this.source.connect(this.highShelf);
    this.highShelf.connect(this.lowShelf);
    this.lowShelf.connect(this.highPass);
    this.highPass.connect(this.lowPass);
    this.lowPass.connect(this.audioGain);
    this.audioGain.connect(this.audioContext.destination);

    this.highShelf.type = "highshelf";
    this.highShelf.frequency.value = 4700;
    this.highShelf.gain.value = 0;

    this.lowShelf.type = "lowshelf";
    this.lowShelf.frequency.value = 35;
    this.lowShelf.gain.value = 0;

    this.highPass.type = "highpass";
    this.highPass.frequency.value = 800;
    this.highPass.Q.value = 6;

    this.lowPass.type = "lowpass";
    this.lowPass.frequency.value = 880;
    this.lowPass.Q.value = 6;

    // this.audioGain.connect(this.audioContext.destination);
    // this.source.connect(this.audioContext.destination);
    // this.source.connect(this.audioGain);
  }

  disconnect = () => {
    this.source.stop(0);
    this.source.disconnect(0);
    this.audioGain.disconnect();
  }

  // createAudio = () => {
  //   this.processor = this.contextAudio.createScriptProcessor(2048, 1, 1);
  //   this.analyser = this.contextAudio.createAnalyser();
  //   this.source.connect(this.contextAudio.destination);
  //   this.source.connect(this.analyser);
  //   this.analyser.connect(this.processor);
  //   this.processor.connect(this.contextAudio.destination);
  //   this.setState({audioDuration: Math.floor(this.source.buffer.duration / 60 * 100) / 100});
  // };

  // initAudio = (data) => {
  //   this.source = this.contextAudio.createBufferSource();
  //
  //   if (this.contextAudio.decodeAudioData) {
  //     this.contextAudio.decodeAudioData(data, (buffer) => {
  //       this.source.buffer = buffer;
  //       this.createAudio();
  //     }, (e) => {
  //       console.log(e);
  //     });
  //   } else {
  //     this.source.buffer = this.contextAudio.createBuffer(data, false /*mixToMono*/);
  //     this.createAudio();
  //   }
  // };

  // initialAudioSetInterval = () => {
  //   this.audioSetInterval = setInterval(() => {
  //     this.setState({currentAudioTime: this.source.context.currentTime});
  //   }, 1000);
  // };

  // clearSetInterval = () => {
  //   clearInterval(this.audioSetInterval);
  // };

  playAudio() {
    this.audioRef.play();
  }

  pauseAudio() {
    this.audioRef.pause();
  }

  handleTogglePlay = () => {
    const {isPlaying} = this.state;

    if (!isPlaying) {
      this.playAudio();
    } else {
      this.pauseAudio();
    }

    this.setState({isPlaying: !isPlaying})
  };

  handleAfterSliderChange = (e) => {
    this.setState({ currentAudioTime: e });
    this.audioRef.currentTime = e;
  };

  handleMute = () => {
    const { value } = this.audioGain.gain;

    if (value === 0) {
      this.audioGain.gain.setValueAtTime(1, this.audioRef.currentTime);
    } else {
      this.audioGain.gain.setValueAtTime(0, this.audioRef.currentTime);
    }
  }

  handleMakeDistortionCurve = () => {
    const randomHighShelf = Math.floor(Math.random() * 24000);
    const randomHighPass = Math.floor(Math.random() * 24000);
    const randomLowShelf = Math.floor(Math.random() * 24000);
    const randomLowPass = Math.floor(Math.random() * 24000);
    this.highShelf.frequency.setValueAtTime(randomHighShelf, this.audioRef.currentTime);
    this.highPass.frequency.setValueAtTime(randomHighPass, this.audioRef.currentTime);
    this.lowShelf.frequency.setValueAtTime(randomLowShelf, this.audioRef.currentTime);
    this.lowPass.frequency.setValueAtTime(randomLowPass, this.audioRef.currentTime);
    // debugger;
  }

  handleHighShelfChange = (frequency) => {
    this.highShelf.frequency.setValueAtTime(frequency, this.audioRef.currentTime);
  }

  handleHighPassChange = (frequency) => {
    this.highPass.frequency.setValueAtTime(frequency, this.audioRef.currentTime);
  }

  handleLowShelfChange = (frequency) => {
    this.lowShelf.frequency.setValueAtTime(frequency, this.audioRef.currentTime);
  }

  handleLowPassChange = (frequency) => {
    this.lowPass.frequency.setValueAtTime(frequency, this.audioRef.currentTime);
  }


  render() {
    const {isPlaying, currentAudioTime} = this.state;
    const src = isPlaying ? 'https://www.pngrepo.com/download/176023/music-pause-button-pair-of-lines.png' : 'https://icon-library.net/images/play-icon-svg/play-icon-svg-15.jpg';
    const songSecond = this.audioRef ? this.audioRef.duration : 100;

    return (
      <div>
        <div className="media-wrapper">
          <div>
            <div className="d-flex space-between align-center">

              <ReactSlider
                className="horizontal-slider"
                thumbClassName="example-thumb"
                trackClassName="example-track"
                onChange={this.handleAfterSliderChange}
                max={songSecond}
                value={currentAudioTime}
              />

              <div style={{ margin: '0 10px' }}>{this.duration}</div>

              <div className="media-icon" onClick={this.handleTogglePlay}>
                <img src={src} alt="Icon"/>
              </div>
              <button onClick={this.handleMute}>Mute</button>
            </div>
          </div>

          <audio ref={ref => this.audioRef = ref}/>
        </div>

        <div className="d-flex space-between align-center filters-wrapper">
          <ReactSlider
            className="vertical-slider"
            thumbClassName="vertical-slider-thumb"
            trackClassName="vertical-slider-track"
            orientation="vertical"
            onChange={this.handleHighShelfChange}
            max={24000}
            invert
          />
          <ReactSlider
            className="vertical-slider"
            thumbClassName="vertical-slider-thumb"
            trackClassName="vertical-slider-track"
            orientation="vertical"
            onChange={this.handleHighPassChange}
            max={24000}
            invert
          />
          <ReactSlider
            className="vertical-slider"
            thumbClassName="vertical-slider-thumb"
            trackClassName="vertical-slider-track"
            orientation="vertical"
            onChange={this.handleLowShelfChange}
            max={24000}
            invert
          />
          <ReactSlider
            className="vertical-slider"
            thumbClassName="vertical-slider-thumb"
            trackClassName="vertical-slider-track"
            orientation="vertical"
            onChange={this.handleLowPassChange}
            max={24000}
            invert
          />
        </div>

      </div>
    )
  }
}


ReactDOM.render(
  <Wrapper/>
  , document.getElementById("root"));


