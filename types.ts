export interface EqualizerBand {
  frequency: number;
  gain: number;
  type: 'lowshelf' | 'peaking' | 'highshelf';
  label: string;
}

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  fileName: string | null;
  fileSize: string | null;
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface GeneratedAudio {
  url: string;
  blob: Blob;
  description: string;
}
