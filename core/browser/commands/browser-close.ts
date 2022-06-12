import { done, fail, init, skip } from '@specfocus/main-focus/actions/alert';
import { Shape } from '@specfocus/main-focus/types/any';
import type { BrowserActor, Output } from '../actor';

const BROWSER_CLOSE = 'browser_close';

export default async function* (this: BrowserActor, params: Shape): AsyncGenerator<Output, void, unknown> {
  yield init(BROWSER_CLOSE, this);

  if (!this._browser) {
    yield skip(BROWSER_CLOSE, this);
    return;
  }

  try {
    this.close();

    yield done(BROWSER_CLOSE, 1, this);
  } catch(e) {
    yield fail(BROWSER_CLOSE, this);
  }
};