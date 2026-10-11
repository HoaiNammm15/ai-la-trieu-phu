const ink = '#292638';

function Hair({ host, male }) {
  if (host) return <>
    <path d="M59 63Q32 35 48 19Q57 8 77 13L67-5Q102-12 124 10Q161 2 173 31L184 57Q162 53 150 40Q112 64 76 43L68 72Z" fill="#192238" stroke={ink} strokeWidth="3" strokeLinejoin="round"/>
    <path d="M58 29q31-15 61-7m9 4q23-4 34 13" fill="none" stroke="#47536a" strokeWidth="5" strokeLinecap="round"/>
    <path d="m77 13 7 8" stroke="#47536a" strokeWidth="4" strokeLinecap="round"/>
  </>;
  if (male) return <>
    <path d="m58 68-9-30 20-8-7-20 24 10 11-25 16 22 26-16 2 21q33 5 28 39l-16-8-8-15q-28 16-65 3l-8 29Z" fill="#3f3040" stroke={ink} strokeWidth="3" strokeLinejoin="round"/>
    <path d="m90 25 11-10m17 15 12-7" stroke="#745568" strokeWidth="5" strokeLinecap="round"/>
  </>;
  return <>
    <circle cx="167" cy="24" r="20" fill="#483149" stroke={ink} strokeWidth="3"/>
    <path d="M157 12q13-4 18 10m-18 5q11 8 18-1" fill="none" stroke="#81536a" strokeWidth="4" strokeLinecap="round"/>
    <path d="M57 67Q34 24 69 9q24-16 48-1 37-9 49 30l-8 36-14-31q-35 27-75 18L62 82Z" fill="#483149" stroke={ink} strokeWidth="3" strokeLinejoin="round"/>
    <path d="M65 29q20-18 43-13" fill="none" stroke="#81536a" strokeWidth="5" strokeLinecap="round"/>
    <path d="m148 34 10 7" stroke="#ffc76a" strokeWidth="7" strokeLinecap="round"/>
    <path className="character-curl" d="M71 14Q63-8 80-4q10 4 0 10" fill="none" stroke="#483149" strokeWidth="5" strokeLinecap="round"/>
  </>;
}

function Eyes({ happy, nervous, sad, host, thinking }) {
  if (happy) return <g className="character-eyes" stroke={ink} strokeWidth="5" fill="none" strokeLinecap="round">
    <path d="M72 82q12-18 23 0m29-2q12-18 23 0"/>
  </g>;
  if (sad && !host) return <g className="character-eyes" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round">
    <path d="M91 78c-2-12-21-11-19 3 2 12 19 13 21 2 2-8-10-11-12-4-1 4 4 6 6 3m56-6c-2-12-21-11-19 3 2 12 19 13 21 2 2-8-10-11-12-4-1 4 4 6 6 3"/>
  </g>;
  return <g className="character-eyes">
    <ellipse cx="85" cy="79" rx={nervous ? 15 : 13} ry={nervous ? 18 : 15} fill="#fff9ed" stroke={ink} strokeWidth="2.5"/>
    <ellipse cx="136" cy="77" rx={nervous ? 15 : 13} ry={nervous ? 18 : 15} fill="#fff9ed" stroke={ink} strokeWidth="2.5"/>
    <ellipse cx={thinking ? 91 : 89} cy={nervous ? 80 : 83} rx={nervous ? 3 : 4.5} ry={nervous ? 5 : 7} fill={ink}/>
    <ellipse cx={thinking ? 141 : 140} cy={nervous ? 76 : 80} rx={nervous ? 3 : 4.5} ry={nervous ? 5 : 7} fill={ink}/>
    <circle cx="90" cy="81" r="1.5" fill="white"/><circle cx="141" cy="78" r="1.5" fill="white"/>
    {!nervous && <><path d="M72 78q12-27 26 0Z" fill="#efb58c"/><path d={host || thinking ? 'M123 73q12-20 26 0Z' : 'M123 76q12-24 26 0Z'} fill="#efb58c"/><path d="M73 78h24m27-3 24-2" stroke={ink} strokeWidth="2.5" strokeLinecap="round"/></>}
  </g>;
}

function Mouth({ happy, talking, nervous, sad, host, male }) {
  if (sad) return host ? <path d="M94 119q13 11 31-1" stroke="#854951" strokeWidth="4" fill="none" strokeLinecap="round"/> : <>
    <path d="M92 119q19-8 38 1" stroke="#854951" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <path d="m99 119 4 7 7-6 7 6 5-6" fill="#fff9ef" stroke="#854951" strokeWidth="1.5"/>
  </>;
  if (nervous) return <><ellipse cx="113" cy="121" rx="10" ry="13" fill="#713748"/><path d="M109 129h8" stroke="#ee8797" strokeWidth="4" strokeLinecap="round"/></>;
  return <g className={talking ? 'talking-mouth' : ''}>
    <path d={happy || talking ? 'M85 110q26 15 56-2-1 34-27 33-25-1-29-31Z' : host ? 'M85 112q28 13 57-6-4 29-28 31-22-1-29-25Z' : 'M88 113q24 12 51-5-2 27-24 28-20-1-27-23Z'} fill="#713748" stroke={ink} strokeWidth="2.5" strokeLinejoin="round"/>
    <path d={host ? 'm91 114 17 4-2 11-10-2Zm19 4 16-3-1 12-13 3Z' : male ? 'm102 117 10 1-1 12-9-2Zm12 1 10-2v12l-10 2Z' : 'M94 116q19 6 39-3l-5 10q-15 5-30-1Z'} fill="#fff9e8"/>
    {(happy || talking) && <path d="M104 137q9-13 20-3" fill="#ef8799"/>}
    <path d="m83 112-3-2m62-4 4-3" stroke="#bb796a" strokeWidth="2" strokeLinecap="round"/>
  </g>;
}

export default function Character2D({ host = false, gender = 'female', expression = 'idle', id }) {
  const male = host || gender === 'male';
  const happy = expression === 'happy' || expression === 'celebrating';
  const sad = expression === 'sad' || expression === 'sympathetic';
  const nervous = expression === 'nervous' || expression === 'serious';
  const talking = expression === 'talking';
  const thinking = expression === 'thinking';
  const skin = '#efb58c';
  const shirt = host ? '#243b60' : male ? '#4aafbb' : '#ec8d78';
  const shade = host ? '#172742' : male ? '#267889' : '#b85c68';
  return <g id={id} className={`character character--${host ? 'host' : 'player'} character--${male ? 'male' : 'female'} character--${expression}`} data-gender={male ? 'male' : 'female'} data-expression={expression}>
    <title>{host ? 'MC: banh tai, tóc vuốt cao và nụ cười lệch tinh nghịch' : male ? 'Nhân vật nam: tóc dựng, kính tròn và hai răng cửa ngộ nghĩnh' : 'Nhân vật nữ: búi tóc lệch, tóc xoăn và nụ cười lém lỉnh'}</title>
    <ellipse cx="110" cy="282" rx="84" ry="10" fill="#050b23" opacity=".55"/>
    <path d="M101 217h18v52h-18Z" fill="#47638d"/><path d="m72 279 38-14 38 14" fill="none" stroke="#6486b5" strokeWidth="6" strokeLinecap="round"/>
    <path d="M43 116q-8-35 22-35h91q30 0 23 35l-12 99H55Z" fill="#182b55" stroke="#628fdb" strokeWidth="5"/>
    <path d="M69 149q-5-37 40-39t44 39l-13 68H83Z" fill="#213861" stroke="#425f8d" strokeWidth="2"/>
    <path d="M51 214q56-23 117 0l-8 16H61Z" fill="#345184" stroke="#628fdb" strokeWidth="2"/>
    <g className="character-body">
      <path d={host ? 'M75 193q27-19 67 1l17 27-31 15-14-15-20 37-24-7 12-38-16-3Z' : 'M75 194q35-15 70 0l15 22-20 43-23-6 13-38-29 1 1 40-23 2-7-47Z'} fill="#172641" stroke={ink} strokeWidth="2.5" strokeLinejoin="round"/>
      {host ? <><path d="m73 246 21 9-9 15q-29 14-44 2-4-9 20-13Z" fill="#101a30" stroke={ink} strokeWidth="2"/><path d="m126 228 21-3 20 31q20 13 9 21-21 1-36-15Z" fill="#101a30" stroke={ink} strokeWidth="2"/><path d="m56 269 20-6m72 3 15 4" stroke="#4d5b73" strokeWidth="3" strokeLinecap="round"/></> : <>
        <path d="m77 249 25 4v12q-2 14-29 11l-17-3q-8-14 19-15Z" fill="#fff0d8" stroke={ink} strokeWidth="2.5"/>
        <path d="m116 249 24 3-1 11q28 8 19 19-21 6-39-8Z" fill="#fff0d8" stroke={ink} strokeWidth="2.5"/>
        <path d="m72 265 15 2m40 4 13 4" stroke={shirt} strokeWidth="5" strokeLinecap="round"/>
        <path d="M58 272h37m29 6h32" stroke="#bfb2a9" strokeWidth="2"/>
      </>}
      <path d="M78 129q31-13 62 0l15 71q-39 21-85 0Z" fill={shirt} stroke={ink} strokeWidth="2.5"/>
      {host ? <>
        <path d="m91 127 20 14 18-14-8 62-15 13Z" fill="#fff3df"/>
        <path d="m109 144 10 5-6 9 7 23-12 16-9-15 12-24-6-9Z" fill="#eac36b" stroke="#ad8445" strokeWidth="1.5"/>
        <path d="m78 132 24 17-12 10 9 5-14 31m55-62-21 16 11 10-8 6 17 32" fill="none" stroke="#6982a8" strokeWidth="2.5"/>
        <path d="m133 166 13-2" stroke="#fff1c6" strokeWidth="3"/>
      </> : male ? <>
        <path d="m90 129 21 14 20-14-10 23h-20Z" fill="#b4ede7"/>
        <path d="M101 153v20m19-20v20" stroke="#e8f5e6" strokeWidth="3" strokeLinecap="round"/>
        <path d="M90 183q18-8 39 0v15H90Z" fill={shade}/><circle cx="137" cy="160" r="9" fill="#f6ce7b"/><path d="m134 158q4-4 6 0-1 3-3 3m0 3v1" fill="none" stroke={shade} strokeWidth="2" strokeLinecap="round"/>
      </> : <>
        <path d="m88 129 21 16 22-16-5 24H97Z" fill="#ffe0b7"/><path d="m106 153-4 46m13-46 8 46" stroke={shade} strokeWidth="2.5"/>
        <circle cx="111" cy="165" r="2.5" fill="#ffe0b7"/><circle cx="112" cy="178" r="2.5" fill="#ffe0b7"/>
        <path d="M89 185v10m43-10v10" stroke={shade} strokeWidth="3" strokeLinecap="round"/>
      </>}
      {happy ? <g className="character-arms">
        <path d="m81 147-30-25-12-28m97 53 31-26 14-26" fill="none" stroke={shirt} strokeWidth="20" strokeLinecap="round"/>
        <path d="m40 96-9-15m10 13 2-20m138 23 10-17m-11 14-2-21" fill="none" stroke={skin} strokeWidth="8" strokeLinecap="round"/>
        <circle cx="39" cy="94" r="9" fill={skin}/><circle cx="182" cy="95" r="9" fill={skin}/>
      </g> : sad ? <g className="character-arms">
        <path d="m80 150-23 25-21-9m102-16 25 26 20-10" fill="none" stroke={shirt} strokeWidth="17" strokeLinecap="round"/>
        <path d="m36 166-14-2m15 4-10 5m157-7 13-4m-12 8 10 4" stroke={skin} strokeWidth="7" strokeLinecap="round"/>
      </g> : host ? <g className="character-arms">
        <path d="m79 147-13 37 27 1m47-39 15 29-8-19" fill="none" stroke={shirt} strokeWidth="18" strokeLinecap="round"/>
        <path d="m89 185 18-2m40-29-7-10" stroke={skin} strokeWidth="11" strokeLinecap="round"/>
        <g transform="rotate(-16 139 155)"><rect x="134" y="143" width="10" height="30" rx="4" fill="#162038"/><rect x="130" y="128" width="18" height="24" rx="9" fill="#8a9caf" stroke={ink} strokeWidth="2"/><path d="M133 135h12m-12 5h12" stroke="#d8e2eb" strokeWidth="2"/><path d="M135 157h8" stroke="#e5bd68" strokeWidth="3"/></g>
        <rect x="84" y="176" width="30" height="19" rx="2" fill="#173766" stroke="#e4bd6d" strokeWidth="1.5" transform="rotate(-8 99 185)"/>
      </g> : thinking ? <g className="character-arms">
        <path d="M80 151q-18 47 21 33l6-30m29-3 17 38-24 1" fill="none" stroke={shirt} strokeWidth="18" strokeLinecap="round"/>
        <path d="m107 155 6-16m16 51-15-1" stroke={skin} strokeWidth="11" strokeLinecap="round"/><path d="m111 144 10-1" stroke={skin} strokeWidth="7" strokeLinecap="round"/>
      </g> : <g className="character-arms">
        <path d="m80 150-16 39 31-5m42-34 18 39-28-4" fill="none" stroke={shirt} strokeWidth="18" strokeLinecap="round"/>
        <path d="m94 185 14-4m20 4-14-4" stroke={skin} strokeWidth="12" strokeLinecap="round"/>
      </g>}
    </g>
    <g className="character-head">
      <path d="M95 113h33v23q-17 23-33 0Z" fill={skin} stroke="#bf8163" strokeWidth="2"/>
      {!male && <path d="M57 54q8-50 58-45 58 1 52 68l-8 73-18-9-66 10-18-18Z" fill="#483149" stroke={ink} strokeWidth="2.5"/>}
      <ellipse cx="59" cy="83" rx="15" ry="20" fill={skin} stroke={ink} strokeWidth="2.5"/><ellipse cx="164" cy="81" rx="15" ry="20" fill={skin} stroke={ink} strokeWidth="2.5"/>
      <path d="M54 79q11-12 13 8m93-9q12-7 10 8" stroke="#bc7b68" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d={host ? 'M61 52q4-34 51-29 48-2 49 32l-3 41q-2 43-46 48-44-5-49-44Z' : 'M62 49q5-28 49-27 46 0 48 30v46q-4 42-47 44-46-3-49-46Z'} fill={skin} stroke={ink} strokeWidth="2.5"/>
      <Hair host={host} male={male}/>
      <Eyes happy={happy} nervous={nervous} sad={sad} host={host} thinking={thinking}/>
      <path d={nervous || sad ? 'M72 56q11 8 23 3m29-2q12-9 24-4' : thinking ? 'M70 52q13-8 27-1m27 13 25-4' : host ? 'M69 61q12-7 27-2m27-9 28 5' : 'M70 61q12-7 27-2m28-8 25 7'} stroke={ink} strokeWidth="5.5" strokeLinecap="round" fill="none"/>
      {male && !host && <g fill="none" stroke="#337482" strokeWidth="3"><rect x="66" y="62" width="37" height="36" rx="13"/><rect x="117" y="60" width="38" height="36" rx="13"/><path d="M103 74q7-6 14 0M59 70l8 3m88-1 9-4"/></g>}
      <path d={host ? 'M108 83q19 4 18 17-8 9-20 2' : 'M107 87q14 2 14 11-6 7-14 3'} fill={skin} stroke="#b97760" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="74" cy="102" rx="11" ry="5" fill="#de8c83" opacity=".7"/><ellipse cx="148" cy="99" rx="11" ry="5" fill="#de8c83" opacity=".7"/>
      <Mouth happy={happy} talking={talking} nervous={nervous} sad={sad} host={host} male={male}/>
      {!male && <><circle cx="59" cy="102" r="4" fill="#ffd580" stroke="#a3714b" strokeWidth="1.5"/><circle cx="165" cy="100" r="4" fill="#ffd580" stroke="#a3714b" strokeWidth="1.5"/></>}
      {nervous && <g className="character-sweat"><path d="M175 57q14 21 6 26-17 1-6-26Z" fill="#86dbed" stroke="#307a9d" strokeWidth="2"/><path d="M190 88q8 12 3 16-10 0-3-16Z" fill="#86dbed"/></g>}
    </g>
    {happy && <g className="character-reaction" fill="none" stroke="#f7ce70" strokeWidth="4" strokeLinecap="round"><path d="m27 59-9-9m174 9 9-9m-176 23-13-2m182 1 14-3"/><path d="m42 24 3-9 3 9 9 3-9 3-3 9-3-9-9-3Z" fill="#f7ce70" stroke="none"/></g>}
    {thinking && !host && <g className="character-reaction" fill="#f7ce70"><circle cx="184" cy="123" r="3"/><circle cx="192" cy="111" r="4"/><path d="M184 86q-1-13 12-13 14 1 12 12-1 5-10 9v5h-6v-9q11-5 9-8-4-6-9 1Z"/><circle cx="195" cy="105" r="3"/></g>}
  </g>;
}
