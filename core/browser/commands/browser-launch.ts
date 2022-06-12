import { done, fail, init } from '@specfocus/main-focus/actions/alert';
import { action } from '@specfocus/main-focus/actions/core/action';
import type { ReadyAction } from '@specfocus/main-focus/actions/ready';
import { Shape } from '@specfocus/main-focus/types/any';
import { launch } from 'puppeteer';
import { READY } from '../../../actions';
import type { BrowserActor, Output } from '../actor';

export const BROWSER = 'browser';
export const BROWSER_LAUNCH = 'browser_launch';

export default async function* (this: BrowserActor, params: Shape): AsyncGenerator<Output, void, undefined> {
  yield init(BROWSER_LAUNCH, this);

  try {
    this.browser = await launch(params);

    yield done(BROWSER_LAUNCH, 1, this);

    yield action<ReadyAction>(READY, { what: BROWSER_LAUNCH }, this);
  } catch(e) {
    yield fail(BROWSER_LAUNCH, this);
  }
};
