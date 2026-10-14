import { Navigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import StageScene from '../components/Stage/StageScene.jsx';
import PrizeBoard from '../components/Game/PrizeBoard.jsx';

export default function Result({ state }) {
  if (!state?.result) return <Navigate to="/" replace/>;
  const won = state.result.kind === 'won';
  const stopped = state.result.kind === 'stopped';
  const timeout = state.result.kind === 'timeout';
  return <main className="result-page studio-result">
    <span className="eyebrow"><Sparkles size={14}/> MỘT HÀNH TRÌNH ĐÁNG NHỚ</span>
    <h1>{won ? 'Xin chào, nhà triệu phú!' : stopped ? 'Biết dừng cũng là bản lĩnh.' : timeout ? 'Hết giờ, nhưng chưa hết vui!' : 'Bạn đã chơi thật hết mình!'}</h1>
    <p>{won ? `${state.player.name}, bạn đã chinh phục cả 15 câu hỏi. Sân khấu này thuộc về bạn!` : `Cảm ơn ${state.player.name} đã mang tri thức và nụ cười đến trường quay.`}</p>
    <div className="result-layout">
      <div className="studio-result-art"><StageScene immersive player={state.player} phase="reveal" isCorrect={won || stopped}/></div>
      <PrizeBoard result={state.result} questionNumber={state.index + 1}/>
    </div>
  </main>;
}
