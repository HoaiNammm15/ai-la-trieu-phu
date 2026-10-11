import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Camera, ChevronRight, Trophy, UsersRound, Phone, ShieldCheck } from 'lucide-react';
import StageScene from '../components/Stage/StageScene.jsx';
import DialogueBox from '../components/Stage/DialogueBox.jsx';
import QuestionPanel from '../components/Game/QuestionPanel.jsx';
import LifelinePanel from '../components/Game/LifelinePanel.jsx';
import MoneyLadder from '../components/Game/MoneyLadder.jsx';
import Modal from '../components/Layout/Modal.jsx';
import { audienceVotes, fiftyFifty } from '../hooks/gameEngine.js';
import { getDialogue, letters } from '../data/hostDialogues.js';
import { moneyLadder, formatMoney } from '../data/moneyLadder.js';

export default function GamePage({ state, question, dispatch, playCue, speak, speaking, stopSpeaking, voiceNotice, timer, globalModal }) {
  const navigate = useNavigate();
  const [camera, setCamera] = useState('wide');
  const [lifeline, setLifeline] = useState(null);
  const [ladderOpen, setLadderOpen] = useState(false);
  const [remaining, setRemaining] = useState(60);
  const [repeat, setRepeat] = useState(false);
  const editable = state?.phase === 'asking' || state?.phase === 'selecting';
  const paused = globalModal || lifeline || ladderOpen;
  useEffect(() => { if (state?.phase === 'finished') navigate('/result', { replace: true }); }, [state?.phase, navigate]);
  useEffect(() => { setRemaining(60); setRepeat(false); }, [state?.index, timer]);
  useEffect(() => {
    if (!timer || !editable || paused) return;
    const interval = window.setInterval(() => setRemaining(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [timer, editable, paused]);
  useEffect(() => { if (timer && remaining === 0 && editable && !paused) dispatch({type:'TIMEOUT'}); }, [remaining, timer, editable, paused, dispatch]);
  useEffect(() => {
    if (state?.phase === 'asking') speak(`Câu hỏi số ${state.index + 1}. ${question.question} ${question.answers.map((answer, i) => letters[i] + '. ' + answer).join('. ')}`, { questionId: question.id, version: question.speechVersion, position: state.index + 1 });
    if (state && !['asking', 'selecting'].includes(state.phase)) stopSpeaking();
    if (state?.phase === 'reveal') playCue(state.isCorrect ? 'correct' : 'wrong');
  }, [state?.phase, state?.index, state?.isCorrect, question, speak, playCue, stopSpeaking]);
  if (!state) return <Navigate to="/setup" replace/>;
  if (state.phase === 'finished') return <Navigate to="/result" replace/>;
  const useLifeline = (kind) => {
    if (!editable || state.lifelines[kind]) return;
    if (kind === 'fifty') { dispatch({type:'LIFELINE', kind, hidden: fiftyFifty(question)}); playCue(); }
    if (kind === 'audience') {
      dispatch({type:'LIFELINE', kind});
      setLifeline({kind, votes: audienceVotes(question, state.hidden, state.index)});
    }
    if (kind === 'phone') {
      const available = [0,1,2,3].filter(index => !state.hidden.includes(index) && index !== question.correct);
      const confident = Math.random() < Math.max(.48, .9 - state.index * .025);
      const answer = confident ? question.correct : available[Math.floor(Math.random() * available.length)];
      dispatch({type:'LIFELINE', kind});
      setLifeline({kind, answer, confident: state.index < 7 && confident});
    }
  };
  return <main className="game-page studio-game">
    <div className="game-layout"><div className="game-main">
      <div className="studio-toolbar"><h1 className="studio-player-name"><span className="live-indicator"/><span>GHẾ NÓNG<strong>{state.player.name}</strong></span></h1><LifelinePanel used={state.lifelines} disabled={!editable || Boolean(lifeline)} onUse={useLifeline}/><button className="mobile-ladder-button" aria-label="Mở thang tiền thưởng" onClick={() => setLadderOpen(true)}><Trophy size={16}/><span>{formatMoney(moneyLadder[state.index])}</span><ChevronRight size={16}/></button></div>
      <div className="studio-stage-space"><div className="stage-controls"><span><span className="live-indicator"/> TRƯỜNG QUAY SỐ 01 · ON AIR</span><div aria-label="Góc máy"><Camera size={13}/>{[{key:'wide', label:'Toàn cảnh'}, {key:'host-focus', label:'MC'}, {key:'player-focus', label:'Bạn'}].map(item => <button className={camera === item.key ? 'active' : ''} key={item.key} onClick={() => setCamera(item.key)} aria-pressed={camera === item.key}>{item.label}</button>)}</div></div>
      <StageScene immersive phase={state.phase} isCorrect={state.isCorrect} player={state.player} camera={camera} speaking={speaking}/></div>
      <div className="studio-question-dock">
      <DialogueBox text={repeat ? question.question : getDialogue(state, question)} repeatDisabled={!editable} voiceNotice={voiceNotice} onRepeat={() => { if (!editable) return; setRepeat(true); speak(question.question, { questionId: question.id, version: question.speechVersion, position: state.index + 1, repeat: true }); }}/>
      <QuestionPanel state={state} question={question} dispatch={action => { if (action.type === 'CONFIRM') stopSpeaking(); setRepeat(false); dispatch(action); }} playCue={playCue} timer={timer} remaining={remaining}/>
      </div>
    </div><div className="desktop-ladder"><MoneyLadder index={state.index} answered={state.answered}/></div></div>
    {state.phase === 'confirming' && <Modal title="Câu trả lời cuối cùng?" onClose={() => dispatch({type:'CANCEL'})}><span className="modal-hero-icon"><ShieldCheck size={28}/></span><p className="modal-description">Bạn chọn phương án <strong>{letters[state.selected]}: {question.answers[state.selected]}</strong>.<br/>Sau khi chốt, bạn sẽ không thể đổi đáp án.</p><div className="modal-actions"><button className="button button-quiet" onClick={() => dispatch({type:'CANCEL'})}>Suy nghĩ thêm</button><button className="button button-gold" onClick={() => {stopSpeaking(); dispatch({type:'LOCK'}); playCue();}}>Đúng, tôi chốt!</button></div></Modal>}
    {lifeline && <Modal title={lifeline.kind === 'audience' ? 'Cả trường quay nghĩ gì?' : 'Kết nối với người bạn thông thái'} onClose={() => setLifeline(null)}><span className="simulation-label">TRỢ GIÚP MÔ PHỎNG</span>{lifeline.kind === 'audience' ? <><div className="audience-chart" aria-label="Kết quả khán giả bình chọn">{lifeline.votes.map((vote, index) => <div className="chart-column" key={index}><span>{vote}%</span><div className="chart-track"><div style={{height: `${vote}%`}}/></div><b>{letters[index]}</b><small>{question.answers[index]}</small></div>)}</div><p className="modal-description"><UsersRound size={17}/> Khán giả cũng có thể nhầm. Quyết định cuối cùng vẫn là của bạn!</p></> : <><div className="phone-friend"><span>M</span><div><strong>Minh · Bạn thân</strong><small><Phone size={12}/> Đã kết nối · Cuộc gọi mô phỏng</small></div></div><blockquote>“{lifeline.confident ? 'Mình khá tự tin với' : 'Câu này hơi khó, nhưng mình nghiêng về'} phương án <strong>{letters[lifeline.answer]}: {question.answers[lifeline.answer]}</strong>. {lifeline.confident ? 'Bạn cứ cân nhắc nhé!' : 'Mình không chắc hoàn toàn đâu nhé!'}”</blockquote><p className="modal-description">Lời tư vấn có thể đúng hoặc sai. Hãy tin vào kiến thức của bạn.</p></>}<button className="button button-gold full-width" onClick={() => setLifeline(null)}>Quay lại ghế nóng <ChevronRight size={16}/></button></Modal>}
    {ladderOpen && <Modal title="Hành trình triệu phú" className="ladder-modal" onClose={() => setLadderOpen(false)}><MoneyLadder index={state.index} answered={state.answered}/></Modal>}
  </main>;
}
