import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './audioService'
import ReactSlider from "react-slider";
import Equalizer from "./accordeon";


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

  dropEvent = (evt) => {
    const {onDrop} = this.props;

    evt.stopPropagation();
    evt.preventDefault();
    onDrop(evt.dataTransfer.files);
    evt.target.style.opacity = "1";
  }

  dragOver = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    return false;
  }

  dragEnter = (event) => {
    event.target.style.opacity = "0.5";
  }

  componentDidMount() {
    this.dropArea.current.addEventListener('drop', this.dropEvent, false);
    this.dropArea.current.addEventListener('dragover', this.dragOver, false);
    this.dropArea.current.addEventListener("dragenter", this.dragEnter, false);
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

  componentWillUnmount() {
    this.dropArea.current.removeEventListener('drop', this.dropEvent, false);
    this.dropArea.current.removeEventListener('dragover', this.dragOver, false);
    this.dropArea.current.removeEventListener("dragenter", this.dragEnter, false);
  }
}

class MediaContainer extends React.Component {
  state = {
    isPlaying: false,
    currentAudioTime: 0,
    audioDuration: 0,
  };


  componentDidMount() {
    const audioUrl = window.URL.createObjectURL(this.props.audio);
    this.audioRef.src = audioUrl;

    this.audioContext = new AudioContext();
    this.source = this.audioContext.createMediaElementSource(this.audioRef);

    this.audioRef.addEventListener('timeupdate', this.setCurrentTime);
    this.audioRef.addEventListener('ended', this.onAudioEnd);
    this.audioRef.addEventListener('durationchange', this.changeAudioDuration);

    this.connectAudio();
  }

  setCurrentTime = (e) => {
    this.setState({currentAudioTime: e.target.currentTime})
  };

  onAudioEnd = (e) => {
    this.setState({isPlaying: false, currentAudioTime: this.audioRef.duration})
  };

  changeAudioDuration = () => {
    this.setState({audioDuration: this.audioRef.duration})
  };

  get duration() {
    if (!this.audioRef) {
      return '0:00';
    }
    const {currentAudioTime, audioDuration} = this.state;

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
    this.analyser = this.audioContext.createAnalyser();

    this.source.connect(this.analyser);
    this.analyser.connect(this.highShelf);
    this.highShelf.connect(this.lowShelf);
    this.lowShelf.connect(this.highPass);
    this.highPass.connect(this.lowPass);
    this.lowPass.connect(this.audioGain);
    this.audioGain.connect(this.audioContext.destination);

    this.highShelf.type = "highshelf";
    this.highShelf.frequency.value = 4700;
    this.highShelf.gain.value = -50;

    this.lowShelf.type = "lowshelf";
    this.lowShelf.frequency.value = 35;
    this.lowShelf.gain.value = -50;

    this.highPass.type = "highpass";
    this.highPass.frequency.value = 800;
    this.highPass.Q.value = 0.7;

    this.lowPass.type = "lowpass";
    this.lowPass.frequency.value = 880;
    this.lowPass.Q.value = 0.7;

    this.audioGain.gain.value = 0.5;
    this.renderAudioVisualization()
  };

  renderAudioVisualization = () => {
    let bufferLength = this.analyser.frequencyBinCount;

    let dataArray = new Uint8Array(bufferLength);

    let WIDTH = this.canvasRef.width;
    let HEIGHT = this.canvasRef.height;
    let ctx = this.canvasRef.getContext("2d");

    let barWidth = (WIDTH / bufferLength) * 10;
    let barHeight;
    let x = 0;


    const renderFrame = () => {
      requestAnimationFrame(renderFrame);

      x = 0;

      this.analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#999999";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        let r = barHeight + (25 * (i / bufferLength));
        let g = 150 * (i / bufferLength);
        let b = 50;

        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
      }
    };

    renderFrame();
  };

  disconnect = () => {
    this.source.stop(0);
    this.source.disconnect(0);
    this.audioGain.disconnect();
    this.audioRef.removeEventListener('timeupdate', this.setCurrentTime);
    this.audioRef.removeEventListener('ended', this.onAudioEnd);
    this.audioRef.removeEventListener('durationchange', this.changeAudioDuration);
  };

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

  handleDurationChange = (e) => {
    this.setState({currentAudioTime: e});
    this.audioRef.currentTime = e;
  };

  handleVolumeChange = (e) => {
    this.audioGain.gain.setValueAtTime(e, this.audioRef.currentTime);
  };

  handleHighShelfChange = (frequency) => {
    this.highShelf.frequency.setValueAtTime(frequency, this.audioRef.currentTime);
  };

  handleHighPassChange = (frequency) => {
    this.highPass.frequency.setValueAtTime(frequency, this.audioRef.currentTime);
  };

  handleLowShelfChange = (frequency) => {
    this.lowShelf.frequency.setValueAtTime(frequency, this.audioRef.currentTime);
  };

  handleLowPassChange = (frequency) => {
    this.lowPass.frequency.setValueAtTime(frequency, this.audioRef.currentTime);
  };

  handleHighShelfGain = (gain) => {
    this.highShelf.gain.setValueAtTime(gain, this.audioRef.currentTime);
  };

  handleLowShelfGain = (gain) => {
    this.lowShelf.gain.setValueAtTime(gain, this.audioRef.currentTime);
  };

  handleHighPassQ = (q) => {
    this.highPass.Q.setValueAtTime(q, this.audioRef.currentTime);
  };

  handleLowPassQ = (q) => {
    this.lowPass.Q.setValueAtTime(q, this.audioRef.currentTime);
  };

  componentWillUnmount() {
    this.disconnect();
  }


  render() {
    const {isPlaying, currentAudioTime} = this.state;
    const src = isPlaying ? 'https://www.pngrepo.com/download/176023/music-pause-button-pair-of-lines.png' : 'https://icon-library.net/images/play-icon-svg/play-icon-svg-15.jpg';
    const songSecond = this.audioRef ? this.audioRef.duration : 100;

    return (
      <div className="media-item">
        <div className="media-wrapper">
          <div>
            <div className="d-flex space-between align-center">

              <ReactSlider
                className="horizontal-slider"
                thumbClassName="example-thumb"
                trackClassName="example-track"
                onChange={this.handleDurationChange}
                max={songSecond}
                value={currentAudioTime}
              />

              <div style={{margin: '0 10px'}}>{this.duration}</div>

              <div className="media-icon" onClick={this.handleTogglePlay}>
                <img src={src} alt="Icon"/>
              </div>
              <ReactSlider
                className="volume-slider"
                thumbClassName="volume-thumb"
                trackClassName="volume-track"
                onChange={this.handleVolumeChange}
                max={1}
                step={0.01}
                defaultValue={0.5}
              />
            </div>
          </div>
          <audio ref={ref => this.audioRef = ref}/>
        </div>

        <canvas ref={ref => this.canvasRef = ref}/>

        <Equalizer
          onHighShelfChange={this.handleHighShelfChange}
          onHighShelfGain={this.handleHighShelfGain}
          onHighPassChange={this.handleHighPassChange}
          onLowShelfGain={this.handleLowShelfGain}
          onLowShelfChange={this.handleLowShelfChange}
          onHighPassQ={this.handleHighPassQ}
          onLowPassChange={this.handleLowPassChange}
          onLowPassQ={this.handleLowPassQ}
        />

      </div>
    )
  }
}


ReactDOM.render(
  <Wrapper/>
  , document.getElementById("root"));


