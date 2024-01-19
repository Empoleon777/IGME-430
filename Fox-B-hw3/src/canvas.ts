/*
    The purpose of this file is to take in the analyser node and a <canvas> element: 
      - the module will create a drawing context that points at the <canvas> 
      - it will store the reference to the analyser node
      - in draw(), it will loop through the data in the analyser node
      - and then draw something representative on the canvas
      - maybe a better name for this file/module would be *visualizer* ?
*/

import * as utils from './utils';
import * as main from "./main";
// import * as gifuct from './gifuct-ts/dist/';

interface DrawParams {
    showBars?: boolean,
    showWave?: boolean,
    showCircles?: boolean,
    showOgerpon?: boolean,
    showInvert?: boolean,
    showEmboss?: boolean,
    showBackgroundCircles?: boolean,
    randomizeBackgroundCircles?: boolean
}

let ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, gradient: CanvasGradient, analyserNode: AnalyserNode, audioData: Uint8Array, waveData: Uint8Array, circleList: movingCircle[], j: number, time: number, wave: soundWave;
const delay = 0.25;
j = 0;
time = 0;
let frames;
let currFrame;

class movingCircle {
    public ctx: CanvasRenderingContext2D;
    public radius: number;
    public random: boolean;
    public x: number;
    public y: number;
    public speed: number;
    public color: string;

    constructor(ctx, random: boolean, speed: number) {
        this.ctx = ctx;
        this.radius = 1;
        this.random = random;
        this.x = -5;
        this.y = Math.random() * canvasHeight;
        this.speed = speed;
        this.color;

        this.changeRandom(random);
    }

    draw() {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
    }

    // Translates the circle.
    move(deltaTime: number): void {
        this.ctx.save();
        this.x += (this.speed * deltaTime) / 1000;
        this.ctx.restore();
    }

    // Returns the circle to the start if it reaches the right edge of the canvas.
    reset(speed: number): void {
        this.x = 0;
        this.y = Math.random() * canvasHeight;
        this.speed = speed;
    }

    // Toggles whether the circles should be random colors.
    changeRandom(random: boolean): void {
        this.random = random;

        if (this.random == true) {
            this.color = utils.getRandomColor();
        }
        else {
            this.color = utils.makeColor(255, 255, 255);
        }
    }
}

class soundWave {
    public ctx: CanvasRenderingContext2D;
    public x: number;
    public y: number;
    public radius: number;
    public growthRate: number;
    public color: string;

    constructor(ctx: CanvasRenderingContext2D, growthRate: number, color: string) {
        this.ctx = ctx;
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.radius = 0;
        this.growthRate = growthRate;
        this.color = color;
    }

    draw = (params: DrawParams): void => {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.color;
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }

    expand = (deltaTime: number): void => {
        this.ctx.save();
        this.radius += this.growthRate * deltaTime / 100000;
        this.ctx.restore();
    }

    // Returns the circle to the start if it reaches the right edge of the canvas.
    reset = (): void => {
        this.radius = 0;
    }
}

const setupCanvas = (canvasElement: HTMLCanvasElement, analyserNodeRef: AnalyserNode): void => {
    // create drawing context
    ctx = canvasElement.getContext("2d");
    canvasWidth = canvasElement.width;
    canvasHeight = canvasElement.height;
    // create a gradient that runs top to bottom
    gradient = utils.getLinearGradient(ctx, 0, 0, 0, canvasHeight, [{ percent: 0, color: "blue" }, { percent: .25, color: "green" }, { percent: .5, color: "yellow" }, { percent: .75, color: "red" }, { percent: 1, color: "magenta" }]);
    // keep a reference to the analyser node
    analyserNode = analyserNodeRef;

    // this is the array where the analyser data will be stored
    audioData = new Uint8Array(analyserNode.fftSize / 2);
    waveData = new Uint8Array(analyserNode.fftSize / 2);
    circleList = [];
    wave = new soundWave(ctx, 0, "white");

    // Loading the image elements into the Canvas.
    // for (let i = 0; i < 208; i++) {
    //     let frameID = "";
    //     for (let j = 1; j <= 4 - String(207 - i).length; j++) {
    //         frameID += String(0);
    //     }
    //     frameID += String(207 - i);
    //     document.querySelector("#display").innerHTML += `<img src="./images/ogerpon-pokemon_${frameID}_Layer-${i + 1}.png" alt="" style="display:none">`;
    // }

    // currFrame = 1;

    // frames = document.querySelectorAll("img");

    // let gif = document.querySelector("img");
    // frames = gifuct.GifReader(gif);
}

const draw = (params: DrawParams, deltaTime: number): void => {
    // if (params.showBars) {
    //     analyserNode.getByteFrequencyData(audioData);
    // }
    // else if (params.showWave) {
    //     analyserNode.getByteTimeDomainData(audioData)
    // }

    analyserNode.getByteFrequencyData(audioData);
    analyserNode.getByteTimeDomainData(waveData);

    // OR
    //analyserNode.getByteTimeDomainData(audioData); // waveform data

    // 2 - draw background
    ctx.save();
    ctx.fillStyle = "black";
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    if (params.showBackgroundCircles && main.playing == true) {
        for (let i = 0; i < circleList.length; i++) {
            circleList[i].speed = audioData[i];

            if (circleList[i].speed == 0) {
                circleList[i].speed = 10;
            }

            circleList[i].move(deltaTime);
            circleList[i].draw();

            if (circleList[i].x >= canvasWidth) {
                circleList[i].reset(audioData[j]);
                j++;

                if (j >= audioData.length || audioData[j] == 0) {
                    j = 0;
                }
            }
        }
    }

    // if (params.showOgerpon && main.playing == true) {
    //     ctx.globalAlpha = 1;
    //     let leftIndex = currFrame - 1;
    //     let rightIndex = 207 - leftIndex;
    //     ctx.drawImage(frames[leftIndex], canvasWidth / 8, canvasHeight / 4, canvasWidth / 2, canvasHeight / 2);
    //     ctx.drawImage(frames[rightIndex], 5 * canvasWidth / 8, canvasHeight / 4, canvasWidth / 2, canvasHeight / 2);

    // }

    // // 3 - draw gradient
    // if (params.showGradient) {
    //     ctx.save();
    //     ctx.fillStyle = gradient;
    //     ctx.globalAlpha = 0.3;
    //     ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    //     ctx.restore();
    // }

    // 4 - draw bars
    if (params.showBars) {
        let margin = 5;
        let screenWidthForBars = canvasWidth - margin * 2;
        let barWidth = screenWidthForBars / audioData.length;
        let barHeight;
        let topSpacing = 100;

        ctx.save();

        // Loop through the data and draw.
        for (let i = 0; i < audioData.length; i++) {
            ctx.fillStyle = `rgba(${audioData[i]},0,${255 - audioData[i]},1)`;
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            barHeight = audioData[i] + 100;
            ctx.fillRect(margin + i * barWidth, canvasHeight + 10, barWidth / 10, (-barHeight - 10) / 2);
            ctx.strokeRect(margin + i * barWidth, canvasHeight + 10, barWidth / 10, (-barHeight - 10) / 2);
        }

        ctx.restore();
    }

    if (params.showWave) {
        let pointSpacing = canvasWidth / waveData.length;
        let topSpacing = 100;
        let margin = 5;

        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,1)';
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Loop through the data.
        // for (let i = 1; i < audioData.length; i += 2) {
        //     ctx.moveTo((i - 1) * pointSpacing, audioData[i - 1]);
        //     ctx.quadraticCurveTo((i) * pointSpacing, audioData[i], (i + 1) * pointSpacing, audioData[i + 1]);
        // }

        ctx.moveTo(0, topSpacing + 256 - (canvasHeight / 2));

        for (let i = 0; i < waveData.length; i++) {
            ctx.lineTo(i * pointSpacing + margin, topSpacing + 256 - (waveData[i] / 128.0) * (canvasHeight / 2));
        }

        ctx.stroke();
        ctx.restore();
    }

    // 5 - draw circles
    if (params.showCircles && main.playing == true) {
        let maxRadius = canvasHeight / 4;
        ctx.save();
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < audioData.length; i++) {
            let percent = audioData[i] / 255;

            if (time <= 0) {
                if (wave.growthRate == 0) {
                    wave.growthRate = audioData[i] * 2;
                }

                wave.draw(params);
                wave.expand(deltaTime);

                if (wave.radius > canvasWidth / 2 * 1.5) {
                    wave.growthRate = 0;
                    wave.reset();
                    time = delay;
                }

            }
            else {
                time -= deltaTime / 1000;
            }

            // // red-ish circles
            // let circleRadius = percent * maxRadius;
            // ctx.beginPath();
            // ctx.fillStyle = utils.makeColor(255, 111, 111, 0.34 - percent / 3.0);
            // ctx.arc(canvasWidth / 2, canvasHeight / 2, circleRadius, 0, 2 * Math.PI, false);
            // ctx.fill();
            // ctx.closePath();

            // // blue-ish circles, bigger, more transparent
            // ctx.beginPath();
            // ctx.fillStyle = utils.makeColor(0, 0, 255, 0.10 - percent / 10.0);
            // ctx.arc(canvasWidth / 2, canvasHeight / 2, circleRadius * 1.5, 0, 2 * Math.PI, false);
            // ctx.fill();
            // ctx.closePath();

            // // yellow-ish circles, smaller
            // ctx.save();
            // ctx.beginPath();
            // ctx.fillStyle = utils.makeColor(200, 200, 0, 0.5 - percent / 5.0);
            // ctx.arc(canvasWidth / 2, canvasHeight / 2, circleRadius * 0.50, 0, 2 * Math.PI, false);
            // ctx.fill();
            // ctx.closePath();
            // ctx.restore();
        }
        ctx.restore();
    }

    // 6 - bitmap manipulation
    // TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
    // regardless of whether or not we are applying a pixel effect
    // At some point, refactor this code so that we are looping though the image data only if
    // it is necessary

    // A) grab all of the pixels on the canvas and put them in the `data` array
    // `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
    // the variable `data` below is a reference to that array 
    let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width; // Not used here

    // B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
    for (let i = 0; i < length; i += 4) {
        // // C) randomly change every 20th pixel to red
        // if (params.showNoise && Math.random() < 0.05) {
        //     // data[i] is the red channel
        //     // data[i+1] is the green channel
        //     // data[i+2] is the blue channel
        //     // data[i+3] is the alpha channel
        //     data[i] = data[i + 1] = data[i + 2] = 0;// zero out the red and green and blue channels
        //     data[i] = 255;// make the red channel 100% red
        // } // end if
        if (params.showInvert) {
            let red = data[i], green = data[i + 1], blue = data[i + 2];
            data[i] = 255 - red;
            data[i + 1] = 255 - green;
            data[i + 2] = 255 - blue;
            // data[i+3] is the alpha channel, but we're leaving that alone.
        }
    } // end for

    if (params.showEmboss) {
        // We're stepping through every sub-pixel.
        for (let i = 0; i < length; i++) {
            if (i % 4 == 3) continue; // Skip alpha channel
            data[i] = 127 + 2 * data[i] - data[i + 4] - data[i + width * 4];
        }
    }

    // D) copy image data back to canvas
    ctx.putImageData(imageData, 0, 0);
}

const setJIndex = (value: number): void => {
    j = value;
}

export { setupCanvas, draw, setJIndex, audioData, circleList, movingCircle, j, ctx };