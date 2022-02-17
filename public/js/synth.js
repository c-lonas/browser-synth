let SynthPad = (function() {
    let myCanvas;
    let frequencyLabel;
    let volumeLabel;

    let myAudioContext;
    let oscillator;
    let gainNode;
    let hpFilter;
    let lpFilter;

    let analyserCanvas;
    let analyser;
    let bufferLength;
    let dataArray;

    let freqCanvas;
    let freqAnalyser;
    let freqBufferLength;
    let freqDataArray;
   

    //Notes
    let lowNote = 261.63;  // C4
    let highNote = 493.88; // B4

    let waveType;

    // Constructor
    let SynthPad = function() {
    myCanvas = document.getElementById('synth-pad');
    frequencyLabel = document.getElementById('frequency');
    volumeLabel = document.getElementById('volume');

    squareBtn = document.getElementsByClassName('sq-btn')[0];
    triangleBtn = document.getElementsByClassName('tri-btn')[0];
    sawBtn = document.getElementsByClassName('saw-btn')[0];
    sineBtn = document.getElementsByClassName('sin-btn')[0];
    waveButtons = document.getElementsByClassName('wave-btn');

    analyserCanvas = document.getElementById("analyser-canvas");
    canvasCtx = analyserCanvas.getContext('2d');
    freqCanvas = document.getElementById("freq-canvas");
    freqCtx = freqCanvas.getContext('2d');


    // Create an audio context.
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    myAudioContext = new window.AudioContext();
  
    SynthPad.setupEventListeners();
  };


  // Event Listeners
  SynthPad.setupEventListeners = function() {
  
    // Disables scrolling on touch devices.
    document.body.addEventListener('touchmove', function(event) {
      event.preventDefault();
    }, false);
  
    myCanvas.addEventListener('mousedown', SynthPad.playSound);
    myCanvas.addEventListener('touchstart', SynthPad.playSound);
  
    myCanvas.addEventListener('mouseup', SynthPad.stopSound);
    document.addEventListener('mouseleave', SynthPad.stopSound);
    myCanvas.addEventListener('touchend', SynthPad.stopSound);

    // Event listeners for buttons
    triangleBtn.addEventListener('click', e => {
        waveType = "triangle";
        for (let i of waveButtons) {
            i.id = "";
        }
        triangleBtn.id = "wave-select";

    });
    squareBtn.addEventListener('click', e => {
        waveType = "square";
        for (let i of waveButtons) {
            i.id = "";
        }
        squareBtn.id = "wave-select";
    });
    sawBtn.addEventListener('click', e => {
        waveType = "sawtooth";
        for (let i of waveButtons) {
            i.id = "";
        }
        sawBtn.id = "wave-select";
    });
    sineBtn.addEventListener('click', e => {
        waveType = "sine";
        for (let i of waveButtons) {
            i.id = "";
        }
        sineBtn.id = "wave-select";
    });
  };

  // Play a note.
  SynthPad.playSound = function(event) {
    oscillator = myAudioContext.createOscillator();
    gainNode = myAudioContext.createGain();
    hpFilter = myAudioContext.createBiquadFilter();
    lpFilter = myAudioContext.createBiquadFilter();
    analyser = myAudioContext.createAnalyser();
    freqAnalyser = myAudioContext.createAnalyser();

    // filter variables
    lpf = document.getElementById('lpf').value;
    hpf = document.getElementById('hpf').value;

    hpFilter.type = "highpass"
    hpFilter.frequency.value = hpf;
    hpFilter.Q.values = 20;
    
    lpFilter.type = "lowpass"
    lpFilter.frequency.value = lpf;
    lpFilter.Q.value = 20;

    // analyzer variables
    analyser.fftSize = 2048;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    freqAnalyser.fftSize = 256;
    freqBufferLength = freqAnalyser.frequencyBinCount;
    freqDataArray = new Uint8Array(freqBufferLength);

    
    // oscillator variable
    oscillator.type = waveType;


    oscillator.connect(analyser);
    oscillator.connect(freqAnalyser);
    freqAnalyser.connect(gainNode);
    analyser.connect(gainNode);
    gainNode.connect(lpFilter);
    lpFilter.connect(hpFilter);
    hpFilter.connect(myAudioContext.destination);


    SynthPad.updateFrequency(event);
    oscillator.start(0);

    SynthPad.drawAnalyser();
    SynthPad.drawFreqAnalyser();

  
    myCanvas.addEventListener('mousemove', SynthPad.updateFrequency);
    myCanvas.addEventListener('touchmove', SynthPad.updateFrequency);
  
    myCanvas.addEventListener('mouseout', SynthPad.stopSound);
  };

  // Stop the audio.
  SynthPad.stopSound = function(event) {
    oscillator.stop(0);
  
    myCanvas.removeEventListener('mousemove', SynthPad.updateFrequency);
    myCanvas.removeEventListener('touchmove', SynthPad.updateFrequency);
    myCanvas.removeEventListener('mouseout', SynthPad.stopSound);
  };

  // Calculate the note frequency.
  SynthPad.calculateNote = function(posX) {
    var noteDifference = highNote - lowNote;
    var noteOffset = (noteDifference / myCanvas.offsetWidth) * (posX - myCanvas.offsetLeft);
    return lowNote + noteOffset;
  };
  
  
  // Calculate the volume.
  SynthPad.calculateVolume = function(posY) {
    var volumeLevel = 1 - (((100 / myCanvas.offsetHeight) * (posY - myCanvas.offsetTop)) / 100);
    return volumeLevel;
  };
  
  
  // Fetch the new frequency and volume.
  SynthPad.calculateFrequency = function(x, y) {
    var noteValue = SynthPad.calculateNote(x);
    var volumeValue = SynthPad.calculateVolume(y);
  
    oscillator.frequency.value = noteValue;
    gainNode.gain.value = volumeValue;
  
    frequencyLabel.innerHTML = Math.floor(noteValue) + ' Hz';
    volumeLabel.innerHTML = Math.floor(volumeValue * 100) + '%';
  };
  
  
  // Update the note frequency.
  SynthPad.updateFrequency = function(event) {
    if (event.type == 'mousedown' || event.type == 'mousemove') {
      SynthPad.calculateFrequency(event.x, event.y);
    } else if (event.type == 'touchstart' || event.type == 'touchmove') {
      var touch = event.touches[0];
      SynthPad.calculateFrequency(touch.pageX, touch.pageY);
    }
  };
           
  SynthPad.drawAnalyser = function() {
    
    canvasCtx.clearRect(0, 0, 600, 200);
    drawVisual = requestAnimationFrame(SynthPad.drawAnalyser);
    analyser.getByteTimeDomainData(dataArray);
    
    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, canvasCtx.width, canvasCtx.height);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    var sliceWidth = 600 * 1.0 / bufferLength;
    var x = 0;

    for(var i = 0; i < bufferLength; i++) {
   
        var v = dataArray[i] / 128.0;
        var y = v * 200/3;

        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      };
    
    canvasCtx.lineTo(600, 200/2);
    canvasCtx.stroke();
  
  };

  SynthPad.drawFreqAnalyser = function() {

    freqCtx.clearRect(0, 0, 600, 200);
    drawSomething = requestAnimationFrame(SynthPad.drawFreqAnalyser);
    freqAnalyser.getByteFrequencyData(freqDataArray);

    freqCtx.fillStyle = "rgb(0, 0, 0)";
    freqCtx.fillRect(0, 0, freqCtx.width, freqCtx.height);

    var barWidth = ((600 / freqBufferLength));
    var barHeight;
    var x = 0

    for(var i = 0; i < freqBufferLength; i++) {
      barHeight = freqDataArray[i] * 1.5;

      freqCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
      freqCtx.fillRect(x, 200 - barHeight / 2, barWidth, barHeight);

      x += barWidth + 1;
    }

  };

  // Export SynthPad
  return SynthPad;
    

})();

window.onload = function() {
    let synthPad = new SynthPad();
};
