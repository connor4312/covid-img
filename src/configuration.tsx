import { Layout } from './layout';
import { ITextOptions } from './text';

export interface IBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const fitWithin = (box: IBox, anotherBoxWithAspectRatio: number): IBox => {
  const ratio = box.width / box.height;
  if (ratio > anotherBoxWithAspectRatio) {
    const width = box.height / anotherBoxWithAspectRatio;
    return { top: box.top, left: box.left + (box.width - width) / 2, width, height: box.height };
  } else {
    const height = box.width / anotherBoxWithAspectRatio;
    return { top: box.top + (box.height - height) / 2, left: box.left, width: box.width, height };
  }
};

export type Coordinate = [x: number, y: number];

export const enum Dataset {
  Moderna,
  Pfizer,
}

export interface IConfiguration {
  dataset: Dataset;
  width: number;
  height: number;
  foreground: string;
  background: string;
  textMain?: ITextOptions;
  textSub?: ITextOptions;
  textFlavor?: ITextOptions;
  layout: Layout;
  nodeRegion: IBox;
}
