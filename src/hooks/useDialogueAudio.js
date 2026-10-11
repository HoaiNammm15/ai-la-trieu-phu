import { useCallback, useEffect, useRef, useState } from 'react';
import { selectMaleVietnameseVoice } from './speechVoice.js';

export function useDialogueAudio(enabled, remoteEnabled = false) {
  const contextRef = useRef(null);
  const requestRef = useRef(null);
  const audioRef = useRef(null);
  const sequenceRef = useRef(0);
  const [speaking, setSpeaking] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');
  const stopSpeaking = useCallback(() => {
    sequenceRef.current++;
    requestRef.current?.abort();
    requestRef.current = null;
    const playback = audioRef.current;
    if (playback) {
      playback.audio.onplaying = playback.audio.onended = playback.audio.onerror = null;
      playback.audio.pause();
      playback.audio.removeAttribute('src');
      URL.revokeObjectURL(playback.url);
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);
  useEffect(() => {
    if (!enabled) { stopSpeaking(); setVoiceNotice(''); }
    // Some browsers populate voices asynchronously.
    window.speechSynthesis?.getVoices();
    return stopSpeaking;
  }, [enabled, stopSpeaking]);
  const speak = useCallback(async (text, options = {}) => {
    stopSpeaking();
    if (!enabled) return false;
    const sequence = sequenceRef.current;
    const current = () => sequenceRef.current === sequence;
    setVoiceNotice('');
    if (remoteEnabled && options.questionId != null) {
      const controller = new AbortController();
      requestRef.current = controller;
      try {
        const params = new URLSearchParams({ questionId: String(options.questionId), version: options.version || '', position: String(options.position ?? ''), repeat: options.repeat ? '1' : '0' });
        const response = await fetch(`/api/speech?${params}`, { signal: controller.signal });
        if (!response.ok || !response.headers.get('content-type')?.includes('audio/')) throw new Error('No audio');
        const blob = await response.blob();
        if (!current()) return false;
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = { audio, url };
        audio.onplaying = () => { if (current()) setSpeaking(true); };
        audio.onended = () => { if (current()) stopSpeaking(); };
        audio.onerror = () => { if (current()) { stopSpeaking(); setVoiceNotice('Chưa phát được giọng MC. Bấm đọc lại để thử lần nữa.'); } };
        await audio.play();
        return true;
      } catch {
        if (!current() || controller.signal.aborted) return false;
        if (audioRef.current) {
          const { audio, url } = audioRef.current;
          audio.pause();
          audio.onplaying = audio.onended = audio.onerror = null;
          URL.revokeObjectURL(url);
          audioRef.current = null;
        }
      }
    }
    const synthesis = window.speechSynthesis;
    let voice = selectMaleVietnameseVoice(synthesis?.getVoices() || []);
    if (!voice && synthesis) {
      await new Promise(resolve => {
        const done = () => { clearTimeout(timeout); synthesis.removeEventListener('voiceschanged', done); resolve(); };
        const timeout = setTimeout(done, 700);
        synthesis.addEventListener('voiceschanged', done);
      });
      voice = selectMaleVietnameseVoice(synthesis.getVoices());
    }
    if (!current()) return false;
    if (!voice) {
      setVoiceNotice('Chưa có giọng nam tiếng Việt khả dụng. Bạn vẫn có thể chơi bằng phụ đề.');
      return false;
    }
    const speech = new SpeechSynthesisUtterance(text);
    speech.voice = voice;
    speech.lang = 'vi-VN';
    speech.rate = 0.95;
    speech.onstart = () => { if (current()) setSpeaking(true); };
    speech.onend = () => { if (current()) setSpeaking(false); };
    speech.onerror = () => { if (current()) setSpeaking(false); };
    synthesis.speak(speech);
    return true;
  }, [enabled, remoteEnabled, stopSpeaking]);
  const playCue = useCallback((type = 'select') => {
    if (!enabled) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      const ctx = contextRef.current ??= new AudioContext();
      ctx.resume();
      const notes = type === 'correct' ? [523, 659, 784, 1046] : type === 'wrong' ? [294, 247, 196] : [587];
      notes.forEach((frequency, i) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        const at = ctx.currentTime + i * 0.13;
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(0.09, at + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, at + 0.22);
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(at);
        oscillator.stop(at + 0.23);
      });
    } catch { /* Sound must never interrupt the game. */ }
  }, [enabled]);
  useEffect(() => () => { contextRef.current?.close(); }, []);
  return { speak, playCue, speaking, stopSpeaking, voiceNotice };
}
