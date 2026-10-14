import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Camera, ChevronRight, Trophy, UsersRound, ShieldCheck } from 'lucide-react';
import StageScene from '../components/Stage/StageScene.jsx';
import DialogueBox from '../components/Stage/DialogueBox.jsx';
import QuestionPanel from '../components/Game/QuestionPanel.jsx';
import LifelinePanel from '../components/Game/LifelinePanel.jsx';
import MoneyLadder from '../components/Game/MoneyLadder.jsx';
import PhoneFriendModal from '../components/Game/PhoneFriendModal.jsx';
import Modal from '../components/Layout/Modal.jsx';
import { audienceVotes, fiftyFifty } from '../hooks/gameEngine.js';
import { getDialogue, letters } from '../data/hostDialogues.js';
import { moneyLadder, formatMoney } from '../data/moneyLadder.js';
import { getPhoneContact, phoneSuggestion } from '../data/phoneContacts.js';

export default function GamePage({ state, question, dispatch, playCue, speak, speaking, stopSpeaking, voiceNotice, soundEnabled, timer, globalModal }) {
  const navigate = useNavigate();
  const [camera, setCamera] = useState('wide');
  const [lifeline, setLifeline] = useState(null);
  const [ladderOpen, setLadderOpen] = useState(false);
  const [remaining, setRemaining] = useState(60);
  const [repeat, setRepeat] = useState(false);
  const editable = state?.phase === 'asking' || state?.phase === 'selecting';
  const paused = globalModal || lifeline || ladderOpen;
  const closeLifeline = useCallback(() => { stopSpeaking(); setLifeline(null); }, [stopSpeaking]);
  useEffect(() => { if (state?.phase === 'finished') navigate('/result', { replace: true }); }, [state?.phase, navigate]);
  useEffect(() => {
    if (state?.phase !== 'reveal' || paused) return;
    const timeout = window.setTimeout(() => dispatch({ type: 'NEXT' }), 3000);
    return () => window.clearTimeout(timeout);
  }, [state?.phase, state?.index, paused, dispatch]);
  useEffect(() => { setRemaining(60); setRepeat(false); }, [state?.index, timer]);
  useEffect(() => {
    if (!timer || !editable || paused) return;
    const interval = window.setInterval(() => setRemaining(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [timer, editable, paused]);
  useEffect(() => { if (timer && remaining === 0 && editable && !paused) dispatch({type:'TIMEOUT'}); }, [remaining, timer, editable, paused, dispatch]);
  useEffect(() => {
    if (state?.phase === 'asking' && !lifeline) speak(`Câu hỏi số ${state.index + 1}. ${question.question} ${question.answers.map((answer, i) => letters[i] + '. ' + answer).join('. ')}`, { questionId: question.id, version: question.speechVersion, position: state.index + 1 });
    if (state && !['asking', 'selecting'].includes(state.phase)) stopSpeaking();
    if (state?.phase === 'reveal') playCue(state.isCorrect ? 'correct' : 'wrong');
  }, [state?.phase, state?.index, state?.isCorrect, question, speak, playCue, stopSpeaking]);
  if (!state) return <Navigate to="/setup" replace/>;
  if (state.phase === 'finished') return <Navigate to="/result" replace/>;
  const useLifeline = (kind) => {
    if (!editable || lifeline || state.lifelines[kind]) return;
    if (kind === 'fifty') { dispatch({type:'LIFELINE', kind, hidden: fiftyFifty(question)}); playCue(); }
    if (kind === 'audience') {
      stopSpeaking();
      dispatch({type:'LIFELINE', kind});
      setLifeline({kind, votes: audienceVotes(question, state.hidden, state.index)});
    }
    if (kind === 'phone') {
      stopSpeaking();
      setLifeline({kind});
    }
  };
  const chooseContact = (contactId) => {
    if (!editable || state.lifelines.phone || lifeline?.contactId || !getPhoneContact(contactId)) return;
    const suggestion = phoneSuggestion(question, state.hidden, state.index);
    dispatch({type:'LIFELINE', kind:'phone'});
    playCue();
    setLifeline({kind:'phone', contactId, ...suggestion});
  };
  return <main className="game-page studio-game">
    <div className="game-layout"><div className="game-main">
      <div className="studio-toolbar"><h1 className="studio-player-name"><span className="live-indicator"/><span>GHẾ NÓNG<strong>{state.player.name}</strong></span></h1><LifelinePanel used={state.lifelines} disabled={!editable || Boolean(lifeline)} onUse={useLifeline}/><button className="mobile-ladder-button" aria-label="Mở thang tiền thưởng" onClick={() => setLadderOpen(true)}><Trophy size={16}/><span>{formatMoney(moneyLadder[state.index])}</span><ChevronRight size={16}/></button></div>
      <div className="studio-stage-space"><div className="stage-controls"><span><span className="live-indicator"/> TRƯỜNG QUAY SỐ 01 · ON AIR</span><div aria-label="Góc máy"><Camera size={13}/>{[{key:'wide', label:'Toàn cảnh'}, {key:'host-focus', label:'MC'}, {key:'player-focus', label:'Bạn'}].map(item => <button className={camera === item.key ? 'active' : ''} key={item.key} onClick={() => setCamera(item.key)} aria-pressed={camera === item.key}>{item.label}</button>)}</div></div>
      <StageScene immersive phase={state.phase} isCorrect={state.isCorrect} player={state.player} camera={camera} speaking={speaking && lifeline?.kind !== 'phone'}/></div>
      <div className="studio-question-dock">
      <DialogueBox text={repeat ? question.question : getDialogue(state, question)} repeatDisabled={!editable} voiceNotice={voiceNotice} onRepeat={() => { if (!editable) return; setRepeat(true); speak(question.question, { questionId: question.id, version: question.speechVersion, position: state.index + 1, repeat: true }); }}/>
      <QuestionPanel state={state} question={question} dispatch={action => { if (action.type === 'CONFIRM') stopSpeaking(); setRepeat(false); dispatch(action); }} playCue={playCue} timer={timer} remaining={remaining}/>
      </div>
    </div><div className="desktop-ladder"><MoneyLadder index={state.index} answered={state.answered}/></div></div>
    {state.phase === 'confirming' && <Modal title="Câu trả lời cuối cùng?" onClose={() => dispatch({type:'CANCEL'})}><span className="modal-hero-icon"><ShieldCheck size={28}/></span><p className="modal-description">Bạn chọn phương án <strong>{letters[state.selected]}: {question.answers[state.selected]}</strong>.<br/>Sau khi chốt, bạn sẽ không thể đổi đáp án.</p><div className="modal-actions"><button className="button button-quiet" onClick={() => dispatch({type:'CANCEL'})}>Suy nghĩ thêm</button><button className="button button-gold" onClick={() => {stopSpeaking(); dispatch({type:'LOCK'}); playCue();}}>Đúng, tôi chốt!</button></div></Modal>}
    {lifeline?.kind === 'phone' && <PhoneFriendModal call={lifeline} question={question} position={state.index + 1} onChoose={chooseContact} onClose={closeLifeline} speak={speak} stopSpeaking={stopSpeaking} speaking={speaking} voiceNotice={voiceNotice} soundEnabled={soundEnabled}/>}
    {lifeline?.kind === 'audience' && <Modal title="Cả trường quay nghĩ gì?" onClose={closeLifeline}><span className="simulation-label">TRỢ GIÚP MÔ PHỎNG</span><div className="audience-chart" aria-label="Kết quả khán giả bình chọn">{lifeline.votes.map((vote, index) => <div className="chart-column" key={index}><span>{vote}%</span><div className="chart-track"><div style={{height: `${vote}%`}}/></div><b>{letters[index]}</b><small>{question.answers[index]}</small></div>)}</div><p className="modal-description"><UsersRound size={17}/> Khán giả cũng có thể nhầm. Quyết định cuối cùng vẫn là của bạn!</p><button className="button button-gold full-width" onClick={closeLifeline}>Quay lại ghế nóng <ChevronRight size={16}/></button></Modal>}
    {ladderOpen && <Modal title="Hành trình triệu phú" className="ladder-modal" onClose={() => setLadderOpen(false)}><MoneyLadder index={state.index} answered={state.answered}/></Modal>}
  </main>;
}
