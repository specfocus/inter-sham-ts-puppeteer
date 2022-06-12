import { CommandReact } from '../actor';
import launch, { BROWSER_LAUNCH } from './browser-launch';
import page, { PAGE_NEW } from './page-new';

const commands = new Map<string, CommandReact>([
  [BROWSER_LAUNCH, launch],
  [PAGE_NEW, page],
]);

export default commands;
