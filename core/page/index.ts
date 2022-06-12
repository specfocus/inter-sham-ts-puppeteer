import { nanoid } from 'nanoid/non-secure'
import type { AlertAction, ShamAction as Action } from '../../actions';
import Pipeline, { ExecutionOptions } from '@specfocus/main-focus/async/pipeline';
import { Page } from 'puppeteer';
import {
  ALERT,
  ASYNC,
  CLICK,
  PRINT,
  READY,
  ROUTE,
  WRITE,
} from '../../actions/index';
import { BrowserActor } from '../browser/actor';
import { PageActor } from './actor';

type Abort = AlertAction;
type Heartbeat = AlertAction;
type Timeout = AlertAction;

const PAGE_ACTIONS = [CLICK, PRINT, ROUTE, WRITE] as const;

type Input = Action;
type Output = Action;

const processor = async function* (this: PagePipeline, input: Input): AsyncGenerator<Output, void, undefined> {
  const { path } = input;
  switch (input.type) {
    case CLICK:
      break;
    case PRINT:
      break;
    case ROUTE:
      break;
    case WRITE:
      break;
  }
}

// TODO: Multiplexer wont work it is more of an AsyncQueue or Actor implementation
export default class PagePipeline extends Pipeline<Input, Output, Abort, Heartbeat, Timeout> implements PageActor {
  static create(browser: BrowserActor, page: Page) {
    const id = nanoid();
    const root = [browser.id, id];
    const abort: Abort = {
      root,
      type: ALERT,
      what: {
          type: 'quit',
          why: 'abort',
      },
    };

    const heartbeat: Heartbeat = {
      root,
      type: ALERT,
      what: {
          type: 'idle',
      },
    };

    const timeout: Timeout = {
      root,
      type: ALERT,
      what: {
          type: 'quit',
          why: 'timeout',
      },
    };
    const controller = new AbortController();
    return new PagePipeline(
      id,
      page,
      controller,
      [],
      {
        abort: [controller.signal, abort],
        heartbeat: [5, heartbeat],
        timeout: [60, timeout]
      }
    )
  }
  constructor(
    public readonly id: string,
    public readonly page: Page,
    public readonly controller: AbortController,
    queue: Input[],
    options: ExecutionOptions<Abort, Heartbeat, Timeout>
  ) {
    super(queue, processor, options);
  }

  public readonly consume = async (...actions: Action[]): Promise<void> => {
    for (const action of actions) {
      if (this.controller?.signal?.aborted) {
        break;
      }

      const { type, ...params } = action;
      if (action.type === ASYNC) {
        const { command, params } = action.what;
        const { [command]: execute } = this.commands;
        if (execute) {
          this.append(execute(params));
          continue;
        }

        if (action.root) {
          const { [action.root]: page } = this.pages;
          // forward to existing page
          if (page) {
            page.consume(action);
          }
        } else {
          // alert?
        }
      }
    }
  };
}
