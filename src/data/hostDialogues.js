export const letters = ['A', 'B', 'C', 'D'];

export function getDialogue(state, question) {
  switch (state.phase) {
    case 'selecting': return `Bạn đang nghiêng về phương án ${letters[state.selected]}? Cứ suy nghĩ thật kỹ nhé!`;
    case 'confirming': return `Phương án ${letters[state.selected]} là câu trả lời cuối cùng của bạn, ${state.player.name}?`;
    case 'suspense': return 'Một chút hồi hộp nào… Và đáp án chính xác là…';
    case 'reveal': return state.isCorrect
      ? ['Chính xác! Một tràng pháo tay cho bạn nào!', 'Quá xuất sắc! Ghế nóng hôm nay thật sự rất nóng!', 'Đúng rồi! Chúng ta lại tiến thêm một bước!'][state.index % 3]
      : `Rất tiếc! Đáp án đúng là ${letters[question.correct]}. Bạn đã có một hành trình thật đáng nhớ!`;
    default: return state.index === 0
      ? `Chào mừng ${state.player.name} đến với ghế nóng! Câu đầu tiên, khởi động nhẹ nhàng nhé!`
      : `Bạn đã sẵn sàng chưa? Câu hỏi số ${state.index + 1} đang chờ bạn!`;
  }
}
