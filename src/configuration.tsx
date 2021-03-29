import { Layout } from './layout';
import { ITextOptions } from './text';

export interface IBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

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
