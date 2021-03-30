import {
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  AiFillEdit,
  AiOutlineDollarCircle,
  AiOutlineGithub,
  AiOutlinePrinter,
  AiOutlineRight,
  AiOutlineShareAlt,
} from 'react-icons/ai';
import { Dataset, IConfiguration } from './configuration';
import { ConfigurationUI } from './configuration-ui';
import { moderna, pfizer } from './data';
import { Canvas, Display, FontLoader } from './display';
import { barcode85By11 } from './favorites';
import './index.css';
import { drawerOpenByDefault, useStyles } from './theme';

const params = new URLSearchParams(window.location.search);
const serializeConfig = (config: IConfiguration) => encodeURIComponent(JSON.stringify(config));

const Root: React.FC = () => {
  const classes = useStyles();
  const [config, setConfig] = useState(() => {
    try {
      return JSON.parse(decodeURIComponent(params.get('c')!)) || barcode85By11(params);
    } catch {
      return barcode85By11(params);
    }
  });

  const shareUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.search = `?c=${serializeConfig(config)}`;
    return url.toString();
  }, [config]);

  const dataset = config.dataset === Dataset.Pfizer ? pfizer : moderna;
  const [drawerOpen, setDrawerOpen] = useState(drawerOpenByDefault);

  if (params.has('isolated')) {
    return (
      <>
        <FontLoader config={config} />
        <Display scaled data={dataset} config={config} />
      </>
    );
  }

  return (
    <>
      <FontLoader config={config} />

      <Button
        variant="contained"
        color="primary"
        className="editButton"
        onClick={() => setDrawerOpen(true)}
        endIcon={<AiFillEdit />}
      >
        Edit
      </Button>

      <Drawer
        variant="persistent"
        anchor="right"
        open={drawerOpen}
        classes={{ paper: classes.drawerPaper }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <AiOutlineRight />
          </IconButton>
        </div>
        <Divider />
        <ConfigurationUI value={config} onChange={setConfig} />
        <List>
          <ListItem
            button
            onClick={() => window.open('https://www.redbubble.com/people/connor4312/shop')}
          >
            <ListItemIcon>
              <AiOutlineDollarCircle />
            </ListItemIcon>
            <ListItemText primary="Posters" />
          </ListItem>
          <ListItem
            button
            onClick={() => prompt('Copy the below URL to share your design:', shareUrl)}
          >
            <ListItemIcon>
              <AiOutlineShareAlt />
            </ListItemIcon>
            <ListItemText primary="Copy URL" />
          </ListItem>
          <ListItem button onClick={() => window.open(`${shareUrl}&isolated`)}>
            <ListItemIcon>
              <AiOutlinePrinter />
            </ListItemIcon>
            <ListItemText primary="Print" />
          </ListItem>
          <ListItem button onClick={() => window.open(`https://github.com/connor4312/covid-img`)}>
            <ListItemIcon>
              <AiOutlineGithub />
            </ListItemIcon>
            <ListItemText primary="Source Code" />
          </ListItem>
        </List>
      </Drawer>
      <Canvas data={dataset} config={config} />
    </>
  );
};

const container = document.createElement('div');
document.body.appendChild(container);
ReactDOM.render(<Root />, container);
