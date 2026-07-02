const PREFIX = 'dindin_gourmet_v1__';

export const storageGet = <T = any>(key: string, fallback: T | null = null): T | null => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error('storageGet error', e);
    return fallback;
  }
};

export const storageSet = (key: string, value: any) => {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('storageSet error', e);
  }
};

export const storageRemove = (key: string) => {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch (e) {
    console.error('storageRemove error', e);
  }
};

export default { get: storageGet, set: storageSet, remove: storageRemove };
