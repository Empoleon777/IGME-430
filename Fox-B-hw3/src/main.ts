/*
    main is primarily responsible for hooking up the UI to the rest of the application 
    and setting up the main event loop
*/

import * as audio from './audio';
import * as canvas from './canvas';

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as utils from './utils';

let canvasModule: typeof canvas = canvas;

const drawParams = {
    showBars: true,
    showWave: false,
    showCircles: true,
    showOgerpon: true,
    showInvert: false,
    showEmboss: false,
    showBackgroundCircles: true,
    randomizeBackgroundCircles: true
}

let lastTime: number;
let currTime: number;
let deltaTime: number;
let playing: boolean;

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
    sound1: "media/New Adventure Theme.mp3"
});

const init = (): void => {
    audio.setupWebaudio(DEFAULTS.sound1);
    console.log("init called");
    console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
    let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
    setupUI(canvasElement);
    canvasModule.setupCanvas(canvasElement, audio.analyserNode);
    for (let i = 0; i < canvasModule.audioData.length; i++) {
        canvasModule.circleList.push(new canvasModule.movingCircle(canvasModule.ctx, drawParams.showBackgroundCircles, canvasModule.audioData[i]));
    }
    lastTime = performance.now();
    loop();
}

const setupUI = (canvasElement: HTMLCanvasElement): void => {
    // A - hookup fullscreen button
    const fsButton = document.querySelector("#fs-button") as HTMLButtonElement;

    // add .onclick event to button
    fsButton.onclick = e => {
        console.log("goFullscreen() called");
        utils.goFullscreen(canvasElement);
    };

    // Hook up the play button.
    // const playButton = document.querySelector("#play-button");

    // // add .onclick event to button
    // playButton.onclick = e => {
    //     console.log(`audioCtx.state before = ${audio.audioCtx.state}`);

    //     // check if context is in suspended state (autoplay policy)
    //     if (audio.audioCtx.state == "suspended") {
    //         audio.audioCtx.resume();
    //     }
    //     console.log(`audioCtx.state after = ${audio.audioCtx.state}`);
    //     if (e.target.dataset.playing == "no") {
    //         // If the track is paused, play it.
    //         audio.playCurrentSound();
    //         e.target.dataset.playing = "yes"; // Our CSS sets the text to "Pause."
    //     }
    //     else {
    //         audio.pauseCurrentSound();
    //         e.target.dataset.playing = "no"; // Our CSS sets the text to "Pause."
    //     }

    //     playing = e.target.dataset.playing;
    // };

    // // C - Hookup volume slider & label
    // let volumeSlider = document.querySelector("#volume-slider");
    // let volumeLabel = document.querySelector("#volume-label");

    // // Add .oninput event to slider.
    // volumeSlider.oninput = e => {
    //     // Set the gain
    //     audio.setVolume(e.target.value);
    //     // Update value of label to match value of slider
    //     volumeLabel.innerHTML = Math.round((e.target.value / 2 * 100));
    // };

    // volumeSlider.dispatchEvent(new Event("input"));

    // D - Hookup track <select>
    let trackSelect = document.querySelector("#track-select") as HTMLSelectElement;
    loadJSONData(trackSelect);

    let audioControls = document.querySelector("audio") as HTMLAudioElement;

    // add .onchange event to <select>
    trackSelect.onchange = e => {
        const target = e.target as HTMLSelectElement;
        audio.loadSoundFile(target.value);
        audioControls.src = trackSelect.value;
    }

    audioControls.src = "media/New Adventure Theme.mp3";

    audioControls.onplay = (e) => {
        if (audio.audioCtx.state == "suspended") {
            audio.audioCtx.resume();
        }

        playing = true;
    };

    audioControls.onpause = (e) => {
        playing = false
    }

    // E - Set up the controls
    let radioButtons = document.querySelectorAll<HTMLInputElement>('input[name="display-type"]');
    let circlesBox = document.querySelector("#circles-cb") as HTMLButtonElement;
    let ogerponBox = document.querySelector("#ogerpon-cb") as HTMLButtonElement;
    let invertBox = document.querySelector("#invert-cb") as HTMLButtonElement;
    let embossBox = document.querySelector("#emboss-cb") as HTMLButtonElement;
    let bCirclesBox = document.querySelector("#b-circles-cb") as HTMLButtonElement;
    let randomizerBox = document.querySelector("#randomize-cb") as HTMLButtonElement;
    let circleInput = document.querySelector("#circles-input") as HTMLButtonElement;

    radioButtons[0].onclick = function (e) {
        const target = e.target as HTMLInputElement;
        drawParams.showBars = target.checked;
        if (drawParams.showWave == true) {
            drawParams.showWave = false;
        } else {
            drawParams.showWave = true;
        }
    };

    radioButtons[1].onclick = function (e) {
        const target = e.target as HTMLInputElement;
        drawParams.showWave = target.checked;
        if (drawParams.showBars == true) {
            drawParams.showBars = false;
        } else {
            drawParams.showBars = true;
        }
    };

    circlesBox.onclick = function (e) {
        const target = e.target as HTMLInputElement;
        drawParams.showCircles = target.checked;
    }

    ogerponBox.onclick = function (e) {
        const target = e.target as HTMLInputElement;
        drawParams.showOgerpon = target.checked;
    }

    invertBox.onclick = function (e) {
        const target = e.target as HTMLInputElement;
        drawParams.showInvert = target.checked;
    }

    embossBox.onclick = function (e) {
        const target = e.target as HTMLInputElement;
        drawParams.showEmboss = target.checked;
    }

    bCirclesBox.onclick = function (e) {
        const target = e.target as HTMLInputElement;
        drawParams.showBackgroundCircles = target.checked;
        for (let i = 0; i < canvasModule.circleList.length; i++) {
            canvasModule.circleList[i].reset(canvasModule.audioData[i]);
        }
        canvasModule.setJIndex(0);
    }

    randomizerBox.onclick = function (e) {
        const target = e.target as HTMLInputElement;
        drawParams.randomizeBackgroundCircles = target.checked;
        for (let i = 0; i < canvasModule.circleList.length; i++) {
            canvasModule.circleList[i].changeRandom(drawParams.randomizeBackgroundCircles);
        }
    }

    circleInput.onchange = function (e) {
        const target = e.target as HTMLSelectElement;
        for (let i = 0; i < canvasModule.circleList.length; i++) {
            canvasModule.circleList[i].radius = Number(target.value);
        }
    }

    // I. set the initial state of the high shelf checkbox
    let highshelf = document.querySelector('#cb-highshelf') as HTMLInputElement;
    highshelf.checked = audio.highshelf;

    // II. change the value of `highshelf` every time the high shelf checkbox changes state
    highshelf.onchange = e => {
        audio.toggleHighshelf(highshelf);
    };

    // III. 
    audio.toggleHighshelf(highshelf);


    let lowshelf = document.querySelector('#cb-lowshelf') as HTMLInputElement;
    lowshelf.checked = audio.lowshelf;

    lowshelf.onchange = e => {
        audio.toggleLowshelf(lowshelf);
    };

    audio.toggleLowshelf(lowshelf);

    let allpass = document.querySelector('#cb-allpass') as HTMLInputElement;
    allpass.checked = audio.allpass;

    allpass.onchange = e => {
        audio.toggleAllpass(allpass);
    };

    audio.toggleAllpass(allpass);


    let bandpass = document.querySelector('#cb-bandpass') as HTMLInputElement;
    bandpass.checked = audio.bandpass;

    bandpass.onchange = e => {
        audio.toggleBandpass(bandpass);
    };

    audio.toggleBandpass(bandpass);

    let peaking = document.querySelector('#cb-peaking') as HTMLInputElement;
    peaking.checked = audio.peaking;

    peaking.onchange = e => {
        audio.togglePeaking(peaking);
    };

    audio.togglePeaking(peaking);

    let distortionSlider = document.querySelector('#slider-distortion') as HTMLInputElement;
    let distortion = document.querySelector('#cb-distortion') as HTMLInputElement;

    distortionSlider.value = audio.distortionAmount.toString();

    distortionSlider.onchange = e => {
        const target = e.target as HTMLSelectElement;
        audio.changeDistortionValue(Number(target.value));
        audio.toggleDistortion(distortion);
    };

    distortion.checked = audio.distortion;

    distortion.onchange = e => {
        audio.toggleDistortion(distortion);
    };
} // end setupUI

let loadJSONData = (trackSelect: HTMLSelectElement): void => {
    const url = "data/av-data.json";
    const xhr = new XMLHttpRequest();

    xhr.onload = (e) => {
        let xhr = e.target as XMLHttpRequest;
        const text = xhr.responseText;
        // A message is printed to the console on success.
        console.log(`Success - The file length is ${text.length}`);
        // Our tsON is parsed into an array.
        let data = JSON.parse(xhr.responseText);

        document.querySelector("title").innerHTML = data.title;

        if (data.songs && Array.isArray(data.songs)) {
            trackSelect.innerHTML = `${data.songs.map(s => `<option value="${s.value}">${s.name}</option>`).join("")}`;
            trackSelect.value = "media/New Adventure Theme.mp3";
        }

        for (let i = 0; i < data.parameters.length; i++) {
            drawParams[i] = data.parameters[i];
        }
    }

    xhr.onerror = (e) => {
        console.log("An error occurred.");
    }

    xhr.open("GET", url);
    xhr.send();
}

const loop = (): void => {
    /* NOTE: This is temporary testing code that we will delete in Part II */
    setTimeout(loop, 1000 / 60);
    currTime = performance.now();
    deltaTime = currTime - lastTime;
    canvasModule.draw(drawParams, deltaTime);
    lastTime = currTime;
}

export { init, playing };