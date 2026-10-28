import { pipeline } from './transformers.js';

let transcriber;

self.onmessage = async (event) => {
    const { type, audio, token } = event.data;
    try {
        if (type === 'load') {
            if (!transcriber) {
                transcriber = await pipeline(
                    'automatic-speech-recognition',
                    'Xenova/whisper-tiny.en',
                    {
                        progress_callback: (progress) => self.postMessage({ type: 'progress', progress })
                    }
                );
            }
            self.postMessage({ type: 'ready' });
        } else if (type === 'transcribe' && transcriber) {
            const result = await transcriber(new Float32Array(audio), { sampling_rate: 16000 });
            self.postMessage({ type: 'result', token, text: result.text.trim() });
        }
    } catch (error) {
        self.postMessage({
            type: 'error',
            token,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};
