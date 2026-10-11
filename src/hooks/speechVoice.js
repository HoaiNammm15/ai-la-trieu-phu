export function selectMaleVietnameseVoice(voices) {
  // Web Speech does not expose gender. Only accept known male Vietnamese names.
  return voices.find(voice => /^vi(?:-|_)/i.test(voice.lang)
    && /(?:\bnam\s*minh\b|\bnamminh\b|\bmicrosoft an\b|vi-VN-(?:Standard|Wavenet)-(?:B|D)\b|vi-VN-Neural2-D\b)/i.test(voice.name)) || null;
}

export function selectPhoneVoice(voices, contact) {
  if (!contact) return null;
  if (contact.lang === 'vi-VN') return selectMaleVietnameseVoice(voices);
  const normalized = language => language.toLowerCase().replaceAll('_', '-');
  return voices.find(voice => normalized(voice.lang) === normalized(contact.lang))
    || voices.find(voice => contact.fallbackLangs.some(language => normalized(voice.lang).split('-')[0] === language)) || null;
}
