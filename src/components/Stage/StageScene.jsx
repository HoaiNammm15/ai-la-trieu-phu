import { useId } from 'react';
import Character2D from './Character2D.jsx';
import styles from './StageScene.module.css';

export default function StageScene({ phase = 'asking', isCorrect = null, player = { name: 'nemnguynx', gender: 'female' }, camera = 'wide', home = false, speaking = false, immersive = false }) {
  const id = useId().replaceAll(':', '');
  const reveal = phase === 'reveal';
  const hostExpression = reveal ? isCorrect ? 'celebrating' : 'sympathetic' : phase === 'suspense' || phase === 'confirming' ? 'serious' : speaking ? 'talking' : phase === 'selecting' ? 'thinking' : 'idle';
  const playerExpression = reveal ? isCorrect ? 'happy' : 'sad' : phase === 'suspense' || phase === 'confirming' ? 'nervous' : 'thinking';
  const quip = home ? 'Tự tin 99%!' : reveal ? isCorrect ? 'Não vừa lên level!' : 'Ơ kìa… plot twist!' : phase === 'suspense' || phase === 'confirming' ? 'Tim ơi, từ từ!' : 'Não ơi, hợp tác nào!';
  return <div className={`${styles.scene} ${immersive ? styles.immersive : ''} ${phase === 'suspense' ? styles.suspense : ''} ${reveal ? isCorrect ? styles.correct : styles.wrong : ''} ${home ? styles.home : ''}`}>
    <div className={styles.sceneTop}><span><i /> TRƯỜNG QUAY SỐ 01</span><span>✦ {home ? 'GHẾ NÓNG ĐANG CHỜ' : 'BẠN LÀ NHÂN VẬT CHÍNH'}</span></div>
    <svg className={`${styles.art} ${styles[camera] || ''}`} viewBox="0 0 900 410" role="img" aria-label={`Sân khấu hoạt hình 2D: MC bên trái, ${player.name} bên phải, logo Ai Là Triệu Phú ở giữa`}>
      <defs>
        <radialGradient id={`${id}-back`}><stop stopColor="#1d397a"/><stop offset="1" stopColor="#090f2b"/></radialGradient>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#7299ff" stopOpacity=".34"/><stop offset="1" stopColor="#5476ed" stopOpacity="0"/></linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#1b326a"/><stop offset="1" stopColor="#0a142f"/></linearGradient>
        <linearGradient id={`${id}-gold`}><stop stopColor="#ffe7a4"/><stop offset=".5" stopColor="#f4bd56"/><stop offset="1" stopColor="#ffdda0"/></linearGradient>
        <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      {!immersive && <rect width="900" height="410" fill={`url(#${id}-back)`}/>}
      <g className={styles.beams}>
        <path d="m100 0 250 0-220 340H0Z" fill={`url(#${id}-beam)`}/>
        <path d="m650 0 150 0 100 340H770Z" fill={`url(#${id}-beam)`}/>
        <path d="m335 0 35 0 230 330H470Z" fill="#9068ee" opacity=".08"/>
        <path d="m530 0 35 0-155 330H280Z" fill="#7296ff" opacity=".1"/>
      </g>
      <path d="M25 220V88L173 24h555l148 64v132" fill="none" stroke="#35599b" strokeWidth="2"/>
      <path d="M29 189V93L176 29h548l146 64v96" fill="none" stroke="#668eff" strokeWidth="3" opacity=".55"/>
      {[90, 145, 200, 700, 755, 810].map((x, i) => <g key={x}><path d={`M${x} 85v128`} stroke={i % 2 ? '#9166d8' : '#467bcc'} strokeWidth="3" opacity=".4"/><rect x={x-2} y="104" width="4" height="38" rx="2" fill="#7ab3ff" opacity=".6"/></g>)}
      <g fill="#080c21" opacity=".85">{Array.from({ length: 18 }, (_, i) => <g key={i} transform={`translate(${i * 54 - 8}, 225)`}><circle cx="28" cy="-8" r="10"/><path d="M8 32V15q0-20 20-20t20 20v17Z"/></g>)}</g>
      <path d="M0 259q450-34 900 0" fill="none" stroke="#517fec" strokeWidth="2" opacity=".4"/>
      <ellipse cx="450" cy="341" rx="404" ry="61" fill={`url(#${id}-floor)`} stroke="#3c65b2" strokeWidth="2"/>
      <g className={styles.floorRings} fill="none"><ellipse cx="450" cy="341" rx="361" ry="50" stroke="#5b9cff" strokeWidth="3"/><ellipse cx="450" cy="341" rx="318" ry="40" stroke="#6677df" strokeWidth="2"/><ellipse cx="450" cy="341" rx="265" ry="31" stroke="#62b7ef" strokeWidth="2" opacity=".6"/></g>
      <g transform="translate(450 123)">
        <circle r="94" fill="#436af1" opacity=".2" filter={`url(#${id}-glow)`}/>
        <circle r="90" fill="#101d43" stroke="#647ee4" strokeWidth="3"/>
        <circle r="83" fill="#142752" stroke={`url(#${id}-gold)`} strokeWidth="2.5"/>
        <circle r="75" fill="#122147" stroke="#345f9f" strokeWidth="1"/>
        <g stroke="#e7c275" opacity=".6">{Array.from({length: 24}, (_, i) => <path key={i} d="M0-78v5" transform={`rotate(${i*15})`}/>)}</g>
        <path d="m-16-44 9 8 7-14 7 14 9-8-3 22h-26Z" fill={`url(#${id}-gold)`}/>
        <text y="3" textAnchor="middle" fill="#fff2c5" fontFamily="Bungee, sans-serif" fontSize="23">AI LÀ</text>
        <text y="29" textAnchor="middle" fill="#f6cc73" fontFamily="Bungee, sans-serif" fontSize="22">TRIỆU PHÚ</text>
        <path d="M-36 44h72" stroke="#e4bd6a"/><text y="63" textAnchor="middle" fill="#a9bfea" fontFamily="Be Vietnam Pro, sans-serif" fontSize="8" letterSpacing="3">TỎA SÁNG TRI THỨC</text>
      </g>
      <g transform="translate(450 287)"><ellipse cy="39" rx="49" ry="10" fill="#07102a"/><path d="M-20-18h40l-8 58h-24Z" fill="#112a47" stroke="#3e7d9a" strokeWidth="2"/><path d="m-41-24 20-12h42l20 12-9 23h-64Z" fill="#1d3b5b" stroke="#63dbc7" strokeWidth="3"/><path d="M-28-19h56" stroke="#b0ffdf" strokeWidth="4"/><circle cy="16" r="5" fill="#89efd0"/></g>
      <g transform="translate(180 109) scale(.83)"><Character2D host expression={home ? 'idle' : hostExpression} id={`${id}-host`}/></g>
      <g transform="translate(535 109) scale(.83)"><Character2D expression={home ? 'idle' : playerExpression} gender={player.gender} id={`${id}-player`}/></g>
      <g className={styles.comicBubble} transform="translate(650 69) rotate(3)" aria-hidden="true"><path d="M-68-19h136q12 0 12 12v14q0 12-12 12H5L-8 32l-1-13h-59q-12 0-12-12V-7q0-12 12-12Z" fill={reveal && !isCorrect ? '#ffdfc6' : '#fff0bf'} stroke="#302c43" strokeWidth="2.5"/><text textAnchor="middle" y="4" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="800" fill="#42344b">{quip}</text></g>
      <g textAnchor="middle" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700"><rect x="207" y="352" width="132" height="25" rx="12.5" fill="#0d1a3b" stroke="#395b91"/><text x="273" y="369" fill="#a4c2ff">MC · ANH THÔNG THÁI</text><rect x="568" y="352" width="116" height="25" rx="12.5" fill="#211939" stroke="#73538b"/><text x="626" y="369" fill="#efc6e1">{player.name.length > 15 ? player.name.slice(0, 14) + '…' : player.name}</text></g>
      {reveal && isCorrect && <g className={styles.confetti}>{Array.from({length: 24}, (_, i) => <rect key={i} x={100 + i * 29} y={30 + (i % 5) * 30} width="5" height="12" rx="1" fill={['#f6cc73', '#8bdfcb', '#cc9cf5'][i % 3]} transform={`rotate(${i * 19} ${100 + i*29} ${30+(i%5)*30})`}/>)}</g>}
    </svg>
    <div className={styles.sceneBottom}><span><span className={styles.liveDot}/> ON AIR</span><span>TRI THỨC LÀ SIÊU NĂNG LỰC CỦA BẠN</span><span>HD · 2D</span></div>
  </div>;
}
