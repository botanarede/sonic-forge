# Components

This section provides an overview of the main React components that make up the user interface.

## Equalizer

This component renders the 10-band parametric equalizer, allowing users to adjust the gain for each frequency band. It interacts with the `AudioService` to apply the changes in real-time.

## Visualizer

The `Visualizer` component uses a `AnalyserNode` with an FFT (Fast Fourier Transform) of size 2048 to create a real-time frequency spectrum visualization.

- **Rendering**: A `requestAnimationFrame` loop draws vertical bars on an HTML5 Canvas.
- **Aesthetics**: The colors are dynamically interpolated between Neon Purple (`#bc13fe`) and Neon Blue (`#00f3ff`) based on the frequency amplitude.

## AiModifier

This component provides the user interface for the AI Magic Transform feature. It allows the user to input a text prompt and trigger the generative AI transformation process handled by the `GeminiService`.
