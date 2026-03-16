import { promises as fs } from 'fs';
import path from 'path';
import { AppState } from './types';

const filePath = path.join(process.cwd(), 'data', 'state.json');
let queue: Promise<unknown> = Promise.resolve();

const readState = async (): Promise<AppState> => {
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw) as AppState;
};

const writeState = async (nextState: AppState): Promise<void> => {
  await fs.writeFile(filePath, JSON.stringify(nextState, null, 2), 'utf-8');
};

export const withState = async <T>(fn: (state: AppState) => T | Promise<T>): Promise<T> => {
  const resultPromise = queue.then(async () => {
    const state = await readState();
    const result = await fn(state);
    await writeState(state);
    return result;
  });

  queue = resultPromise.then(() => undefined, () => undefined);
  return resultPromise;
};

export const getState = readState;
