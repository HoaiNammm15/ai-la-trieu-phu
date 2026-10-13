"""Random bank sampling and session restore with a 1000-question Sheets fixture.
Run npm run dev on port 5173, then python -u tests/random_bank_smoke.py.
"""
import json
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
URL = 'http://127.0.0.1:5173'
DEMO = json.loads((ROOT / 'src/data/questions.json').read_text(encoding='utf-8'))
BANK = [{**DEMO[index % len(DEMO)], 'id': f'pool-{index + 1}', 'level': index % 15 + 1,
         'question': f'Câu hỏi ngẫu nhiên trong kho số {index + 1}', 'speechVersion': 'fixture-version'}
        for index in range(1000)]
ERRORS = []

INIT = """
localStorage.setItem('millionaire-settings', JSON.stringify({sound:true,timer:false}));
let seed = Number(sessionStorage.getItem('__qaRandomSeed') || 42);
Math.random = () => {
  seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
  sessionStorage.setItem('__qaRandomSeed', String(seed));
  return seed / 4294967296;
};
window.__speechRequests = [];
const originalFetch = window.fetch.bind(window);
window.fetch = (url, options) => {
  if (String(url).startsWith('/api/speech')) window.__speechRequests.push(String(url));
  return originalFetch(url, options);
};
window.Audio = class {
  play() { this.onplaying?.(); return Promise.resolve(); }
  pause() {}
  removeAttribute() {}
};
"""


def snapshot(page):
    return page.evaluate('JSON.parse(sessionStorage.getItem("millionaire-game-v1"))')


def start(page):
    page.goto(URL + '/setup')
    page.get_by_role('button', name='TÔI ĐÃ SẴN SÀNG').click()
    expect(page).to_have_url(URL + '/game')
    expect(page.locator('#current-question')).to_be_visible()
    page.wait_for_function('window.__speechRequests.length >= 1')
    return snapshot(page)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1366, 'height': 768}, reduced_motion='reduce')
    context.add_init_script(INIT)
    current_bank = BANK
    context.route('**/api/questions', lambda route: route.fulfill(json={
        'source': 'sheets', 'questions': current_bank, 'speechEnabled': True,
    }))
    context.route('**/api/speech?*', lambda route: route.fulfill(body='mock mp3', content_type='audio/mpeg'))
    page = context.new_page()
    page.on('pageerror', lambda error: ERRORS.append(str(error)))

    first = start(page)
    round_questions = first['questions']
    ids = [question['id'] for question in round_questions]
    assert len(ids) == 15 and len(set(ids)) == 15, 'A round must contain 15 unique questions'
    for index, (low, high) in enumerate([(1, 5), (6, 10), (11, 15)]):
        block = round_questions[index * 5:index * 5 + 5]
        assert all(low <= question['level'] <= high for question in block), 'Each milestone must have five questions at its difficulty'
        assert [question['level'] for question in block] == sorted(question['level'] for question in block)
    assert any(int(question_id.removeprefix('pool-')) > 900 for question_id in ids), 'The full bank must be sampled'
    first_speech = parse_qs(urlparse(page.evaluate('window.__speechRequests[0]')).query)
    assert first_speech['position'] == ['1'], 'MC must announce the round position, independently of stored level'
    assert first_speech['questionId'] == [ids[0]]
    expect(page.locator('#current-question')).to_have_text(round_questions[0]['question'])
    print('PASS: 1000-question bank yields five unique questions per difficulty stage and correct MC round position')

    page.locator('.answer').nth(round_questions[0]['correct']).click()
    page.get_by_role('button', name='CHỐT ĐÁP ÁN').click()
    page.get_by_role('button', name='Đúng, tôi chốt!').click()
    expect(page.locator('.answer-explanation')).to_be_visible(timeout=6000)
    page.get_by_role('button', name='Câu tiếp theo').click()
    expect(page.locator('#current-question')).to_have_text(round_questions[1]['question'])
    page.wait_for_function('window.__speechRequests.length >= 2')
    second_speech = parse_qs(urlparse(page.evaluate('window.__speechRequests.at(-1)')).query)
    assert second_speech['position'] == ['2']

    current_bank = [{**question, 'question': f"Đã cập nhật {question['id']}"} for question in BANK]
    page.reload()
    expect(page.locator('#current-question')).to_have_text(round_questions[1]['question'])
    restored = snapshot(page)
    assert restored['index'] == 1
    assert restored['questions'] == round_questions, 'Refresh must retain the entire original round after Sheets edits'
    print('PASS: progressing then reloading keeps the saved random order, original content and current position')

    page.goto(URL + '/setup')
    expect(page.get_by_role('button', name='TÔI ĐÃ SẴN SÀNG')).to_be_enabled()
    page.get_by_role('button', name='TÔI ĐÃ SẴN SÀNG').click()
    next_round = snapshot(page)['questions']
    next_ids = [question['id'] for question in next_round]
    assert len(next_ids) == 15 and len(set(next_ids)) == 15
    assert next_ids != ids, 'Starting another game should draw a new round'
    expect(page.locator('#current-question')).to_have_text(next_round[0]['question'])
    assert all(question['question'].startswith('Đã cập nhật ') for question in next_round)
    print('PASS: a new game draws a changed unique sample and reads the updated bank')

    browser.close()

assert not ERRORS, ERRORS
print('PASS: no uncaught browser errors')
