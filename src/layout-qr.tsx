import QRCode from 'qrcode';
import React, { useEffect, useMemo, useState } from 'react';
import { fitWithin, IConfiguration } from './configuration';
import { SequenceData } from './data';
import { LayoutType } from './layout';

const toBinary = (seq: SequenceData) => {
  const out = new Uint8ClampedArray(Math.ceil(seq.length / 4));
  for (let i = 0; i < seq.length; i++) {
    const offset = (i % 4) * 2;
    const byte = Math.floor(i / 4);
    out[byte] |= seq[i] << offset;
  }

  return out;
};

export interface IQrCodeLayout {
  type: LayoutType.QR;
  foreground: string;
  ecl: 'low' | 'medium' | 'quartile' | 'high';
}

export const makeQrLayout = (config: IConfiguration, layout: IQrCodeLayout, data: SequenceData) => {
  const [html, setHtml] = useState('');

  const targetBox = useMemo(() => fitWithin(config.nodeRegion, 1), [config.nodeRegion]);

  useEffect(() => {
    QRCode.toString([{ data: toBinary(data), mode: 'byte' }], {
      errorCorrectionLevel: layout.ecl,
      width: targetBox.width,
      color: { dark: layout.foreground },
      type: 'svg',
    }).then(setHtml);
  }, [targetBox, layout, data]);

  return (
    <g
      transform={`translate(${targetBox.left}, ${targetBox.top})`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
