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
  // constructor(props) {
  //   super(props);
  //   this.playAudio = this.playAudio.bind(this);
  //   this.pauseAudio = this.pauseAudio.bind(this);
  //   this.audio = React.createRef();
  // }

  state = {
    isPlaying: false,
    currentAudioTime: 0,
    audioDuration: 0,
  };

  componentDidMount() {
    // this.contextAudio = new (window.AudioContext || window.webkitAudioContext)();
    // this.reader = new FileReader();
    // let self = this;
    // this.startcount = 0;
    //
    // this.reader.onload = function () {
    //   let arrayBuffer = this.result;
    //   self.initAudio(arrayBuffer);
    // };
    //
    // this.reader.readAsArrayBuffer(this.props.audio);

    const audioUrl = window.URL.createObjectURL(this.props.audio);
    this.audioRef.src = audioUrl;
    this.audioRef.addEventListener('timeupdate', (e) => {
      this.setState({currentAudioTime: e.target.currentTime})
    });
    this.audioRef.addEventListener('ended', (e) => {
      this.setState({isPlaying: false, currentAudioTime: this.audioRef.duration})
    });
    this.audioRef.addEventListener('durationchange', (e) => {
      this.setState({audioDuration: this.audioRef.duration})
    });
  }


  disconnect = () => {
    this.source.stop(0);
    this.source.disconnect(0);
    this.processor.disconnect(0);
    this.analyser.disconnect(0);
  };


  createAudio = () => {
    this.processor = this.contextAudio.createScriptProcessor(2048, 1, 1);
    this.analyser = this.contextAudio.createAnalyser();
    this.source.connect(this.contextAudio.destination);
    this.source.connect(this.analyser);
    this.analyser.connect(this.processor);
    this.processor.connect(this.contextAudio.destination);
    this.setState({audioDuration: Math.floor(this.source.buffer.duration / 60 * 100) / 100});
    // let mediaSourceNode = this.contextAudio.createMediaElementSource(this.audio);
    // mediaSourceNode.connect(this.contextAudio.destination);
  };

  initAudio = (data) => {
    this.source = this.contextAudio.createBufferSource();

    if (this.contextAudio.decodeAudioData) {
      this.contextAudio.decodeAudioData(data, (buffer) => {
        this.source.buffer = buffer;
        this.createAudio();
      }, (e) => {
        console.log(e);
      });
    } else {
      this.source.buffer = this.contextAudio.createBuffer(data, false /*mixToMono*/);
      this.createAudio();
    }
  };

  initialAudioSetInterval = () => {
    this.audioSetInterval = setInterval(() => {
      this.setState({currentAudioTime: this.source.context.currentTime});
    }, 1000);
  };

  clearSetInterval = () => {
    clearInterval(this.audioSetInterval);
  };

  playAudio() {
    // if (this.startcount === 0) {
    //   this.source.start();
    //   this.startcount++;
    //   this.initialAudioSetInterval();
    // } else {
    //   this.source.context.resume();
    //   this.initialAudioSetInterval();
    // }
    this.audioRef.play();
  }

  pauseAudio() {
    // this.source.context.suspend();
    // this.clearSetInterval();
    // clearInterval(this.audioDurationInterval)
    this.audioRef.pause();
  }


  togglePlay = () => {
    const {isPlaying} = this.state;

    if (!isPlaying) {
      this.playAudio();
    } else {
      this.pauseAudio();
    }

    this.setState({isPlaying: !isPlaying})
  };

  get audioTimePercentage() {
    const {currentAudioTime} = this.state;
    return Math.floor((100 * currentAudioTime / this.source.buffer.duration));
  }

  get duration() {
    if (!this.audioRef) {
      return '0:00';
    }
    const {currentAudioTime, audioDuration} = this.state;
    // const duration = Math.floor(this.source.buffer.duration);
    const duration = Math.floor(audioDuration);
    const minutes = Math.floor((duration - currentAudioTime) / 60);
    let seconds = Math.floor((duration - currentAudioTime) % 60);
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return `${minutes}:${seconds}`;

    // return ((duration - currentAudioTime) / 60).toFixed(2);
  }

  handleAfterSliderChange = (e) => {
    this.setState({ currentAudioTime: e });
    this.audioRef.currentTime = e;
  };

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
              <div style={{margin: '0 10px'}}>{this.duration}</div>
              <div className="media-icon" onClick={this.togglePlay}>
                <img src={src} alt="Icon"/>
              </div>
            </div>

          </div>
          <audio ref={ref => this.audioRef = ref}/>
        </div>
      </div>
    )
  }
}


ReactDOM.render(
  <Wrapper/>
  , document.getElementById("root"));


