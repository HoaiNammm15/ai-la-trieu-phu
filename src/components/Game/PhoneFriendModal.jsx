import { useEffect, useMemo, useState } from 'react';
import { BatteryFull, ChevronRight, Phone, PhoneOff, Signal, Sparkles, Volume2, Wifi } from 'lucide-react';
import Modal from '../Layout/Modal.jsx';
import PhoneContactAvatar from './PhoneContactAvatar.jsx';
import { createPhoneAdvice, getPhoneContact, phoneContacts } from '../../data/phoneContacts.js';
import '../../styles/phone-friend.css';

export default function PhoneFriendModal({ call, question, position, onChoose, onClose, speak, stopSpeaking, speaking, voiceNotice, soundEnabled }) {
  const [connectedId, setConnectedId] = useState(null);
  const contact = getPhoneContact(call.contactId);
  const connected = Boolean(contact && connectedId === contact.id);
  const advice = useMemo(() => contact ? createPhoneAdvice(contact.id, question, call.answer, call.confident) : null,
    [contact, question, call.answer, call.confident]);
  useEffect(() => {
    if (!contact) return;
    const timeout = window.setTimeout(() => setConnectedId(contact.id), 1250);
    return () => window.clearTimeout(timeout);
  }, [contact]);
  const speechOptions = useMemo(() => contact ? {
    kind: 'phone', contactId: contact.id, answer: call.answer, confident: call.confident,
    questionId: question.id, version: question.speechVersion, position,
  } : null, [contact, call.answer, call.confident, question.id, question.speechVersion, position]);
  useEffect(() => {
    if (connected) speak(advice.speech, speechOptions);
  }, [connected, advice, speechOptions, speak]);
  useEffect(() => () => stopSpeaking(), [stopSpeaking]);

  return <Modal title="Gọi người thân" className="phone-modal" onClose={onClose}>
    <div className={`phone-shell ${contact ? 'phone-shell--calling' : ''}`} style={{ '--contact-color': contact?.color || '#d9f36b' }}>
      <div className="phone-screen">
        <div className="phone-statusbar" aria-hidden="true"><b>9:41</b><span className="phone-island"/><span><Signal size={13}/><Wifi size={13}/><BatteryFull size={18}/></span></div>
        <div className="phone-appbar"><span><Phone size={14}/> ĐƯỜNG DÂY CỨU TRỢ</span><span className="phone-parody-tag">BẢN MEME</span></div>
        {!contact ? <>
          <div className="phone-directory-heading"><div><span className="phone-eyebrow">MỘT CUỘC GỌI. MỘT CƠ HỘI.</span><h3>Alo, cứu tui!</h3></div><span className="phone-sticker" aria-hidden="true">SOS<br/><Sparkles size={18}/></span></div>
          <p className="phone-directory-copy">Ghế nóng quá? Chọn một đồng đội thật mặn.</p>
          <div className="phone-contact-list" aria-label="Danh bạ người thân">
            {phoneContacts.map((person, index) => <button className="phone-contact" key={person.id} aria-label={`Gọi ${person.name}`} onClick={() => onChoose(person.id)} style={{ '--contact-color': person.color }}>
              <span className="phone-contact-picture"><PhoneContactAvatar contactId={person.id}/><span className="phone-online-dot"/></span>
              <span className="phone-contact-info"><strong>{person.name}</strong><small>{person.subtitle}</small><span>{person.languageLabel}</span></span>
              <span className="phone-contact-dial" aria-hidden="true"><Phone size={17}/><small>0{index + 1}</small></span>
            </button>)}
          </div>
          <div className="phone-question-preview"><span>CÂU {position} ĐANG CHỜ BẠN</span><p>{question.question}</p></div>
          <p className="phone-directory-note">Chọn 1 người · Quyền trợ giúp được dùng khi bắt đầu gọi.</p>
        </> : <div className="phone-call-content">
          <div className={`phone-call-portrait ${!connected ? 'is-ringing' : ''}`}><PhoneContactAvatar contactId={contact.id} speaking={connected && speaking}/><span className="phone-call-spark" aria-hidden="true">✦</span></div>
          <h3>{contact.name}</h3><span className="phone-language-badge">{contact.languageLabel}</span>
          <p className="phone-call-status" role="status"><span/>{connected ? (speaking ? 'Đang tư vấn cho bạn…' : 'Đã kết nối · Đồng đội lên tiếng!') : 'Đang gọi… chờ đồng đội bắt máy'}</p>
          {connected ? <>
            <div className="phone-answer-card"><span>ĐỒNG ĐỘI NGHIÊNG VỀ</span><div className="phone-answer-result"><b>{'ABCD'[call.answer]}</b><strong>{question.answers[call.answer]}</strong></div><div className="phone-answer-options" aria-label={`Gợi ý phương án ${'ABCD'[call.answer]}`}>{[...'ABCD'].map((letter, index) => <span key={letter} data-answer={letter} className={index === call.answer ? 'is-suggested' : ''}>{letter}</span>)}</div></div>
            <div className="phone-transcript"><p className="phone-original" lang={contact.lang}>“{advice.speech}”</p>{contact.lang !== 'vi-VN' && <span className="phone-caption-label">PHỤ ĐỀ TIẾNG VIỆT</span>}<p className="phone-caption">{advice.subtitle}</p></div>
            <button className="phone-replay" onClick={() => speak(advice.speech, speechOptions)} disabled={!soundEnabled}><Volume2 size={16}/> Nghe lại tư vấn</button>
            <p className="phone-audio-note" role="status">{!soundEnabled ? 'Âm thanh đang tắt · Bạn vẫn đọc được toàn bộ tư vấn.' : voiceNotice || 'Tư vấn mô phỏng · Đồng đội cũng có thể chọn sai.'}</p>
          </> : <div className="phone-ringing-message"><span aria-hidden="true">•••</span><p>Đang bật chế độ “cứu ghế nóng”</p></div>}
          <button className="phone-hangup" onClick={onClose}><PhoneOff size={18}/> Cúp máy & trở lại</button>
        </div>}
        <div className="phone-bottom-note">NHÂN VẬT HOẠT HÌNH CHÂM BIẾM · CUỘC GỌI MÔ PHỎNG</div><div className="phone-home-indicator" aria-hidden="true"/>
      </div>
    </div>
  </Modal>;
}
