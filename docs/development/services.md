# Services

This section provides a detailed overview of the core services that power the Sonic Forge application.

## AudioService

The `AudioService` is the heart of the application, managing the entire audio processing pipeline using the Web Audio API.

### 10-Band Parametric Equalizer

The system utilizes a series of 10 `BiquadFilterNode` filters to allow for precise adjustments across different frequency ranges without introducing noticeable latency.

- **Low-Shelf (60Hz)**: Controls deep bass and sub-bass frequencies.
- **Peaking (170Hz - 14kHz)**: Eight bands for adjusting "body," "presence," and "clarity."
- **High-Shelf (16kHz)**: Manages "air" and ultra-high frequencies.

### Offline Export

The `AudioService` can recreate the filter graph in an `OfflineAudioContext` to render the processed audio for download in WAV format, much faster than real-time.

## GeminiService

The `GeminiService` handles all interactions with the Google Gemini API for generative AI audio transformation.

### AI Magic Transform

This feature directly integrates with Google's multimodal model.

- **Input**: Accepts the raw audio buffer loaded by the user.
- **Current Limitation**: Due to token limits and latency, the service crops the audio to the first 20 seconds.
- **Prompt Engineering**: The system instructs the model to act as a "professional audio engineer," ensuring the output is a high-quality audio file rather than text or explanations.
