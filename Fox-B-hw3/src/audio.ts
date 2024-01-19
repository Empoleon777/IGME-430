// 1 - our WebAudio context, **we will export and make this public at the bottom of the file**
let audioCtx: AudioContext;

// **These are "private" properties - these will NOT be visible outside of this module (i.e. file)**
// 2 - WebAudio nodes that are part of our WebAudio audio routing graph
let element: HTMLAudioElement, sourceNode: MediaElementAudioSourceNode, analyserNode: AnalyserNode, gainNode;

// 3 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
    gain: 0.5,
    numSamples: 256
});

// 4 - create a new array of 8-bit integers (0-255)
// this is a typed array to hold the audio frequency data
let audioData = new Uint8Array(DEFAULTS.numSamples / 2);

let biquadFilter: BiquadFilterNode;
let lowShelfBiquadFilter: BiquadFilterNode;
let allpassFilter: BiquadFilterNode;
let bandpassFilter: BiquadFilterNode;
let peakingFilter: BiquadFilterNode;

let highshelf = false;
let lowshelf = false;
let allpass = false;
let bandpass = false;
let peaking = false;
let distortion = false;


let distortionFilter: WaveShaperNode;

// **Next are "public" methods - we are going to export all of these at the bottom of this file**
const setupWebaudio = (filePath: string): void => {
    // 1 - The || is because WebAudio has not been standardized across browsers yet
    const AudioContext = window.AudioContext;
    audioCtx = new AudioContext();

    // 2 - this creates an <audio> element
    element = document.querySelector("audio");

    // 3 - have it point at a sound file
    loadSoundFile(filePath);

    // 4 - create an a source node that points at the <audio> element
    sourceNode = audioCtx.createMediaElementSource(element);

    // 5 - create an analyser node
    // note the UK spelling of "Analyser"
    analyserNode = audioCtx.createAnalyser();

    /*
    // 6
    We will request DEFAULTS.numSamples number of samples or "bins" spaced equally 
    across the sound spectrum.
    
    If DEFAULTS.numSamples (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz, 
    the third is 344Hz, and so on. Each bin contains a number between 0-255 representing 
    the amplitude of that frequency.
    */

    // fft stands for Fast Fourier Transform
    analyserNode.fftSize = DEFAULTS.numSamples;

    // 7 - create a gain (volume) node
    gainNode = audioCtx.createGain();
    gainNode.gain.value = DEFAULTS.gain;

    // 8 - connect the nodes - we now have an audio graph
    sourceNode.connect(analyserNode);
    analyserNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    biquadFilter = audioCtx.createBiquadFilter();
    biquadFilter.type = "highshelf";

    sourceNode.connect(biquadFilter);
    biquadFilter.connect(analyserNode);

    lowShelfBiquadFilter = audioCtx.createBiquadFilter();
    lowShelfBiquadFilter.type = "lowshelf";

    sourceNode.connect(lowShelfBiquadFilter);
    lowShelfBiquadFilter.connect(analyserNode);

    allpassFilter = audioCtx.createBiquadFilter();
    allpassFilter.type = "allpass";

    sourceNode.connect(allpassFilter);
    allpassFilter.connect(analyserNode);

    bandpassFilter = audioCtx.createBiquadFilter();
    bandpassFilter.type = "bandpass";

    sourceNode.connect(bandpassFilter);
    bandpassFilter.connect(analyserNode);

    peakingFilter = audioCtx.createBiquadFilter();
    peakingFilter.type = "peaking";

    sourceNode.connect(peakingFilter);
    peakingFilter.connect(analyserNode);

    distortionFilter = audioCtx.createWaveShaper()

    sourceNode.connect(distortionFilter);
    distortionFilter.connect(analyserNode);
}

let distortionAmount: number = 20;

const loadSoundFile = (filePath: string): void => {
    element.src = filePath;
}

// const playCurrentSound = () => {
//     element.play();
// }

// const pauseCurrentSound = () => {
//     element.pause();
// }

// const setVolume = (value) => {
//     value = Number(value); // make sure that it's a Number rather than a String
//     gainNode.gain.value = value;
// }

const toggleHighshelf = (box: HTMLInputElement): void => {
    highshelf = box.checked;

    if (highshelf) {
        biquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime); // we created the `biquadFilter` (i.e. "treble") node last time
        biquadFilter.gain.setValueAtTime(25, audioCtx.currentTime);
    } else {
        biquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
}

const toggleLowshelf = (box: HTMLInputElement): void => {
    lowshelf = box.checked;

    if (lowshelf) {
        lowShelfBiquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        lowShelfBiquadFilter.gain.setValueAtTime(15, audioCtx.currentTime);
    } else {
        lowShelfBiquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
}

const toggleAllpass = (box: HTMLInputElement): void => {
    allpass = box.checked;

    if (allpass) {
        allpassFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        allpassFilter.gain.setValueAtTime(15, audioCtx.currentTime);
    } else {
        allpassFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
}

const toggleBandpass = (box: HTMLInputElement): void => {
    bandpass = box.checked;

    if (bandpass) {
        bandpassFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        bandpassFilter.gain.setValueAtTime(15, audioCtx.currentTime);
    } else {
        bandpassFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
}

const togglePeaking = (box: HTMLInputElement): void => {
    peaking = box.checked;

    if (peaking) {
        peakingFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        peakingFilter.gain.setValueAtTime(15, audioCtx.currentTime);
    } else {
        peakingFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
}

const toggleDistortion = (box: HTMLInputElement): void => {
    distortion = box.checked;

    if (distortion) {
        distortionFilter.curve = null; // being paranoid and trying to trigger garbage collection
        distortionFilter.curve = makeDistortionCurve(distortionAmount);
    } else {
        distortionFilter.curve = null;
    }
}

// from: https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode
const makeDistortionCurve = (amount: number = 20): Float32Array => {
    let n_samples = 256, curve = new Float32Array(n_samples);
    for (let i = 0; i < n_samples; ++i) {
        let x = i * 2 / n_samples - 1;
        curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
    }
    return curve;
}

const changeDistortionValue = (value: number): void => {
    distortionAmount = value;
}


// Function to identify peaks
const getPeaksAtThreshold = (data: Array<number>, threshold: number): Array<number> => {
    let peaksArray = [];
    let length = data.length;
    for (let i = 0; i < length;) {
        if (data[i] > threshold) {
            peaksArray.push(i);
            // Skip forward ~ 1/4s to get past this peak.
            i += 10000;
        }
        i++;
    }
    return peaksArray;
}

const countIntervalsBetweenNearbyPeaks = (peaks: Array<number>): { interval: number; count: number }[] => {
    let intervalCounts = [];
    peaks.forEach(function (peak, index) {
        for (let i = 0; i < 10; i++) {
            let interval = peaks[index + i] - peak;
            let foundInterval = intervalCounts.some(function (intervalCount) {
                if (intervalCount.interval === interval)
                    return intervalCount.count++;
            });
            if (!foundInterval) {
                intervalCounts.push({
                    interval: interval,
                    count: 1
                });
            }
        }
    });
    return intervalCounts;
}

// Function used to return a histogram of tempo candidates.
const groupNeighborsByTempo = (intervalCounts: { interval: number; count: number }[]): void => {
    let tempoCounts = []
    intervalCounts.forEach(function (intervalCount, i) {
        // Convert an interval to tempo
        let theoreticalTempo = 60 / (intervalCount.interval / 44100);

        // Adjust the tempo to fit within the 90-180 BPM range
        while (theoreticalTempo < 90) theoreticalTempo *= 2;
        while (theoreticalTempo > 180) theoreticalTempo /= 2;

        let foundTempo = tempoCounts.some(function (tempoCount) {
            if (tempoCount.tempo === theoreticalTempo)
                return tempoCount.count += intervalCount.count;
        });
        if (!foundTempo) {
            tempoCounts.push({
                tempo: theoreticalTempo,
                count: intervalCount.count
            });
        }
    });
}

export { audioCtx, setupWebaudio, loadSoundFile, toggleHighshelf, toggleLowshelf, toggleAllpass, toggleBandpass, togglePeaking, toggleDistortion, makeDistortionCurve, changeDistortionValue, analyserNode, highshelf, lowshelf, allpass, bandpass, peaking, distortion, distortionAmount, getPeaksAtThreshold, countIntervalsBetweenNearbyPeaks, groupNeighborsByTempo };