import { UsersRound, Phone, Check, Scissors } from 'lucide-react';

export default function LifelinePanel({ used, disabled, onUse }) {
  const items = [{ key: 'fifty', label: '50:50', description: 'Bỏ 2 đáp án sai', Icon: Scissors }, { key: 'audience', label: 'Hỏi khán giả', description: 'Lắng nghe trường quay', Icon: UsersRound }, { key: 'phone', label: 'Gọi người thân', description: 'Một cuộc gọi cứu trợ', Icon: Phone }];
  return <section className="lifelines" aria-label="Quyền trợ giúp"><div className="lifelines-label"><span>BIỆT ĐỘI<br/><b>TRỢ GIÚP</b></span><small>Mỗi quyền dùng 1 lần</small></div><div className="lifeline-buttons">{items.map(({key, label, description, Icon}) => <button key={key} disabled={disabled || used[key]} onClick={() => onUse(key)} className={used[key] ? 'used' : ''} aria-label={`${label}${used[key] ? ', đã sử dụng' : ', ' + description}`}><span className="lifeline-icon">{used[key] ? <Check size={19}/> : key === 'fifty' ? <b>50:50</b> : <Icon size={21}/>}</span><span>{label}<small>{used[key] ? 'Đã sử dụng' : description}</small></span></button>)}</div></section>;
}
