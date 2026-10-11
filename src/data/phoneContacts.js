const letters = ['A', 'B', 'C', 'D'];

export const phoneContacts = [
  {
    id: 'ronaldo', name: 'Ronaldo',
    subtitle: 'Vừa rời sân tập · Sẵn sàng chuyền kiến thức',
    languageLabel: 'Tiếng Bồ Đào Nha', lang: 'pt-PT', fallbackLangs: ['pt'],
    voiceName: 'pt-PT-Standard-F', color: '#ff6844', initials: 'CR',
  },
  {
    id: 'messi', name: 'Messi',
    subtitle: 'Nghỉ giữa hiệp · Đường chuyền gợi ý đang tới',
    languageLabel: 'Tiếng Tây Ban Nha · Argentina', lang: 'es-AR', fallbackLangs: ['es'],
    voiceName: 'es-US-Standard-B', color: '#51c9ff', initials: 'LM',
  },
  {
    id: 'jack', name: 'Jack · J97',
    subtitle: 'Tạm dừng phòng thu · Bắt nhịp cùng câu hỏi',
    languageLabel: 'Tiếng Việt', lang: 'vi-VN', fallbackLangs: ['vi'],
    voiceName: 'vi-VN-Standard-B', color: '#b781ff', initials: 'J97',
  },
  {
    id: 'sontung', name: 'Sơn Tùng M-TP',
    subtitle: 'Sau cánh gà · Đèn sân khấu nhường cho bạn',
    languageLabel: 'Tiếng Việt', lang: 'vi-VN', fallbackLangs: ['vi'],
    voiceName: 'vi-VN-Standard-B', color: '#ffc84b', initials: 'MTP',
  },
  {
    id: 'eimi', name: 'Eimi Fukada',
    subtitle: 'Đang đọc manga · Chờ bạn mở chương mới',
    languageLabel: 'Tiếng Nhật', lang: 'ja-JP', fallbackLangs: ['ja'],
    voiceName: 'ja-JP-Standard-A', color: '#ff79bb', initials: 'EF',
  },
];

export function getPhoneContact(id) {
  return phoneContacts.find(contact => contact.id === id) ?? null;
}

function validateAnswers(question) {
  if (!Array.isArray(question?.answers) || question.answers.length !== 4
    || Array.from(question.answers).some(answer => typeof answer !== 'string' || !answer.trim())) {
    throw new TypeError('Phone advice requires a question with exactly four nonempty answer strings.');
  }
}

function validateAnswerIndex(answer, label = 'answer') {
  if (!Number.isInteger(answer) || answer < 0 || answer > 3) {
    throw new RangeError(`Phone ${label} index must be an integer from 0 to 3.`);
  }
}

export function createPhoneAdvice(contactId, question, answer, confident = false) {
  const contact = getPhoneContact(contactId);
  if (!contact) throw new RangeError(`Unknown phone contact: ${String(contactId)}.`);
  validateAnswers(question);
  validateAnswerIndex(answer);

  const letter = letters[answer];
  const option = `${letter}: ${question.answers[answer]}`;

  switch (contact.id) {
    case 'ronaldo':
      return {
        speech: `Olá! Estou a olhar para esta pergunta como para uma grande penalidade. ${confident ? 'Estou bastante confiante na' : 'Não tenho a certeza, mas inclino-me para a'} opção ${letter}. Até um bom remate pode bater no poste; a decisão é tua!`,
        subtitle: `Mình nhìn câu này như một quả phạt đền. ${confident ? 'Mình khá tự tin với' : 'Mình chưa chắc, nhưng nghiêng về'} phương án ${option}. Cú sút hay vẫn có thể trúng cột dọc; bạn cân nhắc nhé!`,
      };
    case 'messi':
      return {
        speech: `Che, miro esta pregunta como un pase entre líneas. ${confident ? 'Tengo bastante confianza en' : 'No estoy del todo seguro, pero me inclino por'} la opción ${letter}. Vos tenés la última palabra; hasta un pase lindo puede salir torcido.`,
        subtitle: `Mình nhìn câu này như một đường chuyền xuyên tuyến. ${confident ? 'Mình khá tự tin với' : 'Mình chưa chắc, nhưng nghiêng về'} phương án ${option}. Đường chuyền đẹp cũng có thể lệch; quyết định cuối cùng là của bạn!`,
      };
    case 'jack': {
      const speech = `A lô, phòng thu tạm nghỉ một nhịp! ${confident ? 'Mình khá tự tin với' : 'Câu này hơi khó, mình chưa chắc nhưng nghiêng về'} phương án ${option}. Nhịp có thể bắt lại, đáp án thì bạn cứ cân nhắc kỹ nhé!`;
      return { speech, subtitle: speech };
    }
    case 'sontung': {
      const speech = `A lô, đèn sân khấu hôm nay dành cho bạn! ${confident ? 'Mình khá tự tin chọn' : 'Mình không chắc hoàn toàn, nhưng nghiêng về'} phương án ${option}. Mình góp một tiếng vỗ tay, còn quyết định cuối cùng là của bạn nhé!`;
      return { speech, subtitle: speech };
    }
    case 'eimi':
      return {
        speech: `もしもし！この問題、マンガの次のコマを考えるみたいだね。${confident ? `かなり自信があるけど、${letter}を選ぶかな。` : `はっきりとはわからないけど、${letter}がよさそう。`}主人公だって、たまには読み違えるよ。最後の選択はあなたに任せるね！`,
        subtitle: `Câu này giống đoán khung tranh tiếp theo trong manga! ${confident ? 'Mình khá tự tin với' : 'Mình chưa chắc, nhưng nghiêng về'} phương án ${option}. Nhân vật chính cũng có thể đoán nhầm; bạn quyết định nhé!`,
      };
  }
}

export function phoneSuggestion(question, hidden = [], difficulty = 0, random = Math.random) {
  validateAnswers(question);
  validateAnswerIndex(question.correct, 'correct answer');
  if (!Array.isArray(hidden)) throw new TypeError('Hidden phone answer indices must be an array.');
  hidden.forEach(index => validateAnswerIndex(index, 'hidden answer'));
  if (!Number.isFinite(difficulty)) throw new TypeError('Phone question difficulty must be a finite number.');
  if (typeof random !== 'function') throw new TypeError('Phone suggestion random source must be a function.');

  const alternatives = [0, 1, 2, 3].filter(index => index !== question.correct && !hidden.includes(index));
  const probability = Math.max(0.48, 0.9 - difficulty * 0.025);
  const correct = alternatives.length === 0 || random() < probability;
  const answer = correct ? question.correct : alternatives[Math.min(alternatives.length - 1, Math.floor(random() * alternatives.length))];
  return { answer, confident: correct && difficulty < 7 };
}
