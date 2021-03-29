import React, { useMemo } from 'react';
import GoogleFontLoader from 'react-google-font-loader';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { IConfiguration } from './configuration';
import { SequenceData } from './data';
import { makeLayout } from './layout';
import { ITextOptions, Paragraph, Text } from './text';
import { drawerOpenByDefault, drawerWidth } from './theme';

export const Display: React.FC<{ data: SequenceData; config: IConfiguration }> = ({
  data,
  config,
}) => (
  <svg width={config.width} height={config.height}>
    <rect width="100%" height="100%" fill={config.background} />
    {makeLayout(config, data)}
    {config.textMain && <Text {...config.textMain} color={config.foreground} />}
    {config.textSub && <Text {...config.textSub} color={config.foreground} />}
    {config.textFlavor && <Paragraph {...config.textFlavor} color={config.foreground} />}
  </svg>
);

const windowPadding = 0.05;

export const Canvas: React.FC<{ data: SequenceData; config: IConfiguration }> = ({
  data,
  config,
}) => {
  let drawerWidthOffset = drawerOpenByDefault ? drawerWidth : 0;

  // set the scale such that the visualization fits on screen.
  const scale = Math.min(
    (window.innerWidth * (1 - windowPadding) - drawerWidthOffset) / config.width,
    (window.innerHeight * (1 - windowPadding)) / config.height,
  );

  return (
    <div className="canvas">
      <TransformWrapper
        scale={scale}
        defaultPositionX={(window.innerWidth - drawerWidthOffset - config.width * scale) / 2}
        defaultPositionY={(window.innerHeight - config.height * scale) / 2}
        wheel={{ step: 30 }}
        options={{ limitToBounds: false, limitToWrapper: false, minScale: 0, maxScale: Infinity }}
      >
        <TransformComponent>
          <Display data={data} config={config} />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

type FontWithRequiredWeights = { font: string; weights: number[] };

const useFontRequest = (config: ITextOptions | undefined) =>
  useMemo(
    (): FontWithRequiredWeights | undefined =>
      config && { font: config.fontFamily, weights: [config.fontWeight] },
    [config?.fontWeight, config?.fontFamily],
  );

export const FontLoader: React.FC<{ config: IConfiguration }> = ({ config }) => {
  const mainFont = useFontRequest(config.textMain);
  const subFont = useFontRequest(config.textSub);
  const flavorFont = useFontRequest(config.textFlavor);

  // The GoogleFontLoader isn't smart about memoizing changes, which causes a
  // FOUT on renderer. Do some legwork to avoid rerendering it if possible

  const fontRequest = useMemo(
    () =>
      [mainFont, subFont, flavorFont]
        .filter((f): f is FontWithRequiredWeights => !!f)
        .sort((a, b) => a.font.localeCompare(b.font))
        .reduce<FontWithRequiredWeights[]>(
          (acc, b) =>
            acc.length === 0 || acc[0].font !== b.font
              ? [b, ...acc]
              : acc[0].weights.includes(b.weights[0])
              ? acc
              : [{ font: b.font, weights: [...b.weights, ...acc[0].weights] }, ...acc.slice(1)],
          [],
        ),
    [mainFont, subFont, flavorFont],
  );

  return <GoogleFontLoader fonts={fontRequest} />;
};
