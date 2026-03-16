import { promises as fs } from 'fs';
import path from 'path';
import { AppState } from './types';

const seedFilePath = path.join(process.cwd(), 'data', 'state.json');
const dataApiUrl = process.env.MONGODB_DATA_API_URL;
const dataApiKey = process.env.MONGODB_DATA_API_KEY;
const dataSource = process.env.MONGODB_DATA_SOURCE || 'Cluster0';
const database = process.env.MONGODB_DB || 'lelita';
const collection = process.env.MONGODB_COLLECTION || 'app_state';
const stateDocumentId = process.env.MONGODB_STATE_ID || 'singleton';

let queue: Promise<unknown> = Promise.resolve();
let initPromise: Promise<void> | null = null;

const defaultState: AppState = {
  users: {},
  resetCodes: {},
  phrase: 'Cada día contigo es una historia hermosa.',
  theme: 'day',
  media: [],
  letters: [],
  chat: []
};

const deepCloneState = (state: AppState): AppState => JSON.parse(JSON.stringify(state)) as AppState;

const loadSeedState = async (): Promise<AppState> => {
  try {
    const raw = await fs.readFile(seedFilePath, 'utf-8');
    return JSON.parse(raw) as AppState;
  } catch {
    return deepCloneState(defaultState);
  }
};

const assertDataApiEnv = () => {
  if (!dataApiUrl || !dataApiKey) {
    throw new Error('Faltan MONGODB_DATA_API_URL o MONGODB_DATA_API_KEY. Configura MongoDB Atlas Data API en Vercel.');
  }
};

const dataApiRequest = async <T>(action: 'findOne' | 'updateOne', body: Record<string, unknown>): Promise<T> => {
  assertDataApiEnv();

  const response = await fetch(`${dataApiUrl}/action/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': dataApiKey as string
    },
    body: JSON.stringify({
      dataSource,
      database,
      collection,
      ...body
    }),
    cache: 'no-store'
  });

  const json = (await response.json()) as T & { error?: string; error_code?: string };

  if (!response.ok || json.error) {
    throw new Error(json.error || `MongoDB Data API error (${response.status}).`);
  }

  return json;
};

const ensureMongoState = async (): Promise<void> => {
  const seed = await loadSeedState();

  await dataApiRequest<{ matchedCount?: number; modifiedCount?: number; upsertedId?: string }>('updateOne', {
    filter: { _id: stateDocumentId },
    update: {
      $setOnInsert: {
        ...seed,
        _id: stateDocumentId,
        updatedAt: new Date().toISOString()
      }
    },
    upsert: true
  });
};

const ensureState = async (): Promise<void> => {
  if (!initPromise) {
    initPromise = ensureMongoState();
  }

  await initPromise;
};

const readState = async (): Promise<AppState> => {
  await ensureState();

  const data = await dataApiRequest<{ document?: Partial<AppState> }>('findOne', {
    filter: { _id: stateDocumentId }
  });

  const doc = data.document;
  if (!doc) {
    throw new Error('No se pudo inicializar/leer el estado desde MongoDB Atlas.');
  }

  return {
    users: doc.users || {},
    resetCodes: doc.resetCodes || {},
    phrase: doc.phrase || defaultState.phrase,
    theme: doc.theme === 'night' ? 'night' : 'day',
    media: doc.media || [],
    letters: doc.letters || [],
    chat: doc.chat || []
  };
};

const writeState = async (nextState: AppState): Promise<void> => {
  await ensureState();

  await dataApiRequest<{ matchedCount?: number; modifiedCount?: number }>('updateOne', {
    filter: { _id: stateDocumentId },
    update: {
      $set: {
        ...nextState,
        updatedAt: new Date().toISOString()
      }
    },
    upsert: true
  });
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
