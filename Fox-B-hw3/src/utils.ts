interface ColorStop {
  percent: number;
  color: string;
}

const makeColor = (red: number, green: number, blue: number, alpha: number = 1): string => {
  return `rgba(${red},${green},${blue},${alpha})`;
};

const getRandom = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

const getRandomColor = (floor: number = 35): string => {
  const getByte = () => getRandom(floor, 255 - floor);
  return `rgba(${getByte()},${getByte()},${getByte()},1)`;
};

const getLinearGradient = (ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, colorStops: ColorStop[]) => {
  let lg = ctx.createLinearGradient(startX, startY, endX, endY);
  for (let stop of colorStops) {
    lg.addColorStop(stop.percent, stop.color);
  }
  return lg;
};

// https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
const goFullscreen = (element): void => {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullscreen) {
    element.mozRequestFullscreen();
  } else if (element.mozRequestFullScreen) { // camel-cased 'S' was changed to 's' in spec
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  }
  // .. and do nothing if the method is not supported
};

export { makeColor, getRandom, getRandomColor, getLinearGradient, goFullscreen };