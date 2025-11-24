import { GoogleGenAI, Modality } from "@google/genai";

export const generateAudioTransform = async (
  audioBuffer: AudioBuffer,
  prompt: string
): Promise<{ data: string; mimeType: string }> => {
  
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

  // 1. Prepare Audio Data
  // We need to convert AudioBuffer to a base64 string.
  // We'll crop to the first 20 seconds to be safe on token limits and latency for this demo.
  const sampleRate = audioBuffer.sampleRate;
  const durationToProcess = Math.min(audioBuffer.duration, 20); 
  const length = durationToProcess * sampleRate;
  const channelData = audioBuffer.getChannelData(0); // Use mono for efficiency in transfer
  
  // Downsample/Encode logic simplified for browser:
  // We will simply create a WAV blob of the snippet and base64 that.
  const snippetBuffer = new AudioBuffer({
      length: length,
      numberOfChannels: 1,
      sampleRate: sampleRate
  });
  snippetBuffer.copyToChannel(channelData.slice(0, length), 0);
  
  const blob = await bufferToWaveBlob(snippetBuffer);
  const base64Audio = await blobToBase64(blob);

  // 2. Call Gemini
  // Using gemini-2.5-flash-native-audio-preview-09-2025 which supports audio input and output
  try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: 'audio/wav',
                        data: base64Audio
                    }
                },
                {
                    text: `Instructions: ${prompt}. Return only the modified audio.`
                }
            ]
        },
        config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: "You are a professional audio engineer and sound designer. You accept input audio and transform it according to the user's creative prompt (e.g., make it 8-bit, add reverb, make it sound like a phone call). Return high-quality audio."
        }
      });

      const generatedPart = response.candidates?.[0]?.content?.parts?.[0];

      if (generatedPart?.inlineData) {
        return {
            data: generatedPart.inlineData.data,
            mimeType: 'audio/wav' // The model typically returns raw PCM or wrapped wav-like data depending on internal handling, but SDK types it.
        };
      } 
      
      throw new Error("No audio data returned from Gemini.");

  } catch (err) {
      console.error("Gemini Error:", err);
      throw err;
  }
};

// Utilities
function bufferToWaveBlob(abuffer: AudioBuffer): Blob {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i, sample;
    let offset = 0;
    let pos = 0;

    // RIFF chunk descriptor
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); 
    setUint32(0x45564157); // "WAVE"

    // fmt sub-chunk
    setUint32(0x20746d66); // "fmt "
    setUint32(16); 
    setUint16(1); // PCM
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16); // 16-bit

    // data sub-chunk
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for(i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));

    while(pos < abuffer.length) {
      for(i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][pos]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; 
        view.setInt16(44 + offset, sample, true);
        offset += 2;
      }
      pos++;
    }

    return new Blob([buffer], {type: "audio/wav"});

    function setUint16(data: any) { view.setUint16(pos, data, true); pos += 2; }
    function setUint32(data: any) { view.setUint32(pos, data, true); pos += 4; }
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // remove data url prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
