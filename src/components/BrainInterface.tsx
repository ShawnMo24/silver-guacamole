import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Send, Mic, MicOff, MessageSquare } from "lucide-react";
import brainVideo from "@assets/Brain_v2_Final_1766097500812.mp4";

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function BrainInterface() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setQuestion(transcript);
        
        if (event.results[event.results.length - 1].isFinal) {
          setIsListening(false);
          processQuestion(transcript);
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const playVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  }, []);

  const stopVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  }, []);

  const speakResponse = useCallback((text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = () => {
        stopVideo();
      };
      synthRef.current.speak(utterance);
    }
  }, [stopVideo]);

  const processQuestion = useCallback(async (q: string) => {
    if (!q.trim()) return;
    
    setIsProcessing(true);
    playVideo();
    
    try {
      const res = await fetch("/api/brain/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      
      const data = await res.json();
      const responseText = data.response || "I am processing your request. Please stand by.";
      
      setResponse(responseText);
      setIsProcessing(false);
      speakResponse(responseText);
    } catch (error) {
      console.error("Brain API error:", error);
      const fallbackText = "I am the Life Preservation Brain. I am here to assist with emergency coordination, threat assessment, and resource allocation. How may I help you today?";
      setResponse(fallbackText);
      setIsProcessing(false);
      speakResponse(fallbackText);
    }
  }, [playVideo, speakResponse]);

  const handleAsk = () => {
    if (question.trim()) {
      processQuestion(question);
    }
  };

  const handleSpeak = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        setQuestion("");
        setResponse("");
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const handleAnswer = () => {
    if (response) {
      playVideo();
      speakResponse(response);
    }
  };

  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50"
      data-testid="brain-interface"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full border-4 border-mrsg-cyan/60 shadow-[0_0_60px_rgba(0,255,255,0.3)]">
          <video
            ref={videoRef}
            src={brainVideo}
            className="w-full h-full object-cover"
            onEnded={handleVideoEnded}
            playsInline
            data-testid="brain-video"
          />
          
          {!isVideoPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full border-4 border-mrsg-cyan/50 flex items-center justify-center bg-mrsg-cyan/10">
                  <MessageSquare className="w-16 h-16 text-mrsg-cyan" />
                </div>
                <p className="text-mrsg-cyan text-lg font-mono">BRAIN v2 READY</p>
                <p className="text-mrsg-cyan/60 text-sm mt-2">Ask a question to activate</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {response && (
        <div 
          className="absolute top-4 left-4 right-4 p-4 bg-black/80 border border-mrsg-cyan/40 rounded-md max-w-2xl mx-auto"
          data-testid="brain-response"
        >
          <p className="text-mrsg-cyan font-mono text-sm leading-relaxed">{response}</p>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex gap-3">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Type your question..."
              className="flex-1 bg-black/60 border-mrsg-cyan/40 text-mrsg-cyan placeholder:text-mrsg-cyan/40 font-mono focus-visible:ring-mrsg-cyan/50"
              disabled={isProcessing || isListening}
              data-testid="input-brain-question"
            />
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleAsk}
              disabled={!question.trim() || isProcessing}
              className="bg-mrsg-cyan/20 border border-mrsg-cyan/60 text-mrsg-cyan min-w-24"
              data-testid="button-ask"
            >
              <Send className="w-4 h-4 mr-2" />
              Ask
            </Button>

            <Button
              onClick={handleSpeak}
              disabled={isProcessing}
              className={cn(
                "bg-mrsg-cyan/20 border border-mrsg-cyan/60 text-mrsg-cyan min-w-24",
                isListening && "bg-mrsg-cyan/40 animate-pulse"
              )}
              data-testid="button-speak"
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Speak
                </>
              )}
            </Button>

            <Button
              onClick={handleAnswer}
              disabled={!response || isProcessing}
              className="bg-mrsg-cyan/20 border border-mrsg-cyan/60 text-mrsg-cyan min-w-24"
              data-testid="button-answer"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Answer
            </Button>
          </div>

          {isProcessing && (
            <p className="text-center text-mrsg-cyan/60 text-sm font-mono animate-pulse">
              Processing...
            </p>
          )}

          {isListening && (
            <p className="text-center text-mrsg-cyan text-sm font-mono animate-pulse">
              Listening... Speak now
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
