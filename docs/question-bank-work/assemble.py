"""One-time merge of the user's workbook, editorial review and new questions."""
import json
import unicodedata
from collections import Counter
from datetime import datetime
from itertools import zip_longest
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / 'docs/question-bank-work'
SOURCE = Path(json.loads((WORK / 'original.json').read_text(encoding='utf-8'))['source'])
sheet = openpyxl.load_workbook(SOURCE, data_only=False).worksheets[0]
reviews = [r for n in range(1, 4) for r in json.loads((WORK / f'review-{n}.json').read_text(encoding='utf-8'))]
assert len(reviews) == 170 and {r['id'] for r in reviews} == set(range(1, 171))
patches = {r['id']: r for r in reviews}
bank = []
review_log = []


def text(value, cell=None):
    if isinstance(value, datetime):
        return f'{value.day}/{value.month}/{value.year}' if cell and 'yyyy' in cell.number_format.lower() else f'{value.day}/{value.month}'
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return unicodedata.normalize('NFC', str('' if value is None else value)).strip()


for cells in list(sheet.rows)[1:]:
    if not any(c.value is not None for c in cells):
        continue
    values = [c.value for c in cells]
    question = dict(id=int(values[0]), level=int(values[1]), question=text(values[2]),
                    answers=[text(c.value, c) for c in cells[3:7]], correct='ABCD'.index(text(values[7])),
                    category=text(values[8]), explanation=text(values[9]))
    assert values[10] is True
    old_level = question['level']
    patch = patches[question['id']]
    for key in question:
        if key in patch:
            question[key] = patch[key]
    review_log.append(dict(id=question['id'], old_level=old_level, level=question['level'],
                           reason=patch.get('reason', 'Rà lại nội dung và xếp level theo độ khó thực tế.')))
    bank.append(question)

fragments = [json.loads((WORK / f'new-{name}.json').read_text(encoding='utf-8')) for name in ['science', 'humanities', 'world']]
assert [len(f) for f in fragments] == [280, 275, 275]
new_questions = [q for group in zip_longest(*fragments) for q in group if q is not None]
counts = Counter(q['correct'] for q in bank)
for index, question in enumerate(new_questions, 171):
    question = {k: question[k] for k in ['level', 'question', 'answers', 'correct', 'category', 'explanation']}
    assert type(question['correct']) is int and 0 <= question['correct'] <= 3
    correct_answer = question['answers'][question['correct']]
    target = min(range(4), key=lambda answer: (counts[answer], (answer - index) % 4))
    others = [a for i, a in enumerate(question['answers']) if i != question['correct']]
    others.insert(target, correct_answer)
    question['answers'] = others
    question['correct'] = target
    counts[target] += 1
    bank.append({'id': index, **question})
assert len(bank) == 1000

seen = set()
for q in bank:
    assert type(q['level']) is int and 1 <= q['level'] <= 15, q
    assert type(q['correct']) is int and 0 <= q['correct'] <= 3, q
    for field in ['question', 'category', 'explanation']:
        q[field] = text(q[field])
        assert q[field] and '\ufffd' not in q[field], q
    q['answers'] = [text(a) for a in q['answers']]
    assert len(q['answers']) == 4 and all(q['answers']) and len({a.casefold() for a in q['answers']}) == 4, q
    stem = q['question'].casefold().strip()
    assert stem not in seen, ('duplicate', q)
    seen.add(stem)
assert counts == Counter({0: 250, 1: 250, 2: 250, 3: 250}), counts
assert {q['level'] for q in bank} == set(range(1, 16))

sources = []
for path in WORK.glob('sources-*.json'):
    entries = json.loads(path.read_text(encoding='utf-8'))
    if isinstance(entries, dict):
        entries = entries.get('sources', [])
    for entry in entries:
        if isinstance(entry, str):
            entry = {'url': entry, 'scope': 'Tra cứu biên tập'}
        if 'url' in entry:
            sources.append(entry)
report = {'original_count': 170, 'added_count': 830, 'total_count': 1000,
          'level_counts': dict(sorted(Counter(q['level'] for q in bank).items())),
          'stage_counts': {name: sum(low <= q['level'] <= high for q in bank) for low, high, name in [(1, 5, 'easy'), (6, 10, 'medium'), (11, 15, 'hard')]},
          'original_review': review_log, 'sources': sources}
(ROOT / 'src/data/questions-bank.json').write_text(json.dumps(bank, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(ROOT / 'docs/questions-review.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({k: v for k, v in report.items() if k not in ['original_review', 'sources']}, ensure_ascii=False, indent=2))
