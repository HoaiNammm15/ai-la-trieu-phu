import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Sparkles, ShieldCheck, Trophy, HeartHandshake } from 'lucide-react';
import StageScene from '../components/Stage/StageScene.jsx';

export default function Home({ onRules, hasGame }) {
  return <main className="home-page studio-home">
    <div className="home-intro"><span className="eyebrow"><span/> MỘT SÂN KHẤU. NGÀN ĐIỀU BẠN BIẾT.</span><h1>AI LÀ TRIỆU PHÚ<br/><span>Đến lượt bạn tỏa sáng.</span><Sparkles className="title-spark" size={36}/></h1><p>Bạn đã sẵn sàng bước vào ghế nóng?<br className="desktop-break"/> 15 câu hỏi. 3 quyền trợ giúp. Một sân khấu dành cho bạn.</p></div>
    <div className="home-stage-wrap"><div className="stage-sticker"><Trophy size={19}/><span>THỬ THÁCH 15 CÂU<strong>CHINH PHỤC 150 TRIỆU</strong></span><span className="sticker-star">✦</span></div><StageScene home immersive/><span className="stage-caption">↑ Ghế bên phải là của bạn đó!</span></div>
    <div className="home-cta"><Link className="button button-gold button-start" to="/setup">BẮT ĐẦU CHƠI <ArrowUpRight size={22}/></Link><button className="button button-quiet" onClick={onRules}>Xem luật chơi <ArrowRight size={16}/></button>{hasGame && <Link className="resume-link" to="/game">Tiếp tục lượt đang chơi →</Link>}</div>
    <div className="home-features"><div><span className="feature-icon"><Sparkles size={21}/></span><span><strong>15 câu hỏi thú vị</strong><small>Từ khởi động đến thử thách</small></span></div><div><span className="feature-icon"><HeartHandshake size={21}/></span><span><strong>3 người bạn cứu trợ</strong><small>Không phải tự mình làm tất cả</small></span></div><div><span className="feature-icon"><ShieldCheck size={21}/></span><span><strong>2 cột mốc an toàn</strong><small>Tự tin tiến về phía trước</small></span></div></div>
    <footer className="site-footer"><span>ĐƯỢC TẠO NÊN CHO NHỮNG BỘ ÓC TÒ MÒ.</span><span>Chơi vui. Học thêm. Tỏa sáng. <Sparkles size={12}/></span></footer>
  </main>;
}
