import { promises as fs } from 'fs';
import path from 'path';
import { AppState } from './types';

const seedFilePath = path.join(process.cwd(), 'data', 'state.json');
const filePath = process.env.NODE_ENV === 'production' ? '/tmp/lelita-state.json' : seedFilePath;
let queue: Promise<unknown> = Promise.resolve();
let initPromise: Promise<void> | null = null;

const ensureStateFile = async (): Promise<void> => {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await fs.access(filePath);
        return;
      } catch {
        // Si no existe, se inicializa abajo.
      }

      await fs.mkdir(path.dirname(filePath), { recursive: true });

      let seedRaw = '{"users":{},"resetCodes":{},"phrase":"Cada día contigo es una historia hermosa.","theme":"day","media":[],"letters":[],"chat":[]}';
      try {
        seedRaw = await fs.readFile(seedFilePath, 'utf-8');
      } catch {
        // Fallback mínimo para ambientes donde no exista el archivo semilla.
      }

      await fs.writeFile(filePath, seedRaw, 'utf-8');
    })();
  }

  return initPromise;
};

const readState = async (): Promise<AppState> => {
  await ensureStateFile();
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw) as AppState;
};

const writeState = async (nextState: AppState): Promise<void> => {
  await ensureStateFile();
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
