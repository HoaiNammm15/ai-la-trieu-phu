import { Navigate, Link } from 'react-router-dom';
import { Trophy, ArrowRight, Home, Sparkles, ShieldCheck } from 'lucide-react';
import { formatMoney } from '../data/moneyLadder.js';
import StageScene from '../components/Stage/StageScene.jsx';

export default function Result({ state }) {
  if (!state?.result) return <Navigate to="/" replace/>;
  const won = state.result.kind === 'won';
  const stopped = state.result.kind === 'stopped';
  const timeout = state.result.kind === 'timeout';
  return <main className="result-page studio-result"><span className="eyebrow"><Sparkles size={14}/> MỘT HÀNH TRÌNH ĐÁNG NHỚ</span><h1>{won ? 'Xin chào, nhà triệu phú!' : stopped ? 'Biết dừng cũng là bản lĩnh.' : timeout ? 'Hết giờ, nhưng chưa hết vui!' : 'Bạn đã chơi thật hết mình!'}</h1><p>{won ? `${state.player.name}, bạn đã chinh phục cả 15 câu hỏi. Sân khấu này thuộc về bạn!` : `Cảm ơn ${state.player.name} đã mang tri thức và nụ cười đến trường quay.`}</p><div className="result-layout"><div className="studio-result-art"><StageScene immersive player={state.player} phase="reveal" isCorrect={won || stopped}/></div><section className="result-card"><span className="result-trophy">{won ? <Trophy size={33}/> : <ShieldCheck size={33}/>}</span><span className="eyebrow">PHẦN THƯỞNG CỦA BẠN</span><strong className="result-prize">{formatMoney(state.result.prize)}</strong><div className="result-stats"><span>Câu trả lời đúng<b>{state.result.answered} / 15</b></span><span>Hành trình<b>{won ? 'Chiến thắng' : stopped ? 'Chủ động dừng' : timeout ? 'Hết thời gian' : 'Dừng tại câu ' + (state.index + 1)}</b></span></div><Link className="button button-gold" to="/setup">Chơi thêm một lần <ArrowRight size={17}/></Link><Link className="button button-quiet" to="/"><Home size={16}/> Về trang chủ</Link><small>Tiền thưởng mô phỏng · Chơi vui, học thật</small></section></div></main>;
}
