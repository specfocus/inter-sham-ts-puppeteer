import type { RouterOptions } from '@specfocus/main-focus/actions/core/router';
import AbstractRouter from '@specfocus/main-focus/actions/core/router';
import { Shape } from '@specfocus/main-focus/types/any';
import { nanoid } from 'nanoid/non-secure';
import type { Browser } from 'puppeteer';
import { ASYNC } from '../../actions';
import { PageActor } from '../page/actor';
import { BrowserActor, CommandReact, Input, Output } from './actor';
import COMMANDS from './commands';

// tslint:disable-next-line:no-empty-interface
interface BrowserOptions extends RouterOptions {
}

export default class BrowserRouter extends AbstractRouter<Input, Output> implements BrowserActor {
  static create(
    root: string[],
    controller: AbortController
  ): BrowserRouter {
    const path = [...root, nanoid()];
    return new BrowserRouter(controller, AbstractRouter.options(path, controller));
  }

  private _browser?: Browser;
  private readonly _pages = new Map<string[], PageActor>();

  constructor(
    public readonly controller: AbortController,
    options: BrowserOptions
  ) {
    super(new Map(), options);
  }

  get browser(): Browser | undefined {
    return this._browser;
  }

  set browser(value: Browser | undefined) {
    this._browser = value;
  }

  get commands(): Map<string, CommandReact> {
    return COMMANDS;
  }

  get pages(): Map<string[], PageActor> {
    return this._pages;
  }

  protected beforeBroadcast = (action: Input): boolean => !this.consume(action);

  protected beforeReject = (action: Input): boolean => true;

  protected beforeResolve = (action: Input): boolean => !this.consume(action);

  public readonly close = (): Promise<void> => {
    /*
    if (!this.controller.signal.aborted) {
      this.controller.abort();
    }
    */
    const browser = this._browser;
    delete this._browser;

    if (!browser) {
      return Promise.resolve();
    }

    return browser.close();
  }

  private readonly consume = (action: Input): boolean => {
      const { type } = action;
    if (type === ASYNC) {
      const { command, params } = action.what;
      return this.onCommand(command, params);
    }
    return false;
  }

  protected onCommand = (command: any, params: Shape): boolean => {
    const react = COMMANDS.get(command);
    if (react) {
      this.append(react(params));
      return true;
    }
    return false;
  };
}
