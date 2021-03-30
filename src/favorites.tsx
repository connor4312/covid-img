import { Dataset, IConfiguration } from './configuration';
import { pfizerText } from './descriptions';
import { LayoutType } from './layout';
import { ColumnNodeShape, ColumnOrientation } from './layout-column';
import { Rotate } from './text';

const getDimensions = (params: URLSearchParams, aspectRatio: number) => {
  const height = Number(params.get('h')) || window.innerHeight;
  const width = Number(params.get('w')) || height * aspectRatio;
  return [width, height];
};

export const barcode85By11 = (params: URLSearchParams): IConfiguration => {
  const [width, height] = getDimensions(params, 8.5 / 11);
  const marginPercent = 0.05;
  const leftMargin = width * marginPercent;
  const topMargin = height * marginPercent;
  const workingWidth = width * (1 - marginPercent * 2);
  const workingHeight = height * (1 - marginPercent * 2);

  const reservedTextArea = 0.21;
  const mainTextSize = 0.13;
  const subTextSize = 0.04;
  const flavorLeft = leftMargin * 2 + workingWidth - reservedTextArea * width;

  const textOptions = {
    text: '',
    fontFamily: 'Bebas Neue',
    fontWeight: 400,
    rotate: Rotate.Clockwise,
    hanging: true,
    box: {
      top: topMargin,
      left: leftMargin + workingWidth,
      width: mainTextSize * width,
      height: workingHeight,
    },
  };

  const text = pfizerText;

  return {
    height,
    width,
    dataset: Dataset.Pfizer,
    background: '#ffffff',
    foreground: '#000000',
    textMain: {
      ...textOptions,
      fontSize: width * mainTextSize,
      text: text.main,
    },
    textSub: {
      ...textOptions,
      box: {
        ...textOptions.box,
        left: textOptions.box.left - width * mainTextSize,
        width: width * subTextSize,
      },
      fontSize: width * subTextSize,
      text: text.sub,
    },
    textFlavor: {
      ...textOptions,
      box: {
        left: flavorLeft,
        width: width - flavorLeft - width * marginPercent,
        top: topMargin,
        height: workingHeight,
      },
      hanging: true,
      fontSize: width * 0.01,
      fontFamily: 'Roboto',
      rotate: 0,
      text: text.flavor,
    },
    layout: {
      type: LayoutType.Column,
      count: 3,
      orientation: ColumnOrientation.Vertical,
      shape: ColumnNodeShape.Barcode,
      spacing: width * 0.05,
      foreground: '#000000',
    },
    nodeRegion: {
      left: leftMargin,
      top: topMargin,
      width: workingWidth - reservedTextArea * width,
      height: workingHeight,
    },
  };
};
