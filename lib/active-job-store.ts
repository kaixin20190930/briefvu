import type { TemporaryJob } from "./types";

export const ACTIVE_JOB_KEY = "threadline_active_job_v1";
const SESSION_JOB_KEY = "threadline_session_job_v1";
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedJob: TemporaryJob | null = null;

function isBrowser() {
  return typeof window !== "undefined";
}

function readRaw() {
  if (!isBrowser()) return null;
  return sessionStorage.getItem(SESSION_JOB_KEY) ?? localStorage.getItem(ACTIVE_JOB_KEY);
}

function removeExpired(job: TemporaryJob) {
  if (new Date(job.expiresAt).getTime() > Date.now()) return false;
  sessionStorage.removeItem(SESSION_JOB_KEY);
  localStorage.removeItem(ACTIVE_JOB_KEY);
  return true;
}

export function getActiveJobSnapshot(): TemporaryJob | null {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedJob;
  cachedRaw = raw;
  if (!raw) {
    cachedJob = null;
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as TemporaryJob;
    if (removeExpired(parsed)) {
      cachedRaw = null;
      cachedJob = null;
      return null;
    }
    cachedJob = parsed;
    return cachedJob;
  } catch {
    sessionStorage.removeItem(SESSION_JOB_KEY);
    localStorage.removeItem(ACTIVE_JOB_KEY);
    cachedRaw = null;
    cachedJob = null;
    return null;
  }
}

export function getServerJobSnapshot() {
  return null;
}

export function subscribeToActiveJob(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  cachedRaw = undefined;
  listeners.forEach((listener) => listener());
}

export function saveActiveJob(job: TemporaryJob) {
  const serialized = JSON.stringify(job);
  if (job.persistence === "local") {
    localStorage.setItem(ACTIVE_JOB_KEY, serialized);
    sessionStorage.removeItem(SESSION_JOB_KEY);
  } else {
    sessionStorage.setItem(SESSION_JOB_KEY, serialized);
    localStorage.removeItem(ACTIVE_JOB_KEY);
  }
  emit();
}

export function clearActiveJob() {
  sessionStorage.removeItem(SESSION_JOB_KEY);
  localStorage.removeItem(ACTIVE_JOB_KEY);
  emit();
}

export function extendJobExpiry(job: TemporaryJob) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return { ...job, updatedAt: new Date().toISOString(), expiresAt };
}
