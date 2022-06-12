import createServer from '@specfocus/node-focus/server';
import { APPLICATION_JSON } from '@specfocus/node-focus/server/handler';
import middleware from '@specfocus/node-focus/actions/middleware';
import BrowserRouter from './core/browser';

const controller = new AbortController();
createServer(Number(process.env.port) || 9000, {
  [APPLICATION_JSON]: middleware.bind([BrowserRouter.create(controller)])
}).on('error', (err) => {
  controller.abort(err);
});
