import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import StageScene from '../components/Stage/StageScene.jsx';
import Character2D from '../components/Stage/Character2D.jsx';
import '../styles/character-picker.css';

export default function Setup({ onStart, bank, onRetry }) {
  const [name, setName] = useState('nemnguynx');
  const [gender, setGender] = useState('female');
  return <main className="setup-page studio-setup"><div className="setup-copy"><Link className="back-link" to="/"><ArrowLeft size={16}/> Về trường quay</Link><span className="eyebrow">HẬU TRƯỜNG · CHUẨN BỊ LÊN SÓNG</span><h1>Ghế nóng này<br/><span>mang tên bạn.</span></h1><p>Một cái tên, một chút tự tin.<br/>Phần còn lại, cứ để MC lo!</p><form onSubmit={event => { event.preventDefault(); if (name.trim()) onStart({ name: name.trim(), gender }); }}>
    <label className="input-label" htmlFor="player-name">MC nên gọi bạn là gì?</label><input id="player-name" className="name-input" maxLength={24} required value={name} onChange={event => setName(event.target.value)} placeholder="Nhập tên của bạn" autoComplete="nickname"/><span className="input-hint">Tối đa 24 ký tự. Hãy chọn tên bạn thích nhé.</span>
    <fieldset className="character-picker"><legend>Chọn nhân vật của bạn</legend><div className="character-picker-options">{[{ key: 'male', label: 'Nhân vật nam' }, { key: 'female', label: 'Nhân vật nữ' }].map(item => <label className="character-choice" key={item.key}>
      <input type="radio" name="player-character" value={item.key} checked={gender === item.key} onChange={() => setGender(item.key)}/>
      <span className={`character-choice-card character-choice-card--${item.key}`}><svg className="character-choice-avatar" viewBox="30 -20 170 175" aria-hidden="true" focusable="false"><Character2D gender={item.key} expression="idle" id={`picker-${item.key}`}/></svg><span className="character-choice-label">{item.label}</span><span className="character-choice-check" aria-hidden="true"><Check size={12}/></span></span>
    </label>)}</div></fieldset>
    <div className={`bank-status ${bank.error ? 'bank-status-error' : ''}`} role="status">{bank.loading ? 'Đang chuẩn bị câu hỏi…' : bank.error ? <>{bank.error} <button className="bank-retry" type="button" onClick={onRetry}>Thử lại</button></> : bank.source === 'sheets' ? `${bank.questions.length} câu hỏi sẵn sàng · Bộ đề thay đổi mỗi lượt` : '15 câu hỏi mẫu đã sẵn sàng'}</div>
    <button className="button button-gold button-start" disabled={!name.trim() || bank.loading || Boolean(bank.error)} type="submit">TÔI ĐÃ SẴN SÀNG <ArrowRight size={20}/></button><p className="setup-disclaimer">Phần thưởng trong game là tiền mô phỏng.</p>
  </form></div><div className="setup-stage"><div className="studio-setup-art"><StageScene home immersive player={{name:name || 'Người chơi', gender}}/></div><div className="setup-welcome"><Sparkles size={20}/><p>“Chào <strong>{name.trim() || 'bạn'}</strong>! Hôm nay chúng ta sẽ cùng tạo nên một hành trình đáng nhớ.”</p></div></div></main>;
}
