import { create } from "zustand";
import { TRANSMISSIONS } from "@/lib/temple-content";

export type RadioTrack = {
  id: string;
  path: string;
  title: string;
  src: string;
  length: string;
};

type RadioState = {
  tracks: RadioTrack[];
  index: number;
  playing: boolean;
  progress: number;
  duration: number;
  setTracks: (tracks: RadioTrack[]) => void;
  playAt: (index: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
  setProgress: (n: number) => void;
  setDuration: (n: number) => void;
};

const starter = TRANSMISSIONS.map((t) => ({ ...t }));

export const useRadio = create<RadioState>((set, get) => ({
  tracks: starter,
  index: 0,
  playing: false,
  progress: 0,
  duration: 0,
  setTracks: (tracks) => set({ tracks: tracks.length ? tracks : get().tracks }),
  playAt: (index) => set({ index, playing: true, progress: 0 }),
  toggle: () => set({ playing: !get().playing }),
  next: () => {
    const total = get().tracks.length || 1;
    set({ index: (get().index + 1) % total, playing: true, progress: 0 });
  },
  prev: () => {
    const total = get().tracks.length || 1;
    set({ index: (get().index - 1 + total) % total, playing: true, progress: 0 });
  },
  stop: () => set({ playing: false, progress: 0 }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
}));

export function withHouseAudio(rows: { id: string; title: string; path_label: string }[]): RadioTrack[] {
  return [
    ...TRANSMISSIONS.map((t) => ({ ...t })),
    ...rows.map((row) => ({
      id: row.id,
      path: row.path_label,
      title: row.title,
      src: `/api/audio/${row.id}`,
      length: "House",
    })),
  ];
}

export function currentTransmission(index: number) {
  const tracks = useRadio.getState().tracks;
  return tracks[index] ?? tracks[0];
}
