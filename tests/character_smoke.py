"""Character selection, visual variants, saved sessions and legacy migration.
Run with npm run dev on port 5173, then python -u tests/character_smoke.py.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
URL = 'http://127.0.0.1:5173'
OUT = ROOT / 'qa-artifacts'
OUT.mkdir(exist_ok=True)
QUESTIONS = json.loads((ROOT / 'src/data/questions.json').read_text(encoding='utf-8'))
BANK = [{**question, 'level': index + 1} for index, question in enumerate(QUESTIONS)]
ERRORS = []


def saved_player(page):
    return page.evaluate('JSON.parse(sessionStorage.getItem("millionaire-game-v1")).player')


def player_character(page, gender):
    character = page.locator('svg[role="img"] .character--player')
    expect(character).to_have_count(1)
    expect(character).to_have_attribute('data-gender', gender)
    return character


def choose_character(page, label):
    radio = page.get_by_role('radio', name=label, exact=True)
    radio.check()
    expect(radio).to_be_checked()


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1366, 'height': 768}, reduced_motion='reduce')
    context.add_init_script("Math.random = () => 0; localStorage.setItem('millionaire-settings', JSON.stringify({sound:false,timer:false}))")
    context.route('**/api/questions', lambda route: route.fulfill(json={
        'source': 'sample', 'questions': BANK, 'speechEnabled': False,
    }))
    page = context.new_page()
    page.on('pageerror', lambda error: ERRORS.append(str(error)))

    page.goto(URL + '/setup')
    female = page.get_by_role('radio', name='Nhân vật nữ', exact=True)
    male = page.get_by_role('radio', name='Nhân vật nam', exact=True)
    expect(female).to_be_checked()
    female_shapes = player_character(page, 'female').evaluate(
        "node => Array.from(node.querySelectorAll('path')).map(path => path.getAttribute('d')).join('|')"
    )
    choose_character(page, 'Nhân vật nam')
    expect(male).to_be_checked()
    expect(female).not_to_be_checked()
    male_shapes = player_character(page, 'male').evaluate(
        "node => Array.from(node.querySelectorAll('path')).map(path => path.getAttribute('d')).join('|')"
    )
    assert female_shapes != male_shapes, 'Male and female previews should have distinct silhouettes'
    female.focus()
    female.press('Space')
    expect(female).to_be_checked()
    player_character(page, 'female')
    print('PASS: female default, native male/female radios and distinct live previews')

    for gender, label in [('male', 'Nhân vật nam'), ('female', 'Nhân vật nữ')]:
        page.goto(URL + '/setup')
        page.get_by_label('MC nên gọi bạn là gì?').fill('Người chơi ' + ('nam' if gender == 'male' else 'nữ'))
        choose_character(page, label)
        player_character(page, gender)
        page.evaluate('document.fonts.ready')
        page.screenshot(path=str(OUT / f'characters-setup-{gender}-1366x768.png'))
        page.get_by_role('button', name='TÔI ĐÃ SẴN SÀNG').click()
        expect(page).to_have_url(URL + '/game')
        expect(page.locator('#current-question')).to_have_text(QUESTIONS[0]['question'])
        player_character(page, gender)
        assert saved_player(page)['gender'] == gender
        assert 'outfit' not in saved_player(page)
        page.reload()
        player_character(page, gender)
        assert saved_player(page)['gender'] == gender
        page.screenshot(path=str(OUT / f'characters-game-{gender}-1366x768.png'))
        page.get_by_role('button', name='Dừng chơi').click()
        page.get_by_role('button', name='Dừng & nhận thưởng').click()
        expect(page).to_have_url(URL + '/result')
        player_character(page, gender)
        page.reload()
        player_character(page, gender)
        assert saved_player(page)['gender'] == gender
        print(f'PASS: {gender} selection persists through game reload, result and result reload')

    legacy = page.evaluate('JSON.parse(sessionStorage.getItem("millionaire-game-v1"))')
    legacy.update(player={'name': 'Phiên cũ', 'outfit': 'mint'}, index=0, phase='asking',
                  selected=None, isCorrect=None, answered=0, result=None)
    page.evaluate('(state) => sessionStorage.setItem("millionaire-game-v1", JSON.stringify(state))', legacy)
    page.goto(URL + '/game')
    expect(page.locator('#current-question')).to_have_text(QUESTIONS[0]['question'])
    player_character(page, 'female')
    assert saved_player(page) == {'name': 'Phiên cũ', 'gender': 'female'}
    print('PASS: a saved outfit session keeps its name and round while migrating to female')

    page.set_viewport_size({'width': 390, 'height': 844})
    page.goto(URL + '/setup')
    choose_character(page, 'Nhân vật nam')
    player_character(page, 'male')
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
    page.screenshot(path=str(OUT / 'characters-setup-male-390x844.png'))
    browser.close()

assert not ERRORS, ERRORS
print('PASS: no uncaught browser errors')
