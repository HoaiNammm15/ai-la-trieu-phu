import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Crown, Volume2, VolumeX, BookOpen, Settings2, LogOut, Maximize, Minimize } from 'lucide-react';

export default function Header({ sound, onSound, onRules, onSettings, onStop, questionNumber, canStop, studio }) {
  const location = useLocation();
  const game = location.pathname === '/game';
  const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement));
  useEffect(() => {
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { /* The viewport layout also works when fullscreen is unavailable. */ }
  };
  return <header className="site-header">
    <Link className="brand" to="/" aria-label="Ai Là Triệu Phú, về trang chủ"><span className="brand-icon"><Crown size={22}/></span><span>AI LÀ <strong>TRIỆU PHÚ</strong><small>THE KNOWLEDGE SHOW</small></span></Link>
    <nav className="header-nav" aria-label="Điều hướng chính">
      {game ? <span className="question-indicator"><i/> CÂU <b>{String(questionNumber || 1).padStart(2, '0')}</b><span>/ 15</span></span> : <><Link className="nav-active" to="/setup">Vào ghế nóng</Link><button onClick={onRules}><BookOpen size={15}/> Luật chơi</button></>}
    </nav>
    <div className="header-actions">
      <button className="icon-button" onClick={onSound} aria-label={sound ? 'Tắt âm thanh' : 'Bật âm thanh'} title={sound ? 'Tắt âm thanh' : 'Bật âm thanh'}>{sound ? <Volume2 size={20}/> : <VolumeX size={20}/>}</button>
      <button className="icon-button" onClick={onSettings} aria-label="Cài đặt"><Settings2 size={19}/></button>
      {studio && document.fullscreenEnabled && <button className="icon-button fullscreen-button" onClick={toggleFullscreen} aria-label={fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'} title={fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}>{fullscreen ? <Minimize size={18}/> : <Maximize size={18}/>}</button>}
      {game ? <button className="stop-header" disabled={!canStop} onClick={onStop}><LogOut size={15}/><span>Dừng chơi</span></button> : <span className="header-tag"><i/> SÂN KHẤU ĐÃ SẴN SÀNG</span>}
    </div>
  </header>;
}
