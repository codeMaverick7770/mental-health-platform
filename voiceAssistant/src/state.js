import { AdminReporting } from './admin-reporting.js';

// Shared in-memory state for the voice assistant service
export const sessions = new Map();
export const adminReporting = new AdminReporting();

// Simple in-memory pub/sub for realtime dashboard updates
export const realtimeEvents = [];
export function pushRealtime(event) {
  const e = { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, ts: new Date().toISOString(), ...event };
  realtimeEvents.push(e);
  if (realtimeEvents.length > 200) realtimeEvents.splice(0, realtimeEvents.length - 200);
  return e;
}


