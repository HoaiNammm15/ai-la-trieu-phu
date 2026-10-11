import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ShieldCheck, Volume2, Timer, Trophy, ArrowRight } from 'lucide-react';
import Header from './components/Layout/Header.jsx';
import Modal from './components/Layout/Modal.jsx';
import Home from './pages/Home.jsx';
import Setup from './pages/Setup.jsx';
import GamePage from './pages/GamePage.jsx';
import Result from './pages/Result.jsx';
import { useGameController } from './hooks/useGameController.js';
import { useDialogueAudio } from './hooks/useDialogueAudio.js';
import { moneyLadder, formatMoney } from './data/moneyLadder.js';

function loadSettings() {
  try { const value = JSON.parse(localStorage.getItem('millionaire-settings')); return { sound: value?.sound === true, timer: value?.timer === true }; } catch { return {sound: false, timer: false}; }
}
export default function App() {
  const { state, question, dispatch, bank, startGame, reloadBank } = useGameController();
  const [settings, setSettings] = useState(loadSettings);
  const [modal, setModal] = useState(null);
  const closeModal = useCallback(() => setModal(null), []);
  const { speak, playCue, speaking, stopSpeaking, voiceNotice } = useDialogueAudio(settings.sound, bank.speechEnabled);
  const navigate = useNavigate();
  const location = useLocation();
  const canStop = state?.phase === 'asking' || state?.phase === 'selecting';
  useEffect(() => { try {localStorage.setItem('millionaire-settings', JSON.stringify(settings));} catch { /* Settings still work in memory. */ } }, [settings]);
  useEffect(() => { window.scrollTo({top: 0, behavior:'instant'}); }, [location.pathname]);
  useEffect(() => () => stopSpeaking(), [location.pathname, stopSpeaking]);
  const start = (player) => { if (startGame(player)) { stopSpeaking(); playCue(); navigate('/game'); } };
  const studio = ['/', '/setup', '/game', '/result'].includes(location.pathname);
  return <div className={`app-shell ${studio ? 'app-shell--studio' : ''}`}><Header sound={settings.sound} onSound={() => setSettings(s=>({...s, sound:!s.sound}))} onRules={() => setModal('rules')} onSettings={() => setModal('settings')} onStop={() => setModal('stop')} canStop={canStop} questionNumber={state?.index + 1} studio={studio}/>
    <Routes><Route path="/" element={<Home onRules={() => setModal('rules')} hasGame={state && state.phase !== 'finished'}/>}/><Route path="/setup" element={<Setup onStart={start} bank={bank} onRetry={reloadBank}/>}/><Route path="/game" element={<GamePage state={state} question={question} dispatch={dispatch} playCue={playCue} speak={speak} speaking={speaking} stopSpeaking={stopSpeaking} voiceNotice={voiceNotice} soundEnabled={settings.sound} timer={settings.timer} globalModal={Boolean(modal)}/>}/><Route path="/result" element={<Result state={state}/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>
    {modal === 'rules' && <Modal title="Chơi thế nào cho thật vui?" onClose={closeModal}><span className="modal-hero-icon"><Trophy size={28}/></span><p className="modal-description">15 câu hỏi, 4 phương án mỗi câu, 1 hành trình chinh phục tri thức.</p><ol className="rules-list"><li><strong>Chọn rồi mới chốt.</strong><span>Chọn A, B, C hoặc D. Bấm Chốt đáp án và xác nhận câu trả lời cuối cùng.</span></li><li><strong>Đồng đội luôn ở bên.</strong><span>Dùng 50:50, hỏi khán giả hoặc gọi người thân. Mỗi quyền trợ giúp chỉ dùng một lần. Tư vấn và bình chọn đều được mô phỏng.</span></li><li><strong>Hai mốc an toàn.</strong><span>Trả lời đúng câu 5 bảo toàn 2 triệu; đúng câu 10 bảo toàn 22 triệu. Trả lời sai hoặc hết giờ nhận mức an toàn đã đạt (0 ₫ nếu chưa đạt câu 5).</span></li><li><strong>Bạn quyết định điểm dừng.</strong><span>Dừng trước khi chốt để nhận tiền của câu vừa trả lời đúng. Chinh phục câu 15 để nhận 150 triệu đồng mô phỏng.</span></li></ol><button className="button button-gold full-width" onClick={closeModal}>Đã hiểu, lên sân khấu thôi! <ArrowRight size={16}/></button></Modal>}
    {modal === 'settings' && <Modal title="Chỉnh sân khấu theo ý bạn" onClose={closeModal}><div className="setting-row"><span><Volume2 size={21}/><span><strong>Âm thanh chương trình</strong><small>Giọng nam MC và hiệu ứng chương trình</small></span></span><button className={`toggle ${settings.sound ? 'on' : ''}`} role="switch" aria-checked={settings.sound} aria-label="Âm thanh chương trình" onClick={() => setSettings(s=>({...s, sound:!s.sound}))}><span/></button></div><div className="setting-row"><span><Timer size={21}/><span><strong>Thêm chút thử thách</strong><small>60 giây cho mỗi câu hỏi</small></span></span><button className={`toggle ${settings.timer ? 'on' : ''}`} role="switch" aria-checked={settings.timer} aria-label="Bộ đếm thời gian" onClick={() => setSettings(s=>({...s, timer:!s.timer}))}><span/></button></div><p className="settings-note">MC dùng giọng nam tiếng Việt khi có giọng khả dụng. Bấm chốt để ngắt lời MC ngay. Phụ đề luôn hiển thị. Đồng hồ tạm dừng khi mở hộp thoại; hết giờ sẽ kết thúc lượt chơi.</p><button className="button button-gold full-width" onClick={closeModal}>Xong rồi!</button></Modal>}
    {modal === 'stop' && state && <Modal title="Bạn muốn dừng tại đây?" onClose={closeModal}><span className="modal-hero-icon"><ShieldCheck size={28}/></span><p className="modal-description">Bạn sẽ ra về với phần thưởng mô phỏng:<strong className="stop-prize">{formatMoney(state.answered ? moneyLadder[state.answered - 1] : 0)}</strong></p><div className="modal-actions"><button className="button button-quiet" onClick={closeModal}>Chơi tiếp nào</button><button className="button button-gold" onClick={() => {dispatch({type:'STOP'}); closeModal();}}>Dừng & nhận thưởng</button></div></Modal>}
  </div>;
}
