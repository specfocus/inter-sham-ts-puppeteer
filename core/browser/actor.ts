import type { Browser } from 'puppeteer';
import { Shape } from '@specfocus/main-focus/types/any';
import type {
  AlertAction,
  AsyncAction,
  ClickAction,
  PrintAction,
  ReadyAction,
  RouteAction,
  SwipeAction,
  VoiceAction,
  WatchAction,
  WriteAction
} from '../../actions';
import { Actor } from '@specfocus/main-focus/actions/core/actor';
import { PageActor } from '../page/actor';

export type Input = AlertAction | AsyncAction | ClickAction | PrintAction | RouteAction | SwipeAction | VoiceAction | WatchAction | WriteAction;
export type Output = AlertAction | ReadyAction;

export type CommandReact = (params: Shape) => AsyncIterable<Output>

export interface BrowserActor extends Actor<Input, Output> {
  browser: Browser | undefined;
  commands: Map<string, CommandReact>;
  pages: Map<string[], PageActor>;
  close(): Promise<void>;
}
