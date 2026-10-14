import { Link } from 'react-router-dom';
import { ArrowRight, Home, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { formatMoney, milestones } from '../../data/moneyLadder.js';

function AwardMedal({ won, hasPrize }) {
  const Icon = won ? Trophy : hasPrize ? ShieldCheck : Sparkles;
  return <div className="prize-award" aria-hidden="true">
    <svg className="prize-laurels" viewBox="0 0 180 100" fill="none">
      <path d="M67 85C31 75 26 39 45 13M113 85C149 75 154 39 135 13" stroke="currentColor" strokeWidth="1.2"/>
      {[0, 1, 2, 3, 4].map(leaf => <g key={leaf} transform={`rotate(${leaf * -18} 90 47)`}>
        <path d="M42 22C31 14 29 4 32 2C42 8 46 14 42 22Z" fill="currentColor"/>
      </g>)}
      {[0, 1, 2, 3, 4].map(leaf => <g key={leaf} transform={`translate(180 0) scale(-1 1) rotate(${leaf * -18} 90 47)`}>
        <path d="M42 22C31 14 29 4 32 2C42 8 46 14 42 22Z" fill="currentColor"/>
      </g>)}
      <path d="m90 6 3 5-3 5-3-5Z" fill="currentColor"/>
      <path d="m69 87 21 6 21-6M79 90l11 7 11-7" stroke="currentColor"/>
    </svg>
    <span className="prize-medallion"><Icon size={30} strokeWidth={1.5}/></span>
  </div>;
}

export default function PrizeBoard({ result, questionNumber }) {
  const won = result.kind === 'won';
  const journey = won ? 'Chinh phục 15 câu' : result.kind === 'stopped' ? 'Chủ động dừng' : result.kind === 'timeout' ? 'Hết thời gian' : `Dừng tại câu ${questionNumber}`;
  const money = formatMoney(result.prize);
  const amount = money.slice(0, -2);

  return <section className="result-card prize-board" data-result-kind={result.kind} aria-labelledby="prize-heading">
    <div className="prize-board-header">
      <span>KẾT QUẢ LƯỢT CHƠI</span>
      <span className="prize-board-status"><i/>{won ? 'CHIẾN THẮNG' : 'HOÀN THÀNH'}</span>
    </div>
    <div className="prize-board-award">
      <AwardMedal won={won} hasPrize={result.prize > 0}/>
      <h2 id="prize-heading" className="prize-label">PHẦN THƯỞNG CỦA BẠN</h2>
      <strong className="result-prize">{amount}<span> ₫</span></strong>
      <span className="prize-caption">{won ? 'Đỉnh cao tri thức. Khoảnh khắc của bạn.' : result.prize > 0 ? 'Thành quả của một hành trình đáng nhớ.' : 'Mỗi lần thử là một lần biết thêm.'}</span>
    </div>
    <div className="prize-ticket-divider" aria-hidden="true"><span>✦</span></div>
    <div className="result-stats">
      <div className="prize-progress-heading"><span>Câu trả lời đúng</span><b>{result.answered} <span>/ 15</span></b></div>
      <div className="prize-progress" aria-hidden="true">
        {Array.from({ length: 15 }, (_, index) => <span key={index} className={`${index < result.answered ? 'is-complete' : ''} ${milestones.includes(index + 1) ? 'is-milestone' : ''}`}/>)}
      </div>
      <div className="prize-journey"><span>Hành trình</span><b>{journey}</b></div>
    </div>
    <div className="prize-board-actions">
      <Link className="button button-gold" to="/setup">Chơi thêm một lần <ArrowRight size={18}/></Link>
      <Link className="button prize-home-link" to="/"><Home size={15}/> Về trang chủ</Link>
    </div>
    <small className="prize-footnote">Tiền thưởng mô phỏng <span>·</span> Chơi vui, học thật</small>
  </section>;
}
