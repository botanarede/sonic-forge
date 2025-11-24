import React, { useState, useEffect } from 'react';
import { generateAudioTransform } from '../services/geminiService';

interface AiPageProps {
  audioBuffer: AudioBuffer | null;
}

const AiPage: React.FC<AiPageProps> = ({ audioBuffer }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string | null>(null);
  const [transformedAudioUrl, setTransformedAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (audioBuffer) {
      const blob = new Blob([audioBufferToWav(audioBuffer)], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setOriginalAudioUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioBuffer]);

  const audioBufferToWav = (buffer: AudioBuffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArr = new ArrayBuffer(length);
    const view = new DataView(bufferArr);
    const channels = [];
    let i, sample;
    let offset = 0;
    let pos = 0;

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.samplerate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    for (i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return bufferArr;

    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  };

  const handleTransform = async () => {
    if (!audioBuffer || !prompt) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setTransformedAudioUrl(null);

    try {
      const base64Wav = await generateAudioTransform(prompt, audioBuffer);
      const blob = await fetch(`data:audio/wav;base64,${base64Wav}`).then(res => res.blob());
      const url = URL.createObjectURL(blob);
      setTransformedAudioUrl(url);
    } catch (err) {
      setError('Failed to transform audio. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <>
      {!audioBuffer ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">Please upload an audio file on the Home page first.</p>
        </div>
      ) : (
        <div className="p-6 flex flex-col gap-6 text-white">
          <div className="flex flex-col gap-4">
            <label htmlFor="prompt" className="font-bold">Enter a prompt to transform your audio:</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="e.g., make it sound like an 8-bit video game"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={() => handleSuggestionClick('8-bit style')} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full">8-bit style</button>
            <button onClick={() => handleSuggestionClick('Add heavy reverb')} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full">Add heavy reverb</button>
            <button onClick={() => handleSuggestionClick('Make it sound like it\'s in a cave')} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full">In a cave</button>
          </div>

          <button
            onClick={handleTransform}
            disabled={isLoading || !prompt}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500"
          >
            {isLoading ? 'Transforming...' : 'Transform'}
          </button>

          {error && <p className="text-red-500">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {originalAudioUrl && (
              <div>
                <h3 className="font-bold mb-2">Original Audio</h3>
                <audio controls src={originalAudioUrl} className="w-full"></audio>
              </div>
            )}
            {transformedAudioUrl && (
              <div>
                <h3 className="font-bold mb-2">Transformed Audio</h3>
                <audio controls src={transformedAudioUrl} className="w-full"></audio>
                <a
                  href={transformedAudioUrl}
                  download="transformed_audio.wav"
                  className="text-blue-400 hover:underline mt-2 inline-block"
                >
                  Download Transformed Audio
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AiPage;
