import React from 'react';
import { IBox } from './configuration';

export const enum Align {
  Left,
  Right,
  Center,
}

export const enum Rotate {
  None = 0,
  Clockwise = 90,
  Anticlockwise = -90,
}

export interface ITextOptions {
  text: string;
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  box: IBox;
  hanging?: boolean;
  rotate?: number;
}

export const Text: React.FC<ITextOptions & { color: string }> = ({
  text,
  fontFamily,
  fontWeight,
  hanging,
  box,
  fontSize,
  color,
  rotate,
}) => {
  return (
    <text
      x={box.left}
      y={box.top}
      textAnchor="start"
      dominantBaseline={hanging ? 'hanging' : 'auto'}
      fontFamily={fontFamily}
      fontWeight={fontWeight}
      fontSize={fontSize}
      fill={color}
      transform={`rotate(${rotate} ${box.left} ${box.top})`}
    >
      {text}
    </text>
  );
};

export const Paragraph: React.FC<ITextOptions & { color: string }> = ({
  text,
  fontFamily,
  fontWeight,
  box,
  fontSize,
  color,
  hanging,
}) => {
  const paragraphs = text.split('\n\n');

  return (
    <foreignObject x={box.left} y={box.top} width={box.width} height={box.height}>
      <div
        style={{
          width: box.width,
          height: box.height,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: hanging ? 'flex-end' : 'flex-start',
        }}
      >
        {paragraphs.map((text, i) => (
          <p
            key={i}
            style={{ fontFamily, fontWeight, fontSize, color, marginTop: i > 0 ? '1em' : 0 }}
          >
            {text}
          </p>
        ))}
      </div>
    </foreignObject>
  );
};
