import { exec, execFile, fork, spawn } from 'child_process';

const PORT = 9999;

function start(command: string, args: string[]) {
  const execProcess = spawn(command, args);
  console.log('spawn');
  console.log(execProcess.spawnfile);
  return new Promise((resolve, reject) => {
    execProcess.on('spawn', () => {
      console.log('spawn on spawn');
    });
    execProcess.stdout.on('data', (data) => {
      console.log(`spawn stdout: ${data}`);
    });
    execProcess.stderr.on('data', (data) => {
        console.log(`spawn on error ${data}`);
    });
    execProcess.on('exit', (code, signal) => {
      resolve(code);
      console.log(`spawn on exit code: ${code} signal: ${signal}`);
    });
    execProcess.on('close', (code: number, args: any[])=> {
      resolve(code);
      console.log(`spawn on close code: ${code} args: ${args}`);
    });
  });
}

const startServer = async () => {
  return start('ts-node', ['server.ts']);
};


describe('sham server', () => {
  it('should start server', async () => {
    const code = await startServer();
    expect(code).toBe(1);
  });
});