// Audio playback helper for Gemini TTS WAV audio

class AudioManager {
  private audio: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;
  private onStateChange: ((state: AudioState) => void) | null = null;

  public state: AudioState = {
    isPlaying: false,
    isLoading: false,
    duration: 0,
    currentTime: 0,
    error: null,
  };

  public subscribe(listener: (state: AudioState) => void): () => void {
    this.onStateChange = listener;
    listener(this.state);
    return () => {
      if (this.onStateChange === listener) {
        this.onStateChange = null;
      }
    };
  }

  private update(newState: Partial<AudioState>) {
    this.state = { ...this.state, ...newState };
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  public async playBase64Wav(base64Wav: string) {
    this.stop();
    try {
      this.update({ isLoading: true, error: null });

      const byteCharacters = atob(base64Wav);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/wav' });

      if (this.currentUrl) {
        URL.revokeObjectURL(this.currentUrl);
      }
      this.currentUrl = URL.createObjectURL(blob);

      const audio = new Audio(this.currentUrl);
      this.audio = audio;

      audio.onloadedmetadata = () => {
        this.update({ duration: audio.duration || 0, isLoading: false });
      };

      audio.ontimeupdate = () => {
        this.update({ currentTime: audio.currentTime });
      };

      audio.onplay = () => {
        this.update({ isPlaying: true });
      };

      audio.onpause = () => {
        this.update({ isPlaying: false });
      };

      audio.onended = () => {
        this.update({ isPlaying: false, currentTime: 0 });
      };

      audio.onerror = () => {
        this.update({
          isPlaying: false,
          isLoading: false,
          error: '音频播放失败，请重试',
        });
      };

      await audio.play();
      this.update({ isPlaying: true, isLoading: false });
    } catch (err: any) {
      console.error('Playback error:', err);
      this.update({
        isPlaying: false,
        isLoading: false,
        error: err.message || '播放出错',
      });
    }
  }

  public async playAudioUrl(url: string) {
    this.stop();
    try {
      this.update({ isLoading: true, error: null });
      this.currentUrl = url;

      const audio = new Audio(url);
      this.audio = audio;

      audio.onloadedmetadata = () => {
        this.update({ duration: audio.duration || 0, isLoading: false });
      };

      audio.ontimeupdate = () => {
        this.update({ currentTime: audio.currentTime });
      };

      audio.onplay = () => {
        this.update({ isPlaying: true });
      };

      audio.onpause = () => {
        this.update({ isPlaying: false });
      };

      audio.onended = () => {
        this.update({ isPlaying: false, currentTime: 0 });
      };

      audio.onerror = () => {
        this.update({
          isPlaying: false,
          isLoading: false,
          error: '音频加载或播放失败，请重试',
        });
      };

      await audio.play();
      this.update({ isPlaying: true, isLoading: false });
    } catch (err: any) {
      console.error('Audio url error:', err);
      this.update({
        isPlaying: false,
        isLoading: false,
        error: err.message || '播放失败',
      });
    }
  }

  public pause() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  public resume() {
    if (this.audio && this.audio.paused) {
      this.audio.play().catch(console.error);
    }
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
    this.update({ isPlaying: false, currentTime: 0, isLoading: false });
  }

  public seek(seconds: number) {
    if (this.audio) {
      this.audio.currentTime = seconds;
      this.update({ currentTime: seconds });
    }
  }

  public setRate(rate: number) {
    if (this.audio) {
      this.audio.playbackRate = rate;
    }
  }
}

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  currentTime: number;
  error: string | null;
}

export const audioManager = new AudioManager();
