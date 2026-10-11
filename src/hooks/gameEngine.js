import { moneyLadder, securedMoney } from '../data/moneyLadder.js';

export function normalizePlayer(player) {
  return {
    name: typeof player?.name === 'string' && player.name.trim() ? player.name : 'nemnguynx',
    gender: player?.gender === 'male' ? 'male' : 'female',
  };
}

export const initialGame = player => ({
  player: normalizePlayer(player), index: 0, phase: 'asking', selected: null, isCorrect: null,
  answered: 0, hidden: [], lifelines: { fifty: false, audience: false, phone: false },
  result: null,
});

export function gameReducer(state, action) {
  const editable = state.phase === 'asking' || state.phase === 'selecting';
  switch (action.type) {
    case 'SELECT':
      return editable && Number.isInteger(action.answer) && action.answer >= 0 && action.answer < 4 && !state.hidden.includes(action.answer)
        ? { ...state, selected: action.answer, phase: 'selecting' } : state;
    case 'CONFIRM': return state.phase === 'selecting' ? { ...state, phase: 'confirming' } : state;
    case 'CANCEL': return state.phase === 'confirming' ? { ...state, phase: 'selecting' } : state;
    case 'LOCK': return state.phase === 'confirming' ? { ...state, phase: 'suspense' } : state;
    case 'REVEAL': {
      if (state.phase !== 'suspense') return state;
      const isCorrect = state.selected === action.correct;
      return { ...state, phase: 'reveal', isCorrect, answered: state.answered + Number(isCorrect) };
    }
    case 'NEXT': {
      if (state.phase !== 'reveal') return state;
      if (!state.isCorrect || state.index === 14) {
        return { ...state, phase: 'finished', result: {
          kind: state.isCorrect ? 'won' : 'lost', answered: state.answered,
          prize: state.isCorrect ? moneyLadder[14] : securedMoney(state.answered),
        } };
      }
      return { ...state, index: state.index + 1, phase: 'asking', selected: null, isCorrect: null, hidden: [] };
    }
    case 'STOP': return editable ? { ...state, phase: 'finished', result: {
      kind: 'stopped', answered: state.answered, prize: state.answered ? moneyLadder[state.answered - 1] : 0,
    } } : state;
    case 'TIMEOUT': return editable ? { ...state, phase: 'finished', result: {
      kind: 'timeout', answered: state.answered, prize: securedMoney(state.answered),
    } } : state;
    case 'LIFELINE':
      if (!editable || !Object.hasOwn(state.lifelines, action.kind) || state.lifelines[action.kind]) return state;
      return { ...state, lifelines: { ...state.lifelines, [action.kind]: true },
        hidden: action.kind === 'fifty' ? action.hidden : state.hidden,
        selected: action.kind === 'fifty' && action.hidden.includes(state.selected) ? null : state.selected,
        phase: action.kind === 'fifty' && action.hidden.includes(state.selected) ? 'asking' : state.phase,
      };
    default: return state;
  }
}

export function fiftyFifty(question, random = Math.random) {
  const wrong = [0, 1, 2, 3].filter(i => i !== question.correct);
  for (let i = wrong.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [wrong[i], wrong[j]] = [wrong[j], wrong[i]];
  }
  return wrong.slice(0, 2);
}

export function audienceVotes(question, hidden = [], difficulty = 0, random = Math.random) {
  const weights = question.answers.map((_, i) => hidden.includes(i) ? 0
    : i === question.correct ? Math.max(35, 78 - difficulty * 2) : 5 + random() * 18);
  const total = weights.reduce((a, b) => a + b, 0);
  const votes = weights.map(weight => Math.floor(weight / total * 100));
  votes[question.correct] += 100 - votes.reduce((a, b) => a + b, 0);
  return votes;
}
