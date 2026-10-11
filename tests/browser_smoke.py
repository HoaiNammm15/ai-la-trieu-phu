"""Optional browser QA: pip install playwright; python -m playwright install chromium.
Start npm run dev, then run python tests/browser_smoke.py.
"""
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / 'qa-artifacts'
ARTIFACTS.mkdir(exist_ok=True)
QUESTIONS = json.loads((ROOT / 'src/data/questions.json').read_text(encoding='utf-8'))
URL = 'http://127.0.0.1:5173'
errors = []


def check_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Horizontal overflow'


def start_game(page, name='nemnguynx'):
    page.goto(URL + '/setup')
    page.get_by_label('MC nên gọi bạn là gì?').fill(name)
    page.get_by_role('radio', name='Nhân vật nam', exact=True).check()
    page.get_by_role('button', name='TÔI ĐÃ SẴN SÀNG').click()
    expect(page).to_have_url(URL + '/game')
    expect(page.locator('#current-question')).to_have_text(QUESTIONS[0]['question'])


def lock(page, index):
    page.locator('.answer').nth(index).click()
    page.get_by_role('button', name='CHỐT ĐÁP ÁN').click()
    expect(page.get_by_role('dialog')).to_be_visible()
    page.get_by_role('button', name='Đúng, tôi chốt!').click()
    expect(page.locator('.answer').first).to_be_disabled()
    expect(page.locator('.answer-explanation')).to_be_visible(timeout=6000)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1440, 'height': 1100}, reduced_motion='reduce')
    context.add_init_script('Math.random = () => 0;')
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(URL)
    expect(page.get_by_role('heading', level=1)).to_contain_text('AI LÀ TRIỆU PHÚ')
    page.evaluate('document.fonts.ready')
    check_overflow(page)
    page.screenshot(path=str(ARTIFACTS / 'home-desktop.png'), full_page=True)
    page.get_by_role('button', name='Xem luật chơi').click()
    expect(page.get_by_role('dialog')).to_be_visible()
    page.keyboard.press('Escape')
    expect(page.get_by_role('dialog')).to_have_count(0)

    start_game(page, 'nemnguynx')
    page.screenshot(path=str(ARTIFACTS / 'game-desktop.png'), full_page=True)
    page.get_by_role('button', name='MC', exact=True).click()
    page.get_by_role('button', name='Bạn', exact=True).click()
    page.get_by_role('button', name='Toàn cảnh', exact=True).click()
    page.get_by_role('button', name='MC nhắc lại câu hỏi').click()
    expect(page.locator('.dialogue-copy p')).to_contain_text(QUESTIONS[0]['question'])
    page.locator('.answer').nth(1).click()
    page.get_by_role('button', name='CHỐT ĐÁP ÁN').click()
    page.get_by_role('button', name='Suy nghĩ thêm').click()
    expect(page.locator('.answer').nth(1)).to_have_attribute('aria-pressed', 'true')

    page.get_by_role('button', name=re.compile('Hỏi khán giả,')).click()
    expect(page.locator('.chart-column')).to_have_count(4)
    total = sum(int(value.strip('%')) for value in page.locator('.chart-column > span').all_text_contents())
    assert total == 100
    page.get_by_role('button', name='Quay lại ghế nóng').click()
    page.get_by_role('button', name=re.compile('Gọi người thân,')).click()
    page.get_by_role('button', name='Gọi Ronaldo', exact=True).click()
    expect(page.locator('.phone-answer-card')).to_be_visible()
    page.get_by_role('button', name='Cúp máy & trở lại').click()
    page.get_by_role('button', name=re.compile('50:50,')).click()
    expect(page.locator('.answer-hidden')).to_have_count(2)
    assert not page.locator('.answer').nth(1).is_disabled()
    lock(page, 1)
    expect(page.locator('.answer-correct')).to_contain_text('Chiếc hài')
    page.get_by_role('button', name='Câu tiếp theo').click()
    expect(page.locator('#current-question')).to_have_text(QUESTIONS[1]['question'])
    expect(page.locator('.lifeline-buttons button.used')).to_have_count(3)
    page.reload()
    expect(page.locator('#current-question')).to_have_text(QUESTIONS[1]['question'])
    page.get_by_role('button', name='Dừng chơi').click()
    expect(page.locator('.stop-prize')).to_have_text('200.000 ₫')
    page.get_by_role('button', name='Dừng & nhận thưởng').click()
    expect(page).to_have_url(URL + '/result')
    expect(page.locator('.result-prize')).to_have_text('200.000 ₫')
    print('PASS: setup, camera, repeat, confirmation, lifelines, session restore, stopping')

    start_game(page)
    lock(page, 0)
    expect(page.locator('.answer-wrong')).to_have_count(1)
    expect(page.locator('.answer-correct')).to_have_count(1)
    page.get_by_role('button', name='Xem kết quả').click()
    expect(page.locator('.result-prize')).to_have_text('0 ₫')
    print('PASS: wrong answer reveals correct answer and safety payout')

    start_game(page, 'Nhà vô địch')
    for i, question in enumerate(QUESTIONS):
        expect(page.locator('#current-question')).to_have_text(question['question'])
        lock(page, question['correct'])
        page.get_by_role('button', name='Câu tiếp theo' if i < 14 else 'Xem kết quả').click()
    expect(page.locator('.result-prize')).to_have_text('150.000.000 ₫')
    expect(page.locator('.result-stats')).to_contain_text('15 / 15')
    page.screenshot(path=str(ARTIFACTS / 'result-desktop.png'), full_page=True)
    print('PASS: complete 15-question winning journey')

    mobile_context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, reduced_motion='reduce')
    mobile_context.add_init_script('Math.random = () => 0;')
    mobile = mobile_context.new_page()
    mobile.on('pageerror', lambda error: errors.append(str(error)))
    mobile.goto(URL)
    mobile.evaluate('document.fonts.ready')
    check_overflow(mobile)
    mobile.screenshot(path=str(ARTIFACTS / 'home-mobile.png'), full_page=True)
    start_game(mobile, 'Người chơi điện thoại')
    check_overflow(mobile)
    mobile.screenshot(path=str(ARTIFACTS / 'game-mobile.png'), full_page=True)
    boxes = [mobile.locator('.answer').nth(i).bounding_box() for i in range(4)]
    assert all(boxes[i]['y'] < boxes[i + 1]['y'] for i in range(3)), 'Mobile answers must use one column'
    mobile.locator('.mobile-ladder-button').click()
    expect(mobile.get_by_role('dialog')).to_be_visible()
    expect(mobile.get_by_role('dialog').locator('.ladder-list li')).to_have_count(15)
    mobile.get_by_role('button', name='Đóng hộp thoại').click()
    mobile.set_viewport_size({'width':320, 'height':740})
    check_overflow(mobile)
    print('PASS: mobile layout at 390px and 320px, one-column answers, money ladder dialog')

    start_game(page, 'Người chơi thử giờ')
    page.clock.install()
    page.get_by_role('button', name='Cài đặt', exact=True).click()
    page.get_by_role('switch', name='Bộ đếm thời gian').click()
    page.get_by_role('button', name='Xong rồi!').click()
    expect(page.locator('.timer')).to_have_text('60s')
    page.get_by_role('button', name='Cài đặt', exact=True).click()
    page.clock.run_for(10000)
    expect(page.locator('.timer')).to_have_text('60s')
    page.get_by_role('button', name='Xong rồi!').click()
    page.clock.run_for(61000)
    expect(page).to_have_url(URL + '/result')
    expect(page.get_by_role('heading', level=1)).to_contain_text('Hết giờ')
    print('PASS: optional timer pauses for dialogs and ends the game at zero')
    assert not errors, errors
    print('PASS: no uncaught browser errors')
    browser.close()
