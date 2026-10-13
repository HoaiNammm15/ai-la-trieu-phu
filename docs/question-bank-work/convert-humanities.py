import json
from collections import Counter
from pathlib import Path

BASE = Path(__file__).resolve().parent
items = []
for index, line in enumerate((BASE / 'humanities-authored.txt').read_text(encoding='utf-8').splitlines()):
    values = line.split('|')
    assert len(values) == 8, (index + 1, len(values))
    level, category, question, a, b, c, d, explanation = values
    answers = [a, b, c, d]
    correct = index % 4
    if correct:
        answers = answers[-correct:] + answers[:-correct]
    item = dict(level=int(level), question=question, answers=answers,
                correct=correct, category=category, explanation=explanation)
    assert 1 <= item['level'] <= 15
    assert len(set(answers)) == 4
    assert all(isinstance(value, str) and value.strip() for value in answers)
    assert answers[correct] == a
    assert question.strip() and category.strip() and explanation.strip()
    items.append(item)

assert len(items) == 275, len(items)
assert len(set(q['question'].casefold() for q in items)) == 275
(BASE / 'new-humanities.json').write_text(json.dumps(items, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'count': len(items), 'levels': dict(sorted(Counter(q['level'] for q in items).items())),
                  'correct': dict(sorted(Counter(q['correct'] for q in items).items()))}, ensure_ascii=False))
