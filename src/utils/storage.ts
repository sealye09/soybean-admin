import { createLocalforage, createStorage } from '@sa/utils';
import type { StorageType } from '@/typings/storage';

export const localStg = createStorage<StorageType.Local>('local');

export const sessionStg = createStorage<StorageType.Session>('session');

export const localforage = createLocalforage<StorageType.Local>('local');
