export function selectMaleVietnameseVoice(voices) {
  // Web Speech does not expose gender. Only accept known male Vietnamese names.
  return voices.find(voice => /^vi(?:-|_)/i.test(voice.lang)
    && /(?:\bnam\s*minh\b|\bnamminh\b|\bmicrosoft an\b|vi-VN-(?:Standard|Wavenet)-(?:B|D)\b|vi-VN-Neural2-D\b)/i.test(voice.name)) || null;
}

const femaleHints = /female|woman|mujer|femme|kadın|donna|kobieta|žena|nữ|\bfem\b/i;
const maleHints = /\bmale\b|(?<!\bfe)male|man\b|hombre|homme|erkek|uomo|mężczyzna|muž|nam\b/i;

/** Google Cloud TTS voice names encode gender in the last letter (A/C/E = female, B/D/F = male for most langs). */
function guessGender(voice) {
  const name = voice.name || '';
  if (femaleHints.test(name)) return 'female';
  if (maleHints.test(name)) return 'male';
  const suffix = name.match(/-(Standard|Wavenet|Neural2|Studio|Polyglot|News)-([A-Z])$/i);
  if (suffix) { const letter = suffix[2].charCodeAt(0) - 65; return letter % 2 === 0 ? 'female' : 'male'; }
  return null;
}

export function selectPhoneVoice(voices, contact) {
  if (!contact) return null;
  if (contact.lang === 'vi-VN') return selectMaleVietnameseVoice(voices);
  const normalized = language => language.toLowerCase().replaceAll('_', '-');
  const wantFemale = contact.gender === 'female';
  const matchesLang = voice => normalized(voice.lang) === normalized(contact.lang);
  const matchesFallback = voice => contact.fallbackLangs.some(l => normalized(voice.lang).split('-')[0] === l);
  const matchesGender = voice => { const g = guessGender(voice); return g === null || g === (wantFemale ? 'female' : 'male'); };
  return voices.find(v => matchesLang(v) && matchesGender(v))
    || voices.find(v => matchesFallback(v) && matchesGender(v))
    || voices.find(matchesLang)
    || voices.find(matchesFallback) || null;
}
