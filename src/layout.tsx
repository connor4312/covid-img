// todo: types will be published soon
//@ts-ignore
import colors from 'colorbrewer';
import React from 'react';
import { IConfiguration } from './configuration';
import { SequenceData } from './data';
import {
  ColumnNodeShape,
  ColumnOrientation,
  IColumnLayout,
  makeColumnLayout,
} from './layout-column';
import { IQrCodeLayout, makeQrLayout } from './layout-qr';
import { ISpiralLayout, makeSpiralLayout } from './layout-spiral';

export const enum LayoutType {
  Column,
  QR,
  Spiral,
}

export const defaultLayouts: {
  [K in LayoutType]: (config: IConfiguration) => Layout & { type: K };
} = {
  [LayoutType.Column]: config => ({
    count: 3,
    orientation: ColumnOrientation.Horizontal,
    shape: ColumnNodeShape.Barcode,
    spacing: 0,
    type: LayoutType.Column,
    foreground: config.foreground,
  }),
  [LayoutType.QR]: config => ({
    type: LayoutType.QR,
    ecl: 'low',
    foreground: config.foreground,
  }),
  [LayoutType.Spiral]: config => ({
    type: LayoutType.Spiral,
    colors: colors.Paired[4],
    segmentGutter: 0,
    segmentHeight: config.nodeRegion.width / 20,
    startRadius: config.nodeRegion.width / 10,
  }),
};

export type Layout = IColumnLayout | IQrCodeLayout | ISpiralLayout;

export const makeLayout = (config: IConfiguration, data: SequenceData): React.ReactNode => {
  switch (config.layout.type) {
    case LayoutType.Column:
      return makeColumnLayout(config, config.layout, data);
    case LayoutType.QR:
      return makeQrLayout(config, config.layout, data);
    case LayoutType.Spiral:
      return makeSpiralLayout(config, config.layout, data);
    default:
      return [];
  }
};
