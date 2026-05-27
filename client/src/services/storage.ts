const STORAGE_KEYS = {
  token: "dymini_token",
  anonymousId: "dymini_anon_id",
  audioEnabled: "dymini_audio_enabled",
} as const;

export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.token);
}

export function setToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.token, token);
}

export function getAnonymousId(): string {
  const existing = localStorage.getItem(STORAGE_KEYS.anonymousId);
  if (existing) {
    return existing;
  }

  const created = `anon_${crypto.randomUUID().slice(0, 8)}`;
  localStorage.setItem(STORAGE_KEYS.anonymousId, created);
  return created;
}

export function getAudioEnabled(): boolean {
  const value = localStorage.getItem(STORAGE_KEYS.audioEnabled);
  return value === null ? true : value === "true";
}

export function setAudioEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEYS.audioEnabled, String(enabled));
}
