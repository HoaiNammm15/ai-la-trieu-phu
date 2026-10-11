import { ShieldCheck, Trophy, ChevronDown } from 'lucide-react';
import { moneyLadder, milestones, formatMoney, securedMoney } from '../../data/moneyLadder.js';

export default function MoneyLadder({ index = 0, answered = 0, onClose }) {
  return <aside className="money-ladder" aria-label="Thang tiền thưởng">
    <div className="ladder-heading"><span><Trophy size={17}/> HÀNH TRÌNH TRIỆU PHÚ</span>{onClose && <button className="icon-button drawer-close" onClick={onClose} aria-label="Đóng thang thưởng"><ChevronDown size={18}/></button>}</div>
    <div className="ladder-grand"><small>ĐỈNH CAO TRI THỨC</small><strong>150<span> TRIỆU</span></strong><p>15 câu hỏi. Một giấc mơ lớn.</p></div>
    <ol reversed className="ladder-list">{[...moneyLadder].reverse().map((amount, reversedIndex) => {
      const number = 15 - reversedIndex;
      return <li key={number} className={`${number === index + 1 ? 'current' : ''} ${number <= answered ? 'passed' : ''} ${milestones.includes(number) ? 'milestone' : ''}`} aria-current={number === index + 1 ? 'step' : undefined}>
        <span className="ladder-number">{String(number).padStart(2, '0')}</span><span>{formatMoney(amount)}</span>{milestones.includes(number) ? <ShieldCheck size={13}/> : number === index + 1 ? <span className="current-dot"/> : <span className="ladder-spacer"/>}
      </li>;
    })}</ol>
    <div className="ladder-safe"><ShieldCheck size={17}/><div><span>ĐÃ BẢO TOÀN</span><strong>{formatMoney(securedMoney(answered))}</strong></div></div>
    <p className="ladder-note"><span/> Mốc an toàn: câu 5 & câu 10</p>
  </aside>;
}
