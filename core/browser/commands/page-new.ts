import { done, fail, init } from '@specfocus/main-focus/actions/alert';
import { action } from '@specfocus/main-focus/actions/core/action';
import type { ReadyAction } from '@specfocus/main-focus/actions/ready';
import { Shape } from '@specfocus/main-focus/types/any';
import { READY } from '../../../actions';
import PagePipeline from '../../page';
import type { BrowserActor, Output } from '../actor';
import launch from './browser-launch';

export const PAGE = 'page';
export const PAGE_NEW = 'page_new';
export const PAGE_NEW_INIT = 'page_new_init';
export const PAGE_NEW_DONE = 'page_new_done';
export const PAGE_NEW_ERROR = 'page_new_error';

export default async function* (this: BrowserActor, params: Shape): AsyncGenerator<Output, void, undefined> {
  // precondition
  let browser = this._browser;
  for (; !browser; browser = this._browser) {
     for await (const output of launch.bind(this)({ })) {
       yield output;
     }
  }

  if (!browser) {
    yield fail(PAGE_NEW_ERROR, this);
    return;
  }

  yield init(PAGE_NEW_INIT, this);

  try {
    const page = await browser.newPage();
    const actor = PagePipeline.create(this, page);
    const client = page.client();
    const path = [...this.path, client.id()];
    this.pages.set(path, actor);

    yield done(PAGE_NEW_DONE, 1, this);
    yield action<ReadyAction>(READY, { what: PAGE }, { path });
  } catch (e) {
    yield fail(PAGE_NEW_ERROR, this);
  }
}