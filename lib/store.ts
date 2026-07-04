import { promises as fs } from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import { AppState } from './types';

const seedFilePath = path.join(process.cwd(), 'data', 'state.json');
const mongoUri = process.env.MONGODB_URI;
const database = process.env.MONGODB_DB || 'lelita';
const collection = process.env.MONGODB_COLLECTION || 'app_state';
const stateDocumentId = process.env.MONGODB_STATE_ID || 'singleton';

let queue: Promise<unknown> = Promise.resolve();
let initPromise: Promise<void> | null = null;
let mongoClientPromise: Promise<MongoClient> | null = null;

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

const assertMongoEnv = () => {
  if (!mongoUri) {
    throw new Error('Falta MONGODB_URI. Configura tu connection string de MongoDB Atlas en Vercel.');
  }
};

const getMongoClient = async (): Promise<MongoClient> => {
  assertMongoEnv();

  if (!mongoClientPromise) {
    mongoClientPromise = new MongoClient(mongoUri as string).connect();
  }

  return mongoClientPromise;
};

const getMongoCollection = async () => {
  const client = (await getMongoClient()) as {
    db: (name: string) => {
      collection: <T>(name: string) => {
        updateOne: (filter: Record<string, unknown>, update: Record<string, unknown>, options?: Record<string, unknown>) => Promise<unknown>;
        findOne: (filter: Record<string, unknown>) => Promise<(Partial<T> & { _id?: string }) | null>;
      };
    };
  };

  return client.db(database).collection<AppState>(collection);
};

const ensureMongoState = async (): Promise<void> => {
  const seed = await loadSeedState();
  const col = await getMongoCollection();

  await col.updateOne(
    { _id: stateDocumentId },
    {
      $setOnInsert: {
        ...seed,
        _id: stateDocumentId,
        updatedAt: new Date().toISOString()
      }
    },
    { upsert: true }
  );
};

const ensureState = async (): Promise<void> => {
  if (!initPromise) {
    initPromise = ensureMongoState();
  }

  await initPromise;
};

const readState = async (): Promise<AppState> => {
  await ensureState();

  const col = await getMongoCollection();
  const doc = await col.findOne({ _id: stateDocumentId });

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

  const col = await getMongoCollection();

  await col.updateOne(
    { _id: stateDocumentId },
    {
      $set: {
        ...nextState,
        updatedAt: new Date().toISOString()
      }
    },
    { upsert: true }
  );
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
