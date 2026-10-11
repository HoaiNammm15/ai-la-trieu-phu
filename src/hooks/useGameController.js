import { useCallback, useEffect, useReducer, useState } from 'react';
import { gameReducer, initialGame, normalizePlayer } from './gameEngine.js';
import questions from '../data/questions.json';
import { createRound, validateQuestions } from '../data/questionBank.js';

const storageKey = 'millionaire-game-v1';
function restore() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey));
    if (saved?.player?.name && Number.isInteger(saved.index) && saved.index >= 0 && saved.index < 15
      && saved.lifelines && ['asking', 'selecting', 'confirming', 'suspense', 'reveal', 'finished'].includes(saved.phase)) {
      const round = saved.questions || questions.map((q, i) => ({ ...q, level: i + 1 }));
      validateQuestions(round);
      if (round.length !== 15) return null;
      return { ...saved, player: normalizePlayer(saved.player), questions: round };
    }
  } catch { /* Storage is optional. */ }
  return null;
}

export function useGameController() {
  const [bank, setBank] = useState({ loading: true, error: '', source: null, questions: [], speechEnabled: false });
  const loadBank = useCallback(async (signal) => {
    setBank(value => ({ ...value, loading: true, error: '' }));
    try {
      const response = await fetch('/api/questions', { signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chưa tải được kho câu hỏi.');
      validateQuestions(data.questions);
      setBank({ ...data, loading: false, error: '' });
    } catch (error) {
      if (!signal?.aborted) setBank(value => ({ ...value, loading: false, error: error.message === 'Failed to fetch' ? 'Mất kết nối với kho câu hỏi. Hãy thử lại.' : error.message }));
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    loadBank(controller.signal);
    return () => controller.abort();
  }, [loadBank]);
  const [state, dispatch] = useReducer((state, action) => action.type === 'START'
    ? { ...initialGame(action.player), questions: action.questions } : state ? gameReducer(state, action) : state, null, restore);
  const startGame = player => {
    if (bank.loading || bank.error) return false;
    dispatch({ type: 'START', player, questions: createRound(bank.questions) });
    return true;
  };
  const question = state ? state.questions[state.index] : null;
  useEffect(() => {
    if (state) { try { sessionStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* Keep playing without storage. */ } }
  }, [state]);
  useEffect(() => {
    if (state?.phase !== 'suspense') return;
    const timeout = window.setTimeout(() => dispatch({ type: 'REVEAL', correct: question.correct }), 1800);
    return () => window.clearTimeout(timeout);
  }, [state?.phase, question]);
  return { state, question, dispatch, bank, startGame, reloadBank: () => loadBank() };
}
