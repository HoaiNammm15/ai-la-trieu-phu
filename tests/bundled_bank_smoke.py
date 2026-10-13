"""Exercise the actual 1,000-question API, difficulty stages and saved rounds.

Start npm run dev, then run python tests/bundled_bank_smoke.py.
"""
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

URL = 'http://127.0.0.1:5173'
OUT = Path(__file__).resolve().parents[1] / 'qa-artifacts'
OUT.mkdir(exist_ok=True)


def saved_round(page):
    return page.evaluate('JSON.parse(sessionStorage.getItem("millionaire-game-v1"))')


def check_stages(questions):
    assert len(questions) == 15 and len({q['id'] for q in questions}) == 15
    for index, (low, high) in enumerate([(1, 5), (6, 10), (11, 15)]):
        block = questions[index * 5:index * 5 + 5]
        assert all(low <= q['level'] <= high for q in block)
        assert [q['level'] for q in block] == sorted(q['level'] for q in block)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1366, 'height': 768}, reduced_motion='reduce')
    context.add_init_script("localStorage.setItem('millionaire-settings', JSON.stringify({sound:false,timer:false}));")
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    response = context.request.get(URL + '/api/questions')
    assert response.status == 200
    payload = response.json()
    assert len(payload['questions']) == 1000
    assert len({q['id'] for q in payload['questions']}) == 1000
    by_id = {q['id']: q for q in payload['questions']}

    page.goto(URL + '/setup')
    expect(page.locator('.bank-status')).to_contain_text('1000 câu hỏi')
    page.get_by_role('button', name='TÔI ĐÃ SẴN SÀNG').click()
    expect(page).to_have_url(URL + '/game')
    first = saved_round(page)['questions']
    check_stages(first)
    assert all(q == by_id[q['id']] for q in first)
    page.reload()
    expect(page.locator('#current-question')).to_have_text(first[0]['question'])
    assert saved_round(page)['questions'] == first
    page.screenshot(path=str(OUT / 'question-bank-1000.png'))

    # Walk all three milestones and the winning screen using the actual answers.
    page.clock.install()
    for index, question in enumerate(first):
        expect(page.locator('#current-question')).to_have_text(question['question'])
        page.locator('.answer').nth(question['correct']).click()
        page.get_by_role('button', name='CHỐT ĐÁP ÁN').click()
        page.get_by_role('button', name='Đúng, tôi chốt!').click()
        page.clock.run_for(2000)
        expect(page.locator('.answer-explanation')).to_be_visible()
        page.get_by_role('button', name='Câu tiếp theo' if index < 14 else 'Xem kết quả').click()
    expect(page.locator('.result-prize')).to_have_text('150.000.000 ₫')
    expect(page.locator('.result-stats')).to_contain_text('15 / 15')

    page.goto(URL + '/setup')
    page.get_by_role('button', name='TÔI ĐÃ SẴN SÀNG').click()
    expect(page).to_have_url(URL + '/game')
    second = saved_round(page)['questions']
    check_stages(second)
    assert [q['id'] for q in second] != [q['id'] for q in first]

    # Check actual long questions and options on narrow, short screens.
    longest = max(payload['questions'], key=lambda q: len(q['question']) + sum(map(len, q['answers'])))
    state = saved_round(page)
    replacement = [q for q in state['questions'] if q['id'] != longest['id']]
    if len(replacement) < 15:
        extra = next(q for q in payload['questions'] if q['id'] not in {item['id'] for item in replacement} and q['id'] != longest['id'])
        replacement.append(extra)
    state.update(questions=[*replacement[:14], longest], index=14, answered=14)
    page.evaluate('(state) => sessionStorage.setItem("millionaire-game-v1", JSON.stringify(state))', state)
    for width, height in [(360, 640), (320, 568)]:
        page.set_viewport_size({'width': width, 'height': height})
        page.reload()
        expect(page.locator('#current-question')).to_have_text(longest['question'])
        for selector in ['#current-question', '.answer', '.question-actions .button']:
            assert page.locator(selector).count() > 0
            for element in page.locator(selector).all():
                box = element.bounding_box()
                assert box and box['x'] >= -1 and box['y'] >= -1 and box['x'] + box['width'] <= width + 1 and box['y'] + box['height'] <= height + 1, (selector, box, width, height)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.screenshot(path=str(OUT / f'question-bank-long-mobile-{width}.png'))
    assert not errors, errors
    browser.close()
print('PASS: actual API serves 1000 questions; 5 per stage, restore, full win and fresh round all work.')
