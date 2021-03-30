import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  FormControlLabel,
  Grid,
  Input,
  MenuItem,
  Select,
  Slider,
  SliderProps,
  Switch,
  TextField,
  Typography,
} from '@material-ui/core';
// todo: types will be published soon
//@ts-ignore
import colors from 'colorbrewer';
import React, { useEffect, useMemo, useState } from 'react';
import {
  AiOutlineColumnHeight,
  AiOutlineColumnWidth,
  AiOutlineDown,
  AiOutlineExpandAlt,
  AiOutlineFontSize,
  AiOutlineFunction,
  AiOutlineLineHeight,
} from 'react-icons/ai';
import { useDebounce } from 'react-use';
import { Dataset, IBox, IConfiguration } from './configuration';
import { modernaText, pfizerText } from './descriptions';
import { defaultLayouts, Layout, LayoutType } from './layout';
import { ColumnOrientation, IColumnLayout } from './layout-column';
import { IQrCodeLayout } from './layout-qr';
import { ISpiralLayout } from './layout-spiral';
import { ITextOptions, Rotate } from './text';

export const ConfigurationUI: React.FC<{
  value: IConfiguration;
  onChange(config: IConfiguration): void;
}> = ({ value, onChange }) => {
  return (
    <div style={{ padding: '0 0.5rem', flexGrow: 1 }}>
      <ConfigurationSection label="General Settings">
        <Grid item>
          <Select
            label="Dataset"
            value={value.dataset}
            onChange={evt => {
              const dataset = evt.target.value as Dataset;
              const text = dataset === Dataset.Pfizer ? pfizerText : modernaText;
              onChange({
                ...value,
                dataset,
                textSub: value.textSub ? { ...value.textSub, text: text.sub } : undefined,
                textMain: value.textMain ? { ...value.textMain, text: text.main } : undefined,
                textFlavor: value.textFlavor
                  ? { ...value.textFlavor, text: text.flavor }
                  : undefined,
              });
            }}
          >
            <MenuItem value={Dataset.Pfizer}>Pfizer</MenuItem>
            <MenuItem value={Dataset.Moderna}>Moderna</MenuItem>
          </Select>
        </Grid>
        <Grid item>
          <SliderWithInput
            hideLabel
            label="Width"
            icon={<AiOutlineColumnWidth />}
            min={100}
            max={3_000}
            value={value.width}
            onChange={width => onChange({ ...value, width })}
          />
        </Grid>
        <Grid item>
          <SliderWithInput
            hideLabel
            label="Height"
            min={100}
            max={3_000}
            icon={<AiOutlineColumnHeight />}
            value={value.height}
            onChange={height => onChange({ ...value, height })}
          />
        </Grid>
        <Grid item>
          <ColorInput
            label="Foreground"
            value={value.foreground}
            onChange={foreground => onChange({ ...value, foreground })}
          />
        </Grid>
        <Grid item>
          <ColorInput
            label="Background"
            value={value.background}
            onChange={background => onChange({ ...value, background })}
          />
        </Grid>
        <BoxEditor
          maxHeight={value.height}
          maxWidth={value.width}
          prefix="Illustration Area: "
          value={value.nodeRegion}
          onChange={nodeRegion => onChange({ ...value, nodeRegion })}
        />
      </ConfigurationSection>

      <ConfigurationSection label="Main Text">
        <TextOptionInputs
          config={value}
          value={value.textMain}
          onlyCoordinate
          onChange={textMain => onChange({ ...value, textMain })}
        />
      </ConfigurationSection>

      <ConfigurationSection label="Sub Text">
        <TextOptionInputs
          config={value}
          value={value.textSub}
          onlyCoordinate
          onChange={textSub => onChange({ ...value, textSub })}
        />
      </ConfigurationSection>

      <ConfigurationSection label="Flavor Text">
        <TextOptionInputs
          config={value}
          value={value.textFlavor}
          onChange={textFlavor => onChange({ ...value, textFlavor })}
        />
      </ConfigurationSection>

      <ConfigurationSection label="Layout" expanded>
        <LayoutEditor
          config={value}
          value={value.layout}
          onChange={layout => onChange({ ...value, layout })}
        />
      </ConfigurationSection>
    </div>
  );
};

const ColorInput: React.FC<{ label: string; value: string; onChange(value: string): void }> = ({
  label,
  value,
  onChange,
}) => {
  const [currentValue, setCurrentValue] = useState(value);
  useEffect(() => setCurrentValue(value), [value]);

  // debounce since dragging the color picker can by quite laggy
  useDebounce(
    () => {
      onChange(currentValue);
    },
    500,
    [currentValue],
  );

  return (
    <TextField
      label={label}
      // for some reason, color inputs don't fill the width by default
      style={{ width: '100%' }}
      value={value}
      onChange={evt => setCurrentValue(evt.target.value)}
      type="color"
    />
  );
};

const ConfigurationSection: React.FC<{ label: string; expanded?: boolean }> = ({
  label,
  children,
  expanded,
}) => (
  <Accordion defaultExpanded={expanded}>
    <AccordionSummary expandIcon={<AiOutlineDown />}>
      <Typography>{label}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Grid container direction={'column'} spacing={5}>
        {children}
      </Grid>
    </AccordionDetails>
  </Accordion>
);

let idCounter = 0;

const useUniqueId = () => useMemo(() => `unique-id-${idCounter++}`, []);

const LayoutEditor: React.FC<{
  config: IConfiguration;
  value: Layout;
  onChange(layout: Layout): void;
}> = ({ value, onChange, config }) => {
  return (
    <>
      <Grid item>
        <Select
          label="Layout"
          value={value.type}
          onChange={evt => {
            if (evt.target.value !== value.type) {
              onChange(defaultLayouts[evt.target.value as LayoutType](config));
            }
          }}
        >
          <MenuItem value={LayoutType.Column}>Column/Row</MenuItem>
          <MenuItem value={LayoutType.QR}>QR Code</MenuItem>
          <MenuItem value={LayoutType.Spiral}>Spiral</MenuItem>
        </Select>
      </Grid>
      {value.type === LayoutType.Column && <ColumnLayoutEditor value={value} onChange={onChange} />}
      {value.type === LayoutType.QR && <QrCodeEditor value={value} onChange={onChange} />}
      {value.type === LayoutType.Spiral && (
        <SpiralEditor config={config} value={value} onChange={onChange} />
      )}
    </>
  );
};

const QrCodeEditor: React.FC<{
  value: IQrCodeLayout;
  onChange(layout: IQrCodeLayout): void;
}> = ({ value, onChange }) => (
  <>
    <Grid item>
      <ColorInput
        label="Foreground"
        value={value.foreground}
        onChange={foreground => onChange({ ...value, foreground })}
      />
    </Grid>
    <Grid item>
      <Select
        label="Error Correction Level"
        value={value.ecl}
        onChange={evt =>
          onChange({ ...value, ecl: evt.target.value as 'low' | 'medium' | 'high' | 'quartile' })
        }
      >
        <MenuItem value="low">Low</MenuItem>
        <MenuItem value="medium">Medium</MenuItem>
        <MenuItem value="quartile">Quartile</MenuItem>
        <MenuItem value="high">High</MenuItem>
      </Select>
    </Grid>
  </>
);

const SpiralEditor: React.FC<{
  config: IConfiguration;
  value: ISpiralLayout;
  onChange(layout: ISpiralLayout): void;
}> = ({ config, value, onChange }) => (
  <>
    <ColorThemeEditor value={value.colors} onChange={colors => onChange({ ...value, colors })} />
    <Grid item>
      <SliderWithInput
        value={value.segmentHeight}
        label="Segment Height"
        min={1}
        max={config.nodeRegion.width / 4}
        step={0.05}
        onChange={segmentHeight => onChange({ ...value, segmentHeight })}
        icon={<AiOutlineColumnWidth />}
      />
    </Grid>
    <Grid item>
      <SliderWithInput
        value={value.segmentGutter}
        label="Segment Gutter"
        min={0}
        max={value.segmentHeight}
        step={0.05}
        onChange={segmentGutter => onChange({ ...value, segmentGutter })}
        icon={<AiOutlineColumnWidth />}
      />
    </Grid>
    <Grid item>
      <SliderWithInput
        value={value.startRadius}
        label="Inner Radius"
        min={1}
        max={config.nodeRegion.width / 4}
        onChange={startRadius => onChange({ ...value, startRadius })}
        icon={<AiOutlineExpandAlt />}
      />
    </Grid>
  </>
);

const ColorThemeEditor: React.FC<{
  value: ReadonlyArray<string>;
  onChange(value: string[]): void;
}> = ({ value, onChange }) => (
  <>
    <Grid item>
      <Select
        label="Colors"
        value={value}
        onChange={evt => onChange(String(evt.target.value).split(','))}
      >
        {colors.schemeGroups.qualitative.map((name: string) => (
          <MenuItem key={name} value={colors[name][4].join(',')}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </Grid>
    <Grid item>
      <ColorInput
        label="Adenine Color"
        value={value[0]}
        onChange={v => onChange(value.map((c, i) => (i === 0 ? v : c)))}
      />
    </Grid>
    <Grid item>
      <ColorInput
        label="Cytosine Color"
        value={value[1]}
        onChange={v => onChange(value.map((c, i) => (i === 1 ? v : c)))}
      />
    </Grid>
    <Grid item>
      <ColorInput
        label="Uracil Color"
        value={value[2]}
        onChange={v => onChange(value.map((c, i) => (i === 2 ? v : c)))}
      />
    </Grid>
    <Grid item>
      <ColorInput
        label="Guanine Color"
        value={value[3]}
        onChange={v => onChange(value.map((c, i) => (i === 3 ? v : c)))}
      />
    </Grid>
  </>
);

const ColumnLayoutEditor: React.FC<{
  value: IColumnLayout;
  onChange(layout: IColumnLayout): void;
}> = ({ value, onChange }) => (
  <>
    <Grid item>
      <ColorInput
        label="Foreground"
        value={value.foreground}
        onChange={foreground => onChange({ ...value, foreground })}
      />
    </Grid>
    <Grid item>
      <FormControlLabel
        control={
          <Switch
            checked={value.orientation === ColumnOrientation.Vertical}
            onChange={(_evt, checkec) =>
              onChange({
                ...value,
                orientation: checkec ? ColumnOrientation.Vertical : ColumnOrientation.Horizontal,
              })
            }
          />
        }
        label="Orient as Rows"
      />
    </Grid>
    <Grid item>
      <SliderWithInput
        icon={<AiOutlineFunction />}
        label="Number of Columns"
        onChange={count => onChange({ ...value, count })}
        value={value.count}
        min={1}
        max={16}
      />
    </Grid>
    <Grid item>
      <SliderWithInput
        icon={<AiOutlineColumnHeight />}
        label="Column Spacing"
        onChange={spacing => onChange({ ...value, spacing })}
        value={value.spacing}
        min={1}
        max={100}
      />
    </Grid>
  </>
);

const TextOptionInputs: React.FC<{
  config: IConfiguration;
  value: ITextOptions | undefined;
  onlyCoordinate?: boolean;
  onChange(value: ITextOptions | undefined): void;
}> = ({ onlyCoordinate, config, value, onChange }) => {
  if (!value) {
    return (
      <Button
        onClick={() =>
          onChange({
            box: { height: 100, width: 100, left: 0, top: 0 },
            fontFamily: 'Robot',
            fontWeight: 400,
            fontSize: 20,
            text: 'Hello World',
          })
        }
      >
        Add Text
      </Button>
    );
  }

  return (
    <>
      <Grid item>
        <TextField
          label="Text"
          value={value.text}
          onChange={evt => onChange({ ...value, text: evt.target.value })}
        />
      </Grid>

      <Grid item>
        <TextField
          label="Font Family"
          value={value.fontFamily}
          onChange={evt => onChange({ ...value, fontFamily: evt.target.value })}
          helperText={
            <>
              You can use any installed or{' '}
              <a href="https://fonts.google.com/" target="_blank" rel="nofollow">
                Google Font
              </a>
              .
            </>
          }
        />
      </Grid>

      <Grid item>
        <Select
          label="Font Weight"
          value={value.fontWeight}
          onChange={evt => onChange({ ...value, fontWeight: Number(evt.target.value) })}
        >
          <MenuItem value={100}>Thin</MenuItem>
          <MenuItem value={200}>Extra Light</MenuItem>
          <MenuItem value={300}>Light</MenuItem>
          <MenuItem value={400}>Normal</MenuItem>
          <MenuItem value={500}>Medium</MenuItem>
          <MenuItem value={600}>Semi Bold</MenuItem>
          <MenuItem value={700}>Bold</MenuItem>
          <MenuItem value={800}>Extra Bold</MenuItem>
          <MenuItem value={900}>Black</MenuItem>
        </Select>
      </Grid>

      <Grid item>
        <SliderWithInput
          label="Font Size"
          icon={<AiOutlineFontSize />}
          min={8}
          max={300}
          value={value.fontSize}
          onChange={fontSize => onChange({ ...value, fontSize })}
        />
      </Grid>

      <Grid item>
        <Select
          label="Rotation"
          value={value.rotate ?? Rotate.None}
          onChange={evt => onChange({ ...value, rotate: Number(evt.target.value) })}
        >
          <MenuItem value={Rotate.None}>None</MenuItem>
          <MenuItem value={Rotate.Clockwise}>Clockwise</MenuItem>
          <MenuItem value={Rotate.Anticlockwise}>Anticlockwise</MenuItem>
        </Select>
      </Grid>

      <BoxEditor
        maxWidth={config.width}
        maxHeight={config.height}
        onlyCoordinate={onlyCoordinate}
        value={value.box}
        onChange={box => onChange({ ...value, box })}
      />

      <Grid item>
        <Button color="default" onClick={() => onChange(undefined)}>
          Remove
        </Button>
      </Grid>
    </>
  );
};

const BoxEditor: React.FC<{
  maxWidth: number;
  maxHeight: number;
  value: IBox;
  prefix?: string;
  onChange(value: IBox): void;
  onlyCoordinate?: boolean;
  onlyDimensions?: boolean;
}> = ({
  maxWidth,
  maxHeight,
  value,
  onChange,
  prefix = '',
  onlyDimensions = false,
  onlyCoordinate = false,
}) => {
  return (
    <>
      {!onlyDimensions && (
        <>
          <Grid item>
            <SliderWithInput
              label={`${prefix}Distance from Left`}
              icon={<AiOutlineFunction />}
              min={0}
              max={maxWidth}
              value={value.left}
              onChange={left => onChange({ ...value, left })}
            />
          </Grid>

          <Grid item>
            <SliderWithInput
              label={`${prefix}Distance from Top`}
              icon={<AiOutlineFunction />}
              min={0}
              max={maxHeight}
              value={value.top}
              onChange={top => onChange({ ...value, top })}
            />
          </Grid>
        </>
      )}

      {!onlyCoordinate && (
        <>
          <Grid item>
            <SliderWithInput
              label={`${prefix}Area Width`}
              icon={<AiOutlineColumnWidth />}
              min={0}
              max={maxWidth}
              value={value.width}
              onChange={width => onChange({ ...value, width })}
            />
          </Grid>

          <Grid item>
            <SliderWithInput
              label={`${prefix}Area Height`}
              icon={<AiOutlineLineHeight />}
              min={0}
              max={maxHeight}
              value={value.height}
              onChange={height => onChange({ ...value, height })}
            />
          </Grid>
        </>
      )}
    </>
  );
};

const SliderWithInput: React.FC<
  {
    label: string;
    hideLabel?: boolean;
    icon: React.ReactChild;
    value: number;
    onChange(value: number): void;
  } & Omit<SliderProps, 'onChange'>
> = ({ label, hideLabel, icon, value, onChange, ...inputProps }) => {
  const id = useUniqueId();
  return (
    <>
      <Typography gutterBottom id={id} style={{ display: hideLabel ? 'none' : undefined }}>
        {label}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item>{icon}</Grid>
        <Grid item xs>
          <Slider
            {...inputProps}
            value={typeof value === 'number' ? value : 0}
            onChange={(_evt, value) => onChange(value as number)}
            aria-labelledby={id}
          />
        </Grid>
        <Grid item>
          <Input
            value={value}
            onChange={evt => onChange(Number(evt.target.value))}
            style={{ width: 60 }}
            margin="dense"
            inputProps={{
              type: 'number',
              min: inputProps.min,
              max: inputProps.max,
              'aria-labelledby': id,
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};
