let SynthPad = (function() {
    let myCanvas;
    let frequencyLabel;
    let volumeLabel;

    let myAudioContext;
    let oscillator;
    let gainNode;
    let panNode;
    let hpFilter;
    let lpFilter;

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
    panNode = myAudioContext.createPanner();
    gainNode = myAudioContext.createGain();
    hpFilter = myAudioContext.createBiquadFilter();
    lpFilter = myAudioContext.createBiquadFilter();

    
    // filter variables
    lpf = document.getElementById('lpf').value;
    hpf = document.getElementById('hpf').value;

    hpFilter.type = "highpass"
    hpFilter.frequency.value = hpf;
    console.log("hpf: " + hpf)
    
    lpFilter.type = "lowpass"
    lpFilter.frequency.value = lpf;
    console.log("lpf: " + lpf)
    
    //panner variables
    
    //delay variables

    // oscillator variables
    oscillator.type = waveType;
  
    gainNode.connect(myAudioContext.destination);
    hpFilter.connect(gainNode);
    lpFilter.connect(hpFilter);
    panNode.connect(hpFilter);
    oscillator.connect(lpFilter);
  
    SynthPad.updateFrequency(event);
  
    oscillator.start(0);
  
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


  // Export SynthPad
  return SynthPad;
    

})();

window.onload = function() {
    let synthPad = new SynthPad();
};
