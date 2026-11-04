import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Activity, ShieldCheck, Radio } from 'lucide-react';
import { cn } from '../lib/utils';
import { GraphNode, DiagramParadigm } from '../types';

interface VoiceTelemetryHUDProps {
  nodes: GraphNode[];
  selectedNode?: GraphNode | null;
  fitnessScore?: number;
  onJumpFocus: (node: GraphNode) => void;
  onStepAutogenesis: () => void;
  onToggle3DSpatial: () => void;
  onCaptureSnapshot: () => void;
  onTriggerDeployment: () => void;
  systemNotice?: string | null;
}

export const VoiceTelemetryHUD: React.FC<VoiceTelemetryHUDProps> = ({
  nodes,
  selectedNode,
  fitnessScore = 90,
  onJumpFocus,
  onStepAutogenesis,
  onToggle3DSpatial,
  onCaptureSnapshot,
  onTriggerDeployment
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [lastChordFreq, setLastChordFreq] = useState<number>(220);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const prevNodeIdRef = useRef<string | null>(null);

  // Procedural Web Audio Ambient Harmonic Synth Chord Generator
  const playHarmonicSynthChord = useCallback((resonance = 0.85, currentFitness = fitnessScore) => {
    const baseFreq = Math.round(220 * (0.8 + resonance * 0.6) * (Math.max(50, currentFitness) / 100));
    setLastChordFreq(baseFreq);
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = audioCtxRef.current && audioCtxRef.current.state !== 'closed'
        ? audioCtxRef.current
        : new AudioCtx();
      audioCtxRef.current = ctx;

      const frequencies = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 1.875]; // Root, M3, P5, M7 triad

      const masterGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200 + resonance * 800;

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      const now = ctx.currentTime;
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.08, now + 0.15);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        oscGain.gain.setValueAtTime(0.25, now);
        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 1.25);
      });
    } catch {
      /* ignore audio context restrictions */
    }
  }, [isMuted, fitnessScore]);

  // Shift ambient harmonic synth chord automatically when selectedNode changes
  useEffect(() => {
    if (selectedNode && selectedNode.id !== prevNodeIdRef.current) {
      prevNodeIdRef.current = selectedNode.id;
      const res = selectedNode.quantumResonance ?? selectedNode.strength ?? 0.85;
      playHarmonicSynthChord(res, fitnessScore);
    }
  }, [selectedNode, fitnessScore, playHarmonicSynthChord]);

  // Vocal Response Synthesizer
  const speakFeedback = useCallback((text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  // Voice Command Intent Processor
  const processVoiceCommand = useCallback((rawText: string) => {
    const text = rawText.toLowerCase().trim();
    setTranscript(rawText);

    if (text.includes('focus') || text.includes('jump') || text.includes('node') || text.includes('find')) {
      const match = nodes.find(n => text.includes(n.label.toLowerCase()) || n.label.toLowerCase().includes(text.replace(/(focus|jump|node|find|to)/g, '').trim()));
      if (match) {
        onJumpFocus(match);
        playHarmonicSynthChord(match.quantumResonance || 0.85);
        setLastAction(`Jump-Focused Node: [${match.label}]`);
        speakFeedback(`Focusing node ${match.label}`);
        return;
      }
    }

    if (text.includes('evolve') || text.includes('develop') || text.includes('autogenesis') || text.includes('next generation')) {
      onStepAutogenesis();
      setLastAction('Triggered Autonomous Self-Evolution Step');
      speakFeedback('Executing self evolution cycle');
      return;
    }

    if (text.includes('3d') || text.includes('spatial') || text.includes('holographic')) {
      onToggle3DSpatial();
      setLastAction('Switched to Holographic 3D Spatial Viewport');
      speakFeedback('Switched to 3D spatial viewport');
      return;
    }

    if (text.includes('snapshot') || text.includes('checkpoint') || text.includes('save')) {
      onCaptureSnapshot();
      setLastAction('Captured Workspace Checkpoint Snapshot');
      speakFeedback('Captured checkpoint snapshot');
      return;
    }

    if (text.includes('deploy') || text.includes('pipeline') || text.includes('build')) {
      onTriggerDeployment();
      setLastAction('Triggered Automated CI/CD Deployment Pipeline');
      speakFeedback('Executing deployment pipeline');
      return;
    }

    setLastAction(`Recognized: "${rawText}"`);
  }, [nodes, onJumpFocus, onStepAutogenesis, onToggle3DSpatial, onCaptureSnapshot, onTriggerDeployment, speakFeedback]);

  // Web Audio Waveform Analyzer Loop
  useEffect(() => {
    if (!isListening) return;

    let micStream: MediaStream | null = null;

    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then(stream => {
        micStream = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        audioCtxRef.current = ctx;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const drawWaveform = () => {
          if (!canvasRef.current) return;
          const canvas = canvasRef.current;
          const ctx2d = canvas.getContext('2d');
          if (!ctx2d) return;

          analyser.getByteFrequencyData(dataArray);

          ctx2d.clearRect(0, 0, canvas.width, canvas.height);

          const barWidth = (canvas.width / bufferLength) * 1.5;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;
            ctx2d.fillStyle = i % 2 === 0 ? '#38bdf8' : '#34d399';
            ctx2d.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
            x += barWidth;
          }

          animFrameRef.current = requestAnimationFrame(drawWaveform);
        };

        drawWaveform();
      })
      .catch(() => {
        setIsListening(false);
      });

    // Web Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            processVoiceCommand(res[0].transcript);
          } else {
            setTranscript(res[0].transcript);
          }
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (micStream) micStream.getTracks().forEach(t => t.stop());
    };
  }, [isListening, processVoiceCommand]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      setTranscript('');
      speakFeedback('Voice telemetry standby');
    } else {
      setIsListening(true);
      speakFeedback('Voice telemetry engaged. Say a command');
    }
  };

  return (
    <div className="relative inline-block select-none font-mono text-[10px]">
      <div className="flex items-center gap-1.5 bg-slate-950/90 p-1 rounded-2xl border-2 border-sky-500/40 shadow-[0_0_20px_rgba(14,165,233,0.2)]">
        {/* Voice Toggle Button */}
        <button
          type="button"
          data-swarm-target="voice-telemetry-mic-btn"
          onClick={toggleListening}
          className={cn(
            'px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all',
            isListening
              ? 'bg-rose-500/20 border-rose-400 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-sky-400'
          )}
          title={isListening ? 'Disengage Multi-Modal AI Voice Telemetry' : 'Engage Multi-Modal AI Voice Telemetry (Speech Command Engine)'}
        >
          {isListening ? (
            <>
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="font-bold text-rose-300 uppercase">Voice Active</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline font-bold uppercase">Voice Input</span>
            </>
          )}
        </button>

        {/* Live Audio Waveform Canvas */}
        {isListening && (
          <div className="w-16 h-6 bg-slate-900 rounded-lg border border-sky-500/40 px-1 flex items-center justify-center overflow-hidden">
            <canvas ref={canvasRef} width={64} height={20} className="w-full h-full block" />
          </div>
        )}

        {/* Ambient Harmonic Synth Chord Trigger & Live Frequency Readout */}
        <button
          type="button"
          data-swarm-target="voice-harmonic-synth-btn"
          onClick={() => {
            const res = selectedNode?.quantumResonance ?? selectedNode?.strength ?? 0.85;
            playHarmonicSynthChord(res, fitnessScore);
          }}
          className="px-2 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          title="Trigger Ambient Harmonic Synth Chord (Shifts Frequency on Node Selection)"
        >
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span className="hidden 2xl:inline font-bold">{lastChordFreq}Hz</span>
        </button>

        {/* Mute Synthesizer Toggle */}
        <button
          type="button"
          onClick={() => setIsMuted(prev => !prev)}
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          title={isMuted ? 'Unmute Vocal & Harmonic Synth Telemetry' : 'Mute Vocal & Harmonic Synth Telemetry'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
        </button>
      </div>

      {/* Speech Transcript Overlay Dropdown */}
      <AnimatePresence>
        {(isListening || lastAction) && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            className="absolute left-0 top-full mt-2 w-72 bg-slate-950/95 border-2 border-sky-500/50 rounded-2xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-50 text-slate-200 space-y-1.5"
          >
            <div className="flex items-center justify-between text-[9px] border-b border-slate-800 pb-1.5">
              <span className="text-sky-400 font-bold uppercase flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" /> Speech Telemetry
              </span>
              <span className="text-slate-500 font-mono">Web Speech / Web Audio</span>
            </div>

            {transcript && (
              <div className="p-2 rounded-lg bg-sky-950/50 border border-sky-500/30 text-[10px] text-sky-200 italic font-bold">
                "{transcript}"
              </div>
            )}

            {lastAction && (
              <div className="text-[9.5px] text-emerald-300 font-bold flex items-center gap-1.5 pt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{lastAction}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
