"use client";

import { dummyMeetings, type Meeting } from "@/data/dummyMeetings";

const STORAGE_KEY = "career-scope-meetings";

export function loadStoredMeetings() {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as Meeting[];
  } catch {
    return [];
  }
}

export function loadAllMeetings() {
  return [...dummyMeetings, ...loadStoredMeetings()];
}

export function saveMeeting(meeting: Meeting) {
  const meetings = loadStoredMeetings();
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify([meeting, ...meetings]));
}
