import { EqualizerBand } from '../types';

class AudioService {
  private audioContext: AudioContext | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private filterNodes: BiquadFilterNode[] = [];
  private audioBuffer: AudioBuffer | null = null;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private isPlaying: boolean = false;

  // Default Bands
  private bands: EqualizerBand[] = [
    { frequency: 60, gain: 0, type: 'lowshelf', label: '60Hz' },
    { frequency: 170, gain: 0, type: 'peaking', label: '170Hz' },
    { frequency: 310, gain: 0, type: 'peaking', label: '310Hz' },
    { frequency: 600, gain: 0, type: 'peaking', label: '600Hz' },
    { frequency: 1000, gain: 0, type: 'peaking', label: '1kHz' },
    { frequency: 3000, gain: 0, type: 'peaking', label: '3kHz' },
    { frequency: 6000, gain: 0, type: 'peaking', label: '6kHz' },
    { frequency: 12000, gain: 0, type: 'peaking', label: '12kHz' },
    { frequency: 14000, gain: 0, type: 'peaking', label: '14kHz' },
    { frequency: 16000, gain: 0, type: 'highshelf', label: '16kHz' },
  ];

  constructor() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass();
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.gainNode = this.audioContext.createGain();
    
    // Initialize filters
    this.rebuildFilterGraph();
  }

  private rebuildFilterGraph() {
    if (!this.audioContext || !this.gainNode || !this.analyserNode) return;

    // Disconnect existing
    this.filterNodes.forEach(node => node.disconnect());
    this.filterNodes = [];

    let previousNode: AudioNode | null = null;

    this.bands.forEach((band) => {
      const filter = this.audioContext!.createBiquadFilter();
      filter.type = band.type;
      filter.frequency.value = band.frequency;
      filter.gain.value = band.gain;
      
      this.filterNodes.push(filter);

      if (previousNode) {
        previousNode.connect(filter);
      }
      previousNode = filter;
    });

    // Connect chain: Source -> Filter[0] -> ... -> Filter[N] -> Gain -> Analyser -> Destination
    // Connection happens when source starts, here we just set up the chain
    if (this.filterNodes.length > 0) {
        const lastFilter = this.filterNodes[this.filterNodes.length - 1];
        lastFilter.connect(this.gainNode);
    }
    this.gainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);
  }

  async loadFile(file: File): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error("AudioContext not initialized");
    const arrayBuffer = await file.arrayBuffer();
    this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    return this.audioBuffer;
  }

  play(offset: number = 0) {
    if (!this.audioContext || !this.audioBuffer) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    if (this.isPlaying) {
      this.stop();
    }

    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;

    // Connect source to first filter
    if (this.filterNodes.length > 0) {
      this.sourceNode.connect(this.filterNodes[0]);
    } else {
      this.sourceNode.connect(this.gainNode!);
    }

    this.startTime = this.audioContext.currentTime - offset;
    this.sourceNode.start(0, offset);
    this.isPlaying = true;

    this.sourceNode.onended = () => {
       // Handle natural end if needed
    };
  }

  pause() {
    if (!this.isPlaying || !this.sourceNode || !this.audioContext) return;
    this.sourceNode.stop();
    this.pauseTime = this.audioContext.currentTime - this.startTime;
    this.isPlaying = false;
    this.sourceNode = null;
  }

  stop() {
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
      } catch (e) { /* ignore if already stopped */ }
      this.sourceNode = null;
    }
    this.pauseTime = 0;
    this.isPlaying = false;
  }

  seek(time: number) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      this.stop();
    }
    this.pauseTime = time;
    if (wasPlaying) {
      this.play(time);
    }
  }

  setGain(bandIndex: number, value: number) {
    if (this.filterNodes[bandIndex]) {
      this.filterNodes[bandIndex].gain.value = value;
      this.bands[bandIndex].gain = value;
    }
  }

  getBands() {
    return this.bands;
  }

  getAnalyser() {
    return this.analyserNode;
  }

  getDuration() {
    return this.audioBuffer ? this.audioBuffer.duration : 0;
  }

  getCurrentTime() {
    if (!this.isPlaying || !this.audioContext) return this.pauseTime;
    return Math.min(this.audioContext.currentTime - this.startTime, this.getDuration());
  }

  getRawBuffer(): AudioBuffer | null {
    return this.audioBuffer;
  }

  // Export processed audio (Offline Rendering)
  async exportProcessedAudio(): Promise<Blob | null> {
    if (!this.audioBuffer) return null;

    const offlineCtx = new OfflineAudioContext(
      this.audioBuffer.numberOfChannels,
      this.audioBuffer.length,
      this.audioBuffer.sampleRate
    );

    // Recreate source
    const source = offlineCtx.createBufferSource();
    source.buffer = this.audioBuffer;

    // Recreate filter chain
    let previousNode: AudioNode = source;

    this.bands.forEach(band => {
      const filter = offlineCtx.createBiquadFilter();
      filter.type = band.type;
      filter.frequency.value = band.frequency;
      filter.gain.value = band.gain;
      previousNode.connect(filter);
      previousNode = filter;
    });

    previousNode.connect(offlineCtx.destination);
    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();
    return this.bufferToWave(renderedBuffer, renderedBuffer.length);
  }

  // Helper to convert AudioBuffer to WAV Blob
  private bufferToWave(abuffer: AudioBuffer, len: number) {
    const numOfChan = abuffer.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded in this parser)

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for(i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));

    while(pos < len) {
      for(i = 0; i < numOfChan; i++) {
        // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
        view.setInt16(44 + offset, sample, true);
        offset += 2;
      }
      pos++;
    }

    return new Blob([buffer], {type: "audio/wav"});

    function setUint16(data: any) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: any) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  }
}

export const audioService = new AudioService();
