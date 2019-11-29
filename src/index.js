import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

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
  render() {
    return (
      <div className="wrapper">
        <div className="toolbar">Drop your mp3 below</div>
        <DropArea></DropArea>
        <MediaContainer></MediaContainer>
      </div>
    )
  }
}


class MediaContainer extends React.Component {
  render() {
    return (
      <div>
        {/*add map method to service[]*/}
        <div className="media-wrapper">
          <div>audio.name</div>
          <div className="d-flex">
            <button className="media-icon">
              {/*<img src="https://icon-library.net/images/play-icon-svg/play-icon-svg-15.jpg" alt="play"/>*/}
            </button>
            <button className="media-icon">
              {/*<img src="https://www.pngrepo.com/download/176023/music-pause-button-pair-of-lines.png" alt="pause"/>*/}
            </button>
          </div>
        </div>
      </div>
    )
  }
}


class DropArea extends React.Component {
  componentDidMount() {
    document.addEventListener("dragenter", (event) => {
      if (event.target.id === "dropArea") {
        event.target.style.opacity = "0.5";
      }

    }, false);


    document.addEventListener("drop", function (event) {
      event.preventDefault();
      if (event.target.className === "dropArea") {
        event.target.style.opacity = "1";
        event.target.parentNode.removeChild(event.target);
        event.target.appendChild(event.target);
      }

    }, false);


    let context = new (window.AudioContext || window.webkitAudioContext)();
    let source;
    let processor;
    let analyser;
    let xhr;

    function initAudio(data) {
      source = context.createBufferSource();

      if (context.decodeAudioData) {
        context.decodeAudioData(data, function (buffer) {
          source.buffer = buffer;
          createAudio();
        }, function (e) {
          console.log(e);
        });
      } else {
        source.buffer = context.createBuffer(data, false /*mixToMono*/);
        createAudio();
      }


    }

    function createAudio() {
      processor = context.createScriptProcessor(2048 /*bufferSize*/, 1 /*num inputs*/, 1 /*num outputs*/);

      analyser = context.createAnalyser();

      source.connect(context.destination);
      source.connect(analyser);

      analyser.connect(processor);
      processor.connect(context.destination);

      source.start(0);
      setTimeout(disconnect, source.buffer.duration * 1000 + 1000);
    }

    function disconnect() {
      source.stop(0);
      source.disconnect(0);
      processor.disconnect(0);
      analyser.disconnect(0);
    }

    function dropEvent(evt) {
      evt.stopPropagation();
      evt.preventDefault();

      let droppedFiles = evt.dataTransfer.files;


      // let formData = new FormData();
      //
      // for (let i = 0; i < droppedFiles.length; ++i) {
      //   let file = droppedFiles[i];
      //
      //   files.append(file.name, file);
      // }
      //
      // xhr = new XMLHttpRequest();
      // xhr.open("POST", settings.url);
      // xhr.onreadystatechange = handleResult;
      // xhr.send(formData);


      let reader = new FileReader();

      reader.onload = function (fileEvent) {
        let data = fileEvent.target.result;
        initAudio(data);
      };

      reader.readAsArrayBuffer(droppedFiles[0]);
    }

    // function handleResult() {
    //     if (xhr.readyState == 4 /* complete */) {
    //         switch (xhr.status) {
    //             case 200: /* Success */
    //                 initAudio(request.response);
    //                 break;
    //             default:
    //                 break;
    //         }
    //         xhr = null;
    //     }
    // }

    function dragOver(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      return false;
    }

    let dropArea = document.getElementById('dropArea');
    dropArea.addEventListener('drop', dropEvent, false);
    dropArea.addEventListener('dragover', dragOver, false);

  }

  render() {
    return (
      <div>
        <div id="dropArea">
          <div>Drop here</div>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<Wrapper/>, document.getElementById("root"));


