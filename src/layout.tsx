import React from 'react';
import { IConfiguration } from './configuration';
import { SequenceData } from './data';
import {
  ColumnNodeShape,
  ColumnOrientation,
  IColumnLayout,
  makeColumnLayout,
} from './layout-column';

export const enum LayoutType {
  Column,
}

export const defaultLayouts: { [K in LayoutType]: Layout & { type: K } } = {
  [LayoutType.Column]: {
    count: 3,
    orientation: ColumnOrientation.Horizontal,
    shape: ColumnNodeShape.Barcode,
    spacing: 0,
    type: LayoutType.Column,
  },
};

export type Layout = IColumnLayout;

export const makeLayout = (
  config: IConfiguration,
  data: SequenceData,
): ReadonlyArray<React.ReactChild> => {
  switch (config.layout.type) {
    case LayoutType.Column:
      return makeColumnLayout(config, config.layout, data);
    default:
      return [];
  }
};
