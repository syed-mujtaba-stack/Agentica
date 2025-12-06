import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechReturn {
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    speak: (text: string) => void;
    isSpeaking: boolean;
    stopSpeaking: () => void;
    hasRecognitionSupport: boolean;
}

export const useSpeech = (): UseSpeechReturn => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false);

    // Refs to persist instances across renders
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    useEffect(() => {
        // Check for browser support
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onstart = () => setIsListening(true);
                recognitionRef.current.onend = () => setIsListening(false);
                recognitionRef.current.onresult = (event: any) => {
                    const text = event.results[0][0].transcript;
                    setTranscript(text);
                };
                setHasRecognitionSupport(true);
            }

            if ('speechSynthesis' in window) {
                synthRef.current = window.speechSynthesis;
            }
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript(''); // Clear previous
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Speech recognition start failed", e);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const speak = useCallback((text: string) => {
        if (synthRef.current) {
            // Cancel any current speaking
            synthRef.current.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);

            // Try to find a "technological" voice
            const voices = synthRef.current.getVoices();
            const techVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha")) || voices[0];
            if (techVoice) utterance.voice = techVoice;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            synthRef.current.speak(utterance);
        }
    }, []);

    const stopSpeaking = useCallback(() => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        speak,
        isSpeaking,
        stopSpeaking,
        hasRecognitionSupport,
    };
};
