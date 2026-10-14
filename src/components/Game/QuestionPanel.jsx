import { ArrowRight, LockKeyhole, CircleCheck, X, Clock3, Sparkles } from 'lucide-react';
import { letters } from '../../data/hostDialogues.js';
import { moneyLadder, formatMoney } from '../../data/moneyLadder.js';

export default function QuestionPanel({ state, question, dispatch, playCue, timer, remaining }) {
  const editable = state.phase === 'asking' || state.phase === 'selecting';
  const revealed = state.phase === 'reveal';
  return <section className="question-panel" aria-labelledby="current-question">
    <div className="question-meta"><span><Sparkles size={13}/> CÂU {String(state.index + 1).padStart(2, '0')} <i/> {question.category}</span><span className="question-value">{formatMoney(moneyLadder[state.index])}</span>{timer && <span className={`timer ${remaining <= 10 ? 'timer-urgent' : ''}`}><Clock3 size={14}/>{remaining}s</span>}</div>
    <h2 id="current-question">{question.question}</h2>
    <div className="answers">{question.answers.map((answer, index) => {
      const selected = state.selected === index;
      const correct = revealed && question.correct === index;
      const wrong = revealed && selected && !state.isCorrect;
      const hidden = state.hidden.includes(index);
      return <button key={index} className={`answer ${selected ? 'selected' : ''} ${correct ? 'answer-correct' : ''} ${wrong ? 'answer-wrong' : ''} ${hidden ? 'answer-hidden' : ''}`} disabled={!editable || hidden} aria-pressed={selected} aria-label={`${letters[index]}: ${hidden ? 'Đã loại bỏ' : answer}${correct ? ', đáp án đúng' : wrong ? ', đáp án sai' : ''}`} onClick={() => { dispatch({type: 'SELECT', answer: index}); playCue(); }}>
        <span className="answer-letter">{letters[index]}</span><span>{hidden ? 'Đã loại bỏ' : answer}</span>{correct ? <CircleCheck size={19}/> : wrong ? <X size={19}/> : selected ? <span className="answer-selected-dot"/> : null}
      </button>;
    })}</div>
    {revealed && <p className={`answer-explanation ${state.isCorrect ? 'success' : 'failure'}`} role="status">{state.isCorrect ? 'Chính xác! ' : 'Rất tiếc! '}{question.explanation}</p>}
    <div className="question-actions"><span>{state.phase === 'suspense' ? <><span className="suspense-dots">● ● ●</span> Đang mở đáp án…</> : revealed ? state.isCorrect && state.index < 14 ? 'Tự chuyển câu sau 3 giây.' : 'Tự mở kết quả sau 3 giây.' : <><LockKeyhole size={13}/> Chọn đáp án, rồi chốt khi đã chắc chắn.</>}</span>
      {revealed ? <button className="button button-gold" onClick={() => dispatch({type: 'NEXT'})}>{state.isCorrect && state.index < 14 ? 'Câu tiếp theo' : 'Xem kết quả'}<ArrowRight size={17}/></button> : <button className="button button-gold" disabled={state.phase !== 'selecting'} onClick={() => dispatch({type: 'CONFIRM'})}>CHỐT ĐÁP ÁN <LockKeyhole size={16}/></button>}
    </div>
  </section>;
}
