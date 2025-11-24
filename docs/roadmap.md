# Milestone: Sonic Forge 2.0 (Roadmap)

Based on the current capabilities of the code and recent trends in web audio technologies and generative AI, this is the suggested expansion plan.

## Phase 1: Audio Enhancement & Mixing (Core Audio)

**Objective**: To make the tool viable for light mastering.

- **Dynamic Compressor**: Implement the native `DynamicsCompressorNode` from the Web Audio API. This will prevent clipping when the user significantly increases the equalizer gain, acting as a final limiter.
- **Convolution Reverb**: Add an acoustic space effect using `ConvolverNode`. We can allow users to load "Impulse Responses" (IRs) or use AI to generate synthetic IR files that simulate environments (e.g., "Cathedral," "Small Studio").
- **Spatial Audio (3D Audio)**: Utilize the `PannerNode` to allow users to position the audio in a 3D space, creating rotation or stereo movement effects.

## Phase 2: Advanced Generative AI (Next-Gen AI)

**Objective**: To expand the creative capabilities beyond simple transformation.

- **Stem Separation**:
  - **Concept**: Allow users to separate vocals, drums, bass, and other instruments from a loaded track.
  - **Technology**: Integration via API with models like Spleeter or Demucs, or local execution via WebAssembly (ONNX Runtime) to separate the "stems" in the browser.
  - **In-App Use**: Users could, for example, apply EQ only to the drums and Reverb only to the vocals.

- **AI Response Streaming**:
  - **Improvement**: Currently, the user waits for the entire audio to be generated. With the Gemini API, it is possible to implement audio streaming, playing the result as it is being generated, thus reducing perceived latency.

- **Audio In-painting**:
  - **Feature**: Allow users to select a "damaged" or empty section of the audio and ask the AI to fill it in coherently with the rest of the track.

## Phase 3: Professional Interface & UX

- **Waveform Scrubbing**: Replace the simple progress bar (`<input type="range">`) with an interactive and zoomable waveform visualization, facilitating precision editing.
- **Modular Effects Rack**: Allow users to drag and drop the order of effects (e.g., placing the EQ before or after the Compressor), dynamically altering the `AudioService`'s signal chain.

## Research References

The suggestions above are based on the documented capabilities of the Web Audio API and AI trends for 2025:

- Google AI Studio & Gemini Capabilities.
- MDN Web Docs - Web Audio API (Compressor, Convolver, Spatialization).
- AI Stem Separation Tools & Techniques (Spleeter, Demucs).
- Visualizations with Web Audio API (Waveforms).
