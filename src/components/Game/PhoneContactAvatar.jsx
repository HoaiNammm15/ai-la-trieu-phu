const ink = '#292638';
const skin = '#efb58c';
const paleSkin = '#f7c8ac';

function Sparkle({ x, y, color = '#ffd777', size = 1 }) {
  return <path d="m0-5 1.7 3.3L5 0 1.7 1.7 0 5-1.7 1.7-5 0l3.3-1.7Z" transform={`translate(${x} ${y}) scale(${size})`} fill={color} stroke="none" />;
}

function Eyes({ bright = false, wink = false }) {
  return <g>
    <ellipse cx="46" cy="52" rx={bright ? 7.1 : 6.5} ry={bright ? 9 : 7.7} fill="#fff8eb" stroke={ink} strokeWidth="1.8" />
    <ellipse cx="47.5" cy="53" rx="3" ry={bright ? 5.4 : 4.6} fill={ink} stroke="none" />
    <circle cx="48.7" cy="51" r="1.4" fill="white" stroke="none" />
    {wink ? <path d="M66 54q7-7 13-1" fill="none" stroke={ink} strokeWidth="2.6" /> : <>
      <ellipse cx="73" cy="51" rx={bright ? 7.1 : 6.5} ry={bright ? 9 : 7.7} fill="#fff8eb" stroke={ink} strokeWidth="1.8" />
      <ellipse cx="74" cy="52" rx="3" ry={bright ? 5.4 : 4.6} fill={ink} stroke="none" />
      <circle cx="75.2" cy="50" r="1.4" fill="white" stroke="none" />
    </>}
  </g>;
}

function Smile({ speaking, small = false, pink = false }) {
  return <g className={speaking ? 'phone-contact-mouth is-speaking' : 'phone-contact-mouth'}>
    <path d={small ? speaking ? 'M50 69q10 5 20-1-1 14-10 14-9-1-10-13Z' : 'M50 70q10 8 20-1-3 10-11 10-7-1-9-9Z' : speaking ? 'M45 67q15 10 30-2-2 19-15 20-13-1-15-18Z' : 'M45 68q15 9 30-2-3 16-15 17-12-1-15-15Z'} fill={pink ? '#9b4663' : '#713748'} stroke={ink} strokeWidth="1.8" />
    <path d={small ? 'M52 71q8 4 16-1l-2 4q-6 3-12 0Z' : 'M48 70q12 6 24-1l-2 5q-10 5-20 0Z'} fill="#fff9eb" stroke="none" />
    {speaking && <path d={small ? 'M55 80q5-5 10-1' : 'M53 82q7-7 14-2'} fill="#ef8799" stroke="none" />}
  </g>;
}

function NoseAndCheeks({ blush = '#db8d81' }) {
  return <g>
    <path d="M59 54q8 5 4 10h-5" fill="none" stroke="#bf806d" strokeWidth="1.8" />
    <ellipse cx="38" cy="64" rx="6" ry="3" fill={blush} stroke="none" opacity=".55" />
    <ellipse cx="81" cy="62" rx="6" ry="3" fill={blush} stroke="none" opacity=".55" />
  </g>;
}

function Ears({ color = skin }) {
  return <g fill={color} stroke={ink} strokeWidth="2">
    <ellipse cx="31" cy="53" rx="6.5" ry="9" />
    <ellipse cx="89" cy="51" rx="6.5" ry="9" />
    <path d="M28 52q4-4 6 2m53-4q4-4 6 1" fill="none" stroke="#be806b" strokeWidth="1.5" />
  </g>;
}

function Microphone({ x = 95, y = 86, angle = 14 }) {
  return <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <rect x="-3.5" y="4" width="7" height="22" rx="3" fill="#19283b" stroke={ink} strokeWidth="1.6" />
    <rect x="-7" y="-10" width="14" height="19" rx="7" fill="#a9bbcb" stroke={ink} strokeWidth="1.8" />
    <path d="M-4-5h8m-9 5h10m-9 5h8" fill="none" stroke="#e8f2f5" strokeWidth="1.5" />
    <path d="M-2 14h4" stroke="#ffd777" strokeWidth="2" />
  </g>;
}

function Ronaldo({ speaking }) {
  return <>
    <path d="M27 113v-11q2-16 22-19h22q23 3 24 20v10Z" fill="#d95754" stroke={ink} strokeWidth="2.5" />
    <path d="M28 102q2-10 9-14l8 25H27Z" fill="#3c937a" stroke="none" />
    <path d="m75 87 12 8-3 18H73Z" fill="#b83e45" stroke="none" />
    <path d="M49 78v9q11 12 22-1V77" fill={skin} stroke={ink} strokeWidth="2" />
    <path d="m45 85 14 12 17-13-2 10-15 10-14-11Z" fill="#28765c" stroke={ink} strokeWidth="1.5" />
    <path d="M53 101h13l-8 12" fill="none" stroke="#fff3dc" strokeWidth="4.2" />
    <Ears />
    <path d="M32 33q4-20 29-19 25-1 28 20v25q-1 26-29 28-26-2-28-27Z" fill={skin} stroke={ink} strokeWidth="2.5" />
    <path d="m31 46-4-21q2-18 27-18l-2 7q22-13 34 0l7 19-7 9-5-19q-18 13-42 6l-3 19Z" fill="#2b2934" stroke={ink} strokeWidth="2.5" />
    <path d="M37 20q20 3 38-7m-33 10q18 3 33-4" fill="none" stroke="#626074" strokeWidth="2.8" />
    <Eyes />
    <path d="m37 40 18 2m12-3 16-3" stroke={ink} strokeWidth="4.5" />
    <NoseAndCheeks />
    <Smile speaking={speaking} />
    <path d="m34 68 4 1m45-2 4-2" stroke="#c1816e" strokeWidth="1.5" />
    <g transform="translate(94 102) rotate(-12)">
      <circle r="15" fill="#fff5df" stroke={ink} strokeWidth="2.2" />
      <path d="m0-6 6 4-2 7h-8l-2-7Zm-12-2 6 6m12 0 7-7M4 5l4 8M-4 5l-6 7M0-6l1-9" fill={ink} stroke={ink} strokeWidth="1.5" />
      <path d="m-15-1 3-7 2-2m15-3 6 3 3 5m-8 19-7 1-5-2" fill="none" stroke={ink} strokeWidth="3" />
    </g>
    <path d="M87 106q-5-6-6-1-1 5 6 6" fill={skin} stroke={ink} strokeWidth="1.8" />
    <Sparkle x={99} y={37} size={1.15} />
  </>;
}

function Messi({ speaking }) {
  return <>
    <path d="M25 113v-12q3-16 24-19h22q22 2 25 19v12Z" fill="#fff7e5" stroke={ink} strokeWidth="2.5" />
    <path d="M35 88h13v25H35Zm23-5h13v30H58Zm25 5h10v25H83Z" fill="#7dcee5" stroke="none" />
    <path d="M48 77v11q12 10 23-1V76" fill={skin} stroke={ink} strokeWidth="2" />
    <path d="m44 85 15 11 17-12" fill="none" stroke="#244866" strokeWidth="3" />
    <path d="M49 103v10m-3-7 3-3h2m12-1h3q4 0 4 6t-4 6h-3q-4 0-4-6t4-6Z" fill="none" stroke={ink} strokeWidth="2.8" />
    <Ears />
    <path d="M32 32q3-19 28-19 27 0 29 21l-1 29q-4 23-28 25-25-3-28-26Z" fill={skin} stroke={ink} strokeWidth="2.5" />
    <path d="M31 50 26 32Q23 11 44 10q19-10 35 2 18 5 14 29l-6 10-5-23q-12 6-21-2-8 12-23 9l-2 18Z" fill="#49373a" stroke={ink} strokeWidth="2.5" />
    <path d="M35 22q12-9 23-4m7-1q15 1 19 12" fill="none" stroke="#86604c" strokeWidth="3" />
    <path d="M33 57q5 6 7 0l4 11q15-12 31-2l8-11q0 10 5 5-1 28-28 32-25-5-27-35Z" fill="#68463e" stroke={ink} strokeWidth="2" />
    <path d="m39 70 4 7m2 2 3 3m31-14-3 8m-22 9 4 2m10-4-2 4" stroke="#9b7057" strokeWidth="1.6" />
    <Eyes />
    <path d="M37 40q8-5 16-1m14-2q8-3 16 1" stroke="#49373a" strokeWidth="3.5" fill="none" />
    <NoseAndCheeks />
    <Smile speaking={speaking} small />
    <Sparkle x={23} y={39} color="#7dcee5" />
    <Sparkle x={95} y={81} color="#ffd777" size={.7} />
    <path d="m97 51 5-2m-7 10 8 1" stroke="#7dcee5" strokeWidth="2.5" />
  </>;
}

function Jack({ speaking }) {
  return <>
    <path d="M25 113v-14q5-14 25-16h19q22 2 27 18v12Z" fill="#409d82" stroke={ink} strokeWidth="2.5" />
    <path d="m48 85 11 10 13-10 4 28H44Z" fill="#fff4da" stroke="none" />
    <path d="M49 78v9q10 10 21-1V77" fill={paleSkin} stroke={ink} strokeWidth="2" />
    <path d="m47 86-8 6 8 10-6 3 5 8m28-28 8 9-8 10 6 3-5 7" fill="none" stroke="#236d59" strokeWidth="2.2" />
    <path d="M57 96v17m7-17v17" stroke="#d7c4a9" strokeWidth="1.5" />
    <path d="m83 94 2 4 5 1-4 3 1 5-4-2-4 2 1-5-4-3 5-1Z" fill="#ffd777" stroke={ink} strokeWidth="1.3" />
    <Ears color={paleSkin} />
    <path d="M32 33q3-19 28-19 24 0 28 21v25q-4 26-28 27-24-3-27-26Z" fill={paleSkin} stroke={ink} strokeWidth="2.5" />
    <path d="M32 52 26 30Q25 12 43 11L39 5q24 0 32 10 21-4 23 17l-6 23-7-21-9 8 1-16q-11 20-34 16l-3 13Z" fill="#f3d483" stroke={ink} strokeWidth="2.5" />
    <path d="M38 26q13-4 18-14m-9 19q12-5 15-13m18 3 7 10" fill="none" stroke="#bd9052" strokeWidth="2.5" />
    <Eyes wink />
    <path d="m38 42 15-1m14-2q7-3 14 0" stroke="#a67a42" strokeWidth="3.2" fill="none" />
    <NoseAndCheeks blush="#e9a195" />
    <Smile speaking={speaking} small />
    <circle cx="31" cy="62" r="2.4" fill="#ffd777" stroke={ink} strokeWidth="1.2" />
    <Microphone x={27} y={87} angle={-20} />
    <path d="M28 102q-6-3-7 2-1 6 6 7" fill={paleSkin} stroke={ink} strokeWidth="1.8" />
    <Sparkle x={96} y={47} />
    <path d="m17 67 4 2-1 5 4-2" fill="none" stroke="#65cfa8" strokeWidth="2.3" />
  </>;
}

function SonTung({ speaking }) {
  return <>
    <path d="M25 113v-14q4-14 24-16h22q22 3 25 18v12Z" fill="#9b7fd0" stroke={ink} strokeWidth="2.5" />
    <path d="m45 87 14 12 14-13 6 27H42Z" fill="#272d48" stroke="none" />
    <path d="M49 78v10q12 9 22-2V76" fill={paleSkin} stroke={ink} strokeWidth="2" />
    <path d="m45 85-9 10 10 8-5 4 6 6m28-29 8 12-10 9 6 4-3 4" fill="none" stroke="#5d438e" strokeWidth="2.3" />
    <path d="m54 91 6 10 8-11" fill="none" stroke="#f2cd72" strokeWidth="2" />
    <circle cx="60" cy="102" r="2.5" fill="#f2cd72" stroke="none" />
    <Ears color={paleSkin} />
    <path d="M32 34q4-21 27-20 27 0 30 22l-1 25q-3 26-27 27-25-2-28-26Z" fill={paleSkin} stroke={ink} strokeWidth="2.5" />
    <path d="M31 51 27 31Q26 9 49 11 67 0 87 17q10 9 6 27l-6 11-5-23q-20 4-28-12-5 15-18 17l-1 16Z" fill="#222637" stroke={ink} strokeWidth="2.5" />
    <path d="M35 26q9-2 15-12m11 1q15-1 23 10" fill="none" stroke="#535d7c" strokeWidth="3" />
    <path d="m37 40 15-2m18-1 14 2" stroke={ink} strokeWidth="3.5" />
    <g transform="rotate(-4 60 50)">
      <path d="M34 44h23l-2 12q-14 7-19-1Zm29 0h24l-2 11q-8 8-20 1Z" fill="#26314d" stroke={ink} strokeWidth="2" />
      <path d="M56 47q4-3 8 0m-35 0 6 1m51-1 5-2" fill="none" stroke={ink} strokeWidth="2.3" />
      <path d="m40 46-3 8m7-8-3 10m29-10-3 8m7-8-3 10" stroke="#88d7db" strokeWidth="1.5" opacity=".8" />
    </g>
    <NoseAndCheeks />
    <Smile speaking={speaking} small />
    <circle cx="31" cy="62" r="2.8" fill="#fff5de" stroke={ink} strokeWidth="1.2" />
    <Microphone x={94} y={88} angle={18} />
    <path d="M91 104q5-5 7-1 2 6-5 8" fill={paleSkin} stroke={ink} strokeWidth="1.8" />
    <Sparkle x={97} y={37} color="#b2f0e6" />
    <Sparkle x={21} y={68} color="#ffd777" size={.65} />
  </>;
}

function Eimi({ speaking }) {
  return <>
    <path d="M28 47Q26 13 58 11q33-1 36 33l5 58q-16 15-39 8-29 9-38-6Z" fill="#725048" stroke={ink} strokeWidth="2.5" />
    <path d="M31 61q-5 28 4 41m49-42q7 27 0 41" fill="none" stroke="#a1725b" strokeWidth="3" />
    <path d="M26 113v-12q4-16 24-18h20q21 2 25 19v11Z" fill="#c6a6db" stroke={ink} strokeWidth="2.5" />
    <path d="M48 78v11q12 11 24-1V76" fill={paleSkin} stroke={ink} strokeWidth="2" />
    <path d="m46 85 14 10 15-11-3 13q-13 9-24 0Z" fill="#ffe7d7" stroke={ink} strokeWidth="1.8" />
    <path d="m40 98-3 15m45-16 3 16" stroke="#9f79bd" strokeWidth="2" />
    <path d="M53 104q7 4 15-1" fill="none" stroke="#eee0f4" strokeWidth="2.5" />
    <Ears color={paleSkin} />
    <path d="M32 33q4-18 28-18 25 0 29 20l-1 25q-3 26-28 27-25-3-27-26Z" fill={paleSkin} stroke={ink} strokeWidth="2.5" />
    <path d="M30 49 28 33q1-24 30-25 32-1 34 27l-3 18-7-21-8 8-4-14-8 12-7-14-5 15-8-9-7 21Z" fill="#725048" stroke={ink} strokeWidth="2.5" />
    <path d="m40 19-4 13m17-15-1 12m15-12 3 12m9-8 5 13" fill="none" stroke="#a7775e" strokeWidth="2.5" />
    <Eyes bright />
    <path d="M37 40q8-4 16-1m14-1q9-3 16 1" fill="none" stroke="#725048" strokeWidth="2.5" />
    <path d="m39 48-3-2m4 0-1-3m35 2 2-3m2 5 3-2" stroke={ink} strokeWidth="1.8" />
    <NoseAndCheeks blush="#ec8fa0" />
    <Smile speaking={speaking} small pink />
    <circle cx="31" cy="64" r="2.7" fill="#ffd777" stroke={ink} strokeWidth="1.2" />
    <circle cx="89" cy="63" r="2.7" fill="#ffd777" stroke={ink} strokeWidth="1.2" />
    <g transform="translate(88 30)">
      <path d="M0 1q-12-10-7-14 6-4 9 7 3-12 9-7 5 5-5 11 13-2 12 5-1 7-13 2 7 9 1 12-6 1-7-9-7 8-11 3-4-6 7-10Z" fill="#ef9eaf" stroke={ink} strokeWidth="1.5" />
      <circle cx="1" cy="2" r="4" fill="#ffd777" stroke={ink} strokeWidth="1.4" />
    </g>
    <Sparkle x={19} y={43} color="#f8c4d2" />
    <Sparkle x={102} y={77} color="#ffd777" size={.8} />
  </>;
}

const avatars = {
  ronaldo: { Character: Ronaldo, backdrop: '#f4b39b', accent: '#e58275' },
  messi: { Character: Messi, backdrop: '#b7e6ed', accent: '#76bed2' },
  jack: { Character: Jack, backdrop: '#b7e8bf', accent: '#7ac397' },
  sontung: { Character: SonTung, backdrop: '#c8b9ee', accent: '#9e85ce' },
  eimi: { Character: Eimi, backdrop: '#f3ccdf', accent: '#df9bbb' },
};

export default function PhoneContactAvatar({ contactId, className = '', speaking = false }) {
  const resolvedId = Object.hasOwn(avatars, contactId) ? contactId : 'ronaldo';
  const { Character, backdrop, accent } = avatars[resolvedId];

  return <svg
    viewBox="0 0 120 120"
    className={`phone-contact-avatar phone-contact-avatar--${resolvedId}${speaking ? ' is-speaking' : ''}${className ? ` ${className}` : ''}`}
    aria-hidden="true"
    focusable="false"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="60" cy="60" r="55" fill={backdrop} />
    <path d="M13 77q16 31 48 32 30-1 47-30" stroke={accent} strokeWidth="9" opacity=".5" />
    <circle cx="22" cy="26" r="3" fill="#fff9eb" opacity=".7" />
    <circle cx="101" cy="64" r="2" fill="#fff9eb" opacity=".7" />
    <Character speaking={speaking} />
    {speaking && <g className="phone-contact-speaking-lines" stroke={ink} strokeWidth="2.2" opacity=".7">
      <path d="m14 51-5-2m7 10-6 1m95-10 5-3m-4 12 6 1" />
    </g>}
  </svg>;
}
