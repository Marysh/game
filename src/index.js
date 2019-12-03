import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './audioService'

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
  constructor(props) {
    super(props);
    this.playAudio = this.playAudio.bind(this);
    this.pauseAudio = this.pauseAudio.bind(this);
  }

  state = {
    isPlaying: false,
  }

  componentDidMount() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.reader = new FileReader();
    let self = this;
    this.startcount = 0;
    this.isPlaying = false;

    this.reader.onload = function () {
      let arrayBuffer = this.result;
      self.initAudio(arrayBuffer);
    };

    this.reader.readAsArrayBuffer(this.props.audio);
  }


  disconnect = () => {
    this.source.stop(0);
    this.source.disconnect(0);
    this.processor.disconnect(0);
    this.analyser.disconnect(0);
  };


  createAudio = () => {
    this.processor = this.context.createScriptProcessor(2048, 1, 1);
    this.analyser = this.context.createAnalyser();
    this.source.connect(this.context.destination);
    this.source.connect(this.analyser);
    this.analyser.connect(this.processor);
    this.processor.connect(this.context.destination);
    this.time = this.source.buffer.duration / 60;
    console.log(this.time);
  };

  initAudio = (data) => {
    this.source = this.context.createBufferSource();

    if (this.context.decodeAudioData) {
      this.context.decodeAudioData(data, (buffer) => {
        this.source.buffer = buffer;
        this.createAudio();
      }, (e) => {
        console.log(e);
      });
    } else {
      this.source.buffer = this.context.createBuffer(data, false /*mixToMono*/);
      this.createAudio();
    }
  };

  playAudio() {
    if (this.startcount === 0) {
      this.source.start();
      this.startcount++;
    } else {
      this.source.context.resume();
      console.log(Math.floor((this.source.buffer.duration - this.source.context.currentTime) / 60 * 100) / 100);
    }
  }

  pauseAudio() {
    this.source.context.suspend();
  }

  togglePlay = () => {
    // if (this.isPlaying === false) {
    //   // this.playAudio();
    //   this.isPlaying = true;
    //   console.log(this.isPlaying);
    // } else {
    //   // this.pauseAudio();
    //   this.isPlaying = false;
    //   console.log(this.isPlaying);
    // }
    const {isPlaying} = this.state;

    if (!isPlaying) {
      this.playAudio();
    } else {
      this.pauseAudio();
    }

    this.setState({isPlaying: !isPlaying})
  };

  render() {
    const {isPlaying} = this.state;
    const src = isPlaying ? 'https://www.pngrepo.com/download/176023/music-pause-button-pair-of-lines.png' : 'https://icon-library.net/images/play-icon-svg/play-icon-svg-15.jpg';

    return (
      <div>
        <div className="media-wrapper">
          <div>{this.props.audio.name}</div>
          <div className="d-flex">
            <div className="media-icon" onClick={this.togglePlay}>
              <img src={src} alt="play"/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}


ReactDOM.render(<Wrapper/>, document.getElementById("root"));


