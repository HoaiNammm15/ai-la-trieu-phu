import { useId } from 'react';
import styles from './ShowLogo.module.css';

/** An open book, three rays, and a spark: knowledge becoming a winning moment. */
function KnowledgeMark({ fill = '#f6d58d', stroke = '#f6d58d', rays = true }) {
  return <g>
    {rays && <g fill="none" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" opacity=".65">
      <path d="M0-28v-4M-15-24l-2-3M15-24l2-3M-26-13l-4-2M26-13l4-2"/>
    </g>}
    <path d="m0-29 3.5 8.5L12-17l-8.5 3.5L0-5l-3.5-8.5L-12-17l8.5-3.5Z" fill={fill}/>
    <path d="M-24-11-5-3v22l-19-8Zm48 0L5-3v22l19-8Z" fill={fill}/>
    <path d="m-16-1 7 3v10l-7-3Zm32 0-7 3v10l7-3Z" fill="#102343" opacity=".8"/>
    <path d="M-25 16 0 26l25-10M0 0v19" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round"/>
  </g>;
}

export function ShowMark({ className }) {
  const id = `show-mark-${useId().replaceAll(':', '')}`;
  return <svg className={className} viewBox="-40 -40 80 80" aria-hidden="true" focusable="false">
    <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff2c7"/><stop offset=".5" stopColor="#e3b55c"/><stop offset="1" stopColor="#f5d99b"/></linearGradient></defs>
    <circle r="37" fill="#10203b" stroke={`url(#${id})`} strokeWidth="1.1"/>
    <circle r="33.5" fill="none" stroke="#e4c27d" strokeOpacity=".27" strokeWidth=".7"/>
    <g transform="scale(.85)"><KnowledgeMark fill={`url(#${id})`} stroke={`url(#${id})`}/></g>
    <path d="m-33 0 1.8-1.8L-29.4 0l-1.8 1.8ZM33 0l-1.8-1.8L29.4 0l1.8 1.8Z" fill="#e9c980"/>
  </svg>;
}

export function ShowSeal({ id }) {
  const gold = `${id}-champagne`;
  const face = `${id}-face`;
  const arc = `${id}-top-arc`;
  return <g>
    <defs>
      <linearGradient id={gold} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#fff1c2"/><stop offset=".48" stopColor="#d3a451"/><stop offset="1" stopColor="#f3d897"/></linearGradient>
      <radialGradient id={face} cx=".5" cy=".28" r=".8"><stop stopColor="#1b3456"/><stop offset="1" stopColor="#0b172d"/></radialGradient>
      <path id={arc} d="M-64-27a69 69 0 0 1 128 0"/>
    </defs>
    <circle r="89" fill="#6e93da" opacity=".09"/>
    <circle r="85" fill="#0b162b" stroke={`url(#${gold})`} strokeWidth="2"/>
    <circle r="81" fill={`url(#${face})`} stroke="#d8b46b" strokeOpacity=".45" strokeWidth=".6"/>
    <circle r="74" fill="none" stroke="#d8b46b" strokeOpacity=".22" strokeWidth=".5"/>
    <g stroke={`url(#${gold})`} strokeWidth=".7" opacity=".55">
      {Array.from({ length: 48 }, (_, i) => <path key={i} d={i % 4 === 0 ? 'M0-81v5' : 'M0-81v2.5'} transform={`rotate(${i * 7.5})`}/>)}
    </g>
    <text fill="#d8c28f" fontFamily="Be Vietnam Pro, sans-serif" fontSize="5.2" fontWeight="600" letterSpacing="2.2"><textPath href={`#${arc}`} startOffset="50%" textAnchor="middle">THE KNOWLEDGE SHOW</textPath></text>
    <g transform="translate(0 -30) scale(.66)"><KnowledgeMark fill={`url(#${gold})`} stroke={`url(#${gold})`}/></g>
    <path d="M-57-15h18M39-15h18" stroke="#dcbb76" strokeWidth=".7" strokeOpacity=".6"/>
    <g fontFamily="Be Vietnam Pro, sans-serif" textAnchor="middle">
      <text y="11" fontSize="13" fontWeight="700" letterSpacing="4" fill="#fbebc5">AI LÀ</text>
      <text y="38" fontSize="23" fontWeight="800" letterSpacing="-.7" fill={`url(#${gold})`} textLength="138" lengthAdjust="spacingAndGlyphs">TRIỆU PHÚ</text>
      <path d="M-35 48h25m20 0h25" stroke="#bc9857" strokeWidth=".7"/>
      <path d="m0 45 3 3-3 3-3-3Z" fill="#edd08c"/>
      <text y="63" fontSize="5.7" fontWeight="500" letterSpacing="1.4" fill="#b7c8dc">TỎA SÁNG TRI THỨC</text>
    </g>
    <g fill="#edd08c"><path d="m-73 0 2-2 2 2-2 2ZM73 0l-2-2-2 2 2 2Z"/></g>
  </g>;
}

export default function ShowLogo() {
  return <>
    <span className={styles.mark}><ShowMark/></span>
    <span className={styles.wordmark}>
      <span className={styles.title}>AI LÀ <strong>TRIỆU PHÚ</strong></span>
      <small className={styles.subtitle}>THE KNOWLEDGE SHOW</small>
    </span>
  </>;
}
