import React, { useState, useRef } from 'react';
import { generateAudioTransform } from '../services/geminiService';
import { audioService } from '../services/audioService';
import { ProcessingStatus, GeneratedAudio } from '../types';

const AiModifier: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [result, setResult] = useState<GeneratedAudio | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGenerate = async () => {
    const rawBuffer = audioService.getRawBuffer();
    if (!rawBuffer) {
        alert("Por favor, carregue um arquivo de áudio primeiro.");
        return;
    }

    if (!prompt.trim()) {
        alert("Digite um comando para a IA.");
        return;
    }

    setStatus(ProcessingStatus.GENERATING);

    try {
        const { data, mimeType } = await generateAudioTransform(rawBuffer, prompt);
        
        // Convert Base64 to Blob
        const byteCharacters = atob(data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType }); // Usually audio/wav
        const url = URL.createObjectURL(blob);

        setResult({
            url,
            blob,
            description: prompt
        });
        setStatus(ProcessingStatus.SUCCESS);
    } catch (error) {
        console.error(error);
        setStatus(ProcessingStatus.ERROR);
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur border border-gray-800 p-6 rounded-xl space-y-4">
       <div className="flex items-center space-x-2 mb-4">
         <span className="text-2xl">✨</span>
         <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">
            AI Magic Transform
         </h3>
       </div>

       <div className="space-y-3">
         <label className="text-sm text-gray-400">
           Descreva como você quer alterar o áudio (aplica aos primeiros 20s):
         </label>
         <div className="flex gap-2">
            <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Faça parecer que está tocando num rádio antigo..."
                className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-blue transition-colors placeholder-gray-600"
            />
            <button
                onClick={handleGenerate}
                disabled={status === ProcessingStatus.GENERATING}
                className="px-6 py-2 bg-gradient-to-r from-neon-blue to-neon-purple text-black font-bold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {status === ProcessingStatus.GENERATING ? 'Criando...' : 'Gerar'}
            </button>
         </div>
       </div>

       {status === ProcessingStatus.ERROR && (
           <div className="p-3 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">
               Erro ao gerar áudio. Verifique sua API Key ou tente um arquivo menor.
           </div>
       )}

       {result && (
           <div className="mt-6 p-4 bg-gray-950 rounded-lg border border-neon-blue/30 animate-in fade-in slide-in-from-bottom-4">
               <div className="flex justify-between items-center mb-2">
                    <span className="text-neon-blue font-mono text-sm">Resultado Gerado</span>
                    <a 
                        href={result.url} 
                        download={`sonicforge_ai_remix.wav`}
                        className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-white transition-colors"
                    >
                        Baixar WAV
                    </a>
               </div>
               <audio 
                    ref={audioRef} 
                    controls 
                    src={result.url} 
                    className="w-full h-8 mb-2 accent-neon-purple"
                />
               <p className="text-xs text-gray-500 italic">"{result.description}"</p>
           </div>
       )}
    </div>
  );
};

export default AiModifier;
