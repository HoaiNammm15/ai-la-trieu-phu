import { AudioLines, RotateCcw } from 'lucide-react';

export default function DialogueBox({ text, onRepeat, repeatDisabled = false, voiceNotice = '' }) {
  return <div className="dialogue-box">
    <div className="dialogue-avatar"><AudioLines size={22}/></div>
    <div className="dialogue-copy"><span>MC ANH THÔNG THÁI <i>ĐỒNG HÀNH CÙNG BẠN</i></span><p aria-live="polite">“{text}”</p>{voiceNotice && <small className="voice-notice" role="status">{voiceNotice}</small>}</div>
    <button className="icon-button repeat-button" disabled={repeatDisabled} onClick={onRepeat} aria-label="MC nhắc lại câu hỏi" title="MC nhắc lại"><RotateCcw size={17}/></button>
  </div>;
}
