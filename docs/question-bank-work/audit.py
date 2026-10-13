"""Flag similar questions for manual editorial review; similarity is not a verdict."""
import json
import math
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
bank = json.loads((ROOT / 'src/data/questions-bank.json').read_text(encoding='utf-8'))
stopwords = set('có gì nào cho là được không trong của với một các hai sau thường nhất biết gọi dùng vào tên ai năm chủ yếu việc theo lượng học trình số thế thể loại nước quốc gia khi trên đến bằng nhiêu thuộc đang tiếng'.split())
tokens = [set(re.findall(r'[\w⁰¹²³⁴⁵⁶⁷⁸⁹]+', q['question'].casefold())) - stopwords for q in bank]
frequency = Counter(t for ts in tokens for t in ts)
weights = {t: math.log(1 + len(bank) / count) for t, count in frequency.items()}
inverted = defaultdict(list)
for index, ts in enumerate(tokens):
    for t in ts:
        inverted[t].append(index)
flags = []
for i, ts in enumerate(tokens):
    candidates = Counter(j for t in ts for j in inverted[t] if j > i)
    for j, shared in candidates.items():
        if shared < 2:
            continue
        common = ts & tokens[j]
        similarity = sum(weights[t] for t in common) / sum(weights[t] for t in ts | tokens[j])
        same_answer = bank[i]['answers'][bank[i]['correct']].casefold() == bank[j]['answers'][bank[j]['correct']].casefold()
        if similarity > .58 or (same_answer and similarity > .35):
            flags.append((similarity, bank[i]['id'], bank[j]['id'], same_answer))
for similarity, a, b, same in sorted(flags, reverse=True)[:100]:
    print(f'{similarity:.2f} IDs {a}/{b} same_answer={same}')
    print(bank[a - 1]['question'], '=>', bank[a - 1]['answers'][bank[a - 1]['correct']])
    print(bank[b - 1]['question'], '=>', bank[b - 1]['answers'][bank[b - 1]['correct']])
print('FLAGGED', len(flags))
print('LEVELS', dict(sorted(Counter(q['level'] for q in bank).items())))
print('CATEGORIES', dict(Counter(q['category'] for q in bank)))
print('LONGEST STEM', max((len(q['question']), q['id']) for q in bank))
print('LONGEST OPTION', max((len(a), q['id']) for q in bank for a in q['answers']))
