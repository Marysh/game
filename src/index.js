import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './audioService'
import {Howl, Howler} from 'howler';

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

  componentDidMount() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.reader = new FileReader();
    let self = this;

    this.reader.onload = function () {
      let arrayBuffer = this.result;
      self.initAudio(arrayBuffer);
    };

    this.reader.readAsArrayBuffer(this.props.audio);

    //
    // function createAudio() {
    //   this.processor = this.context.createScriptProcessor(2048, 1, 1);
    //
    //   this.analyser = this.context.createAnalyser();
    //
    //   this.source.connect(this.context.destination);
    //   this.source.connect(this.analyser);
    //
    //   this.analyser.connect(this.processor);
    //   this.processor.connect(this.context.destination);
    //
    //   this.source.start(0);
    //   setTimeout(disconnect, this.source.buffer.duration * 1000 + 1000);
    // }
    //
    // function disconnect() {
    //   this.source.stop(0);
    //   this.source.disconnect(0);
    //   this.processor.disconnect(0);
    //   this.analyser.disconnect(0);
    // }
  }

  disconnect = () => {
    this.source.stop(0);
    this.source.disconnect(0);
    this.processor.disconnect(0);
    this.analyser.disconnect(0);
  }

  createAudio = () => {
    this.processor = this.context.createScriptProcessor(2048, 1, 1);
    this.analyser = this.context.createAnalyser();
    this.source.connect(this.context.destination);
    this.source.connect(this.analyser);
    this.analyser.connect(this.processor);
    this.processor.connect(this.context.destination);
    // this.source.start();
    // this.source.context.suspend();
    // setTimeout(this.disconnect, this.source.buffer.duration * 1000 + 1000);
  }

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
  }

  playAudio() {
    // todo
    // if (this.source.context.state === "running") {
    //   this.source.resume();
    // } else {
    //   this.source.start();
    // }
  }

  pauseAudio() {
    this.source.context.suspend();
  }

  render() {
    return (
      <div>
        <div className="media-wrapper">
          <div>{this.props.audio.name}</div>
          <div className="d-flex">
            <div className="media-icon" onClick={this.playAudio}>
              <img src="https://icon-library.net/images/play-icon-svg/play-icon-svg-15.jpg" alt="play"/>
            </div>
            <div className="media-icon" onClick={this.pauseAudio}>
              <img src="https://www.pngrepo.com/download/176023/music-pause-button-pair-of-lines.png" alt="pause"/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}


ReactDOM.render(<Wrapper/>, document.getElementById("root"));


