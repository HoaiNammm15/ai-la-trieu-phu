"""Browser regression checks for the phone lifeline.

Start npm run dev on port 5173, then run python -u tests/phone_smoke.py.
The question bank and speech voices are mocked; no account or TTS service is used.
"""
import json
import re
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
URL = 'http://127.0.0.1:5173'
ARTIFACTS = ROOT / 'qa-artifacts'
QUESTIONS = json.loads((ROOT / 'src/data/questions.json').read_text(encoding='utf-8'))
BANK = [{**question, 'level': index + 1, 'speechVersion': 'phone-test'}
        for index, question in enumerate(QUESTIONS)]
LETTERS = 'ABCD'
FIRST = QUESTIONS[0]
CORRECT = LETTERS[FIRST['correct']]
PHONE_NAME = re.compile(r'^Gọi người thân,')
CONTACTS = [
    ('Ronaldo', 'pt', 'Duarte'),
    ('Messi', 'es', 'Tomas'),
    ('Jack · J97', 'vi', 'NamMinh'),
    ('Sơn Tùng M-TP', 'vi', 'NamMinh'),
    ('Eimi Fukada', 'ja', 'Kyoko'),
]
ERRORS = []

# Utterances stay active until cancellation, so opening and hanging up must stop
# playback. Record speech only when it starts, rather than when it is requested.
LOCAL_SPEECH = """
Math.random = () => 0;
window.__spoken = [];
window.__cancelled = 0;
window.__activeSpeech = null;
window.SpeechSynthesisUtterance = class {
  constructor(text) { this.text = text; this.lang = ''; }
};
const voices = [
  {name: 'Microsoft HoaiMy Online (Natural)', lang: 'vi-VN'},
  {name: 'Microsoft NamMinh Online (Natural)', lang: 'vi-VN'},
  {name: 'Microsoft Duarte Online (Natural)', lang: 'pt-PT'},
  {name: 'Microsoft Tomas Online (Natural)', lang: 'es-AR'},
  {name: 'Microsoft Jorge Online (Natural)', lang: 'es-ES'},
  {name: 'Microsoft Kyoko Online (Natural)', lang: 'ja-JP'}
];
Object.defineProperty(window, 'speechSynthesis', {value: {
  getVoices: () => voices,
  speak: utterance => {
    const onstart = utterance.onstart;
    utterance.onstart = event => {
      window.__spoken.push({
        text: utterance.text, lang: utterance.lang,
        name: utterance.voice?.name || ''
      });
      window.__activeSpeech = utterance;
      onstart?.(event);
    };
    utterance.onstart({type: 'start'});
  },
  cancel: () => { window.__cancelled++; window.__activeSpeech = null; },
  addEventListener: () => {}, removeEventListener: () => {}
}});
"""


def new_game(browser, *, sound=True, viewport=None):
    viewport = viewport or {'width': 1366, 'height': 900}
    mobile = viewport['width'] < 600
    context = browser.new_context(viewport=viewport, is_mobile=mobile,
                                  has_touch=mobile, reduced_motion='reduce')
    settings = json.dumps({'sound': sound, 'timer': False})
    context.add_init_script(LOCAL_SPEECH + '\nlocalStorage.setItem('
                            '"millionaire-settings", ' + json.dumps(settings) + ');')
    page = context.new_page()
    page.on('pageerror', lambda error: ERRORS.append(str(error)))
    page.route('**/api/questions', lambda route: route.fulfill(json={
        'source': 'sheets', 'questions': BANK, 'speechEnabled': False,
    }))
    page.goto(URL + '/setup')
    expect(page.get_by_role('button', name='TÔI ĐÃ SẴN SÀNG')).to_be_enabled()
    page.get_by_role('button', name='TÔI ĐÃ SẴN SÀNG').click()
    expect(page.locator('#current-question')).to_have_text(FIRST['question'])
    if sound:
        page.wait_for_function('window.__spoken.length >= 1')
        assert 'NamMinh' in page.evaluate('window.__spoken[0].name')
        expect(page.locator('.character--talking')).to_have_count(1)
    return context, page


def saved_state(page):
    return page.evaluate('JSON.parse(sessionStorage.getItem("millionaire-game-v1"))')


def open_picker(page):
    page.get_by_role('button', name=PHONE_NAME).click()
    modal = page.get_by_role('dialog')
    expect(modal).to_be_visible()
    expect(page.locator('.phone-modal')).to_have_count(1)
    for name, _, _ in CONTACTS:
        expect(modal.get_by_role('button', name='Gọi ' + name, exact=True)).to_be_visible()
    expect(modal.locator('svg.phone-contact-avatar')).to_have_count(5)
    for avatar in modal.locator('svg.phone-contact-avatar').all():
        expect(avatar).to_have_attribute('aria-hidden', 'true')
    assert saved_state(page)['lifelines']['phone'] is False, 'Picker consumed the lifeline'
    return modal


def connect(page, name, answer=CORRECT):
    answer_text = FIRST['answers'][LETTERS.index(answer)]
    page.get_by_role('dialog').get_by_role('button', name='Gọi ' + name, exact=True).click()
    expect(page.locator('.phone-screen')).to_be_visible()
    expect(page.locator('.phone-answer-card')).to_have_count(0)
    assert saved_state(page)['lifelines']['phone'] is True
    expect(page.locator('.phone-answer-card')).to_be_visible(timeout=5000)
    card = page.locator('.phone-answer-card')
    expect(card).to_contain_text(answer)
    expect(card).to_contain_text(answer_text)
    expect(page.locator('.phone-caption')).to_be_visible()
    expect(page.locator('.phone-original')).to_be_visible()
    assert len(page.locator('.phone-caption').inner_text().strip()) > 25
    assert len(page.locator('.phone-original').inner_text().strip()) > 25
    suggested = page.locator('.phone-answer-options .is-suggested')
    expect(suggested).to_have_count(1)
    expect(suggested).to_have_attribute('data-answer', answer)


def check_fit(page):
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), \
        'Phone modal causes horizontal document overflow'
    viewport = page.viewport_size
    for selector in ('.phone-modal', '.phone-screen'):
        locator = page.locator(selector)
        if not locator.count():
            continue
        box = locator.bounding_box()
        assert box, f'{selector} has no visible bounds'
        assert box['x'] >= -1 and box['x'] + box['width'] <= viewport['width'] + 1, \
            f'{selector} extends beyond the viewport horizontally: {box}'
        assert box['y'] >= -1 and box['y'] + box['height'] <= viewport['height'] + 1, \
            f'{selector} extends beyond the viewport vertically: {box}'


def check_contact(browser, contact, screenshot=False):
    name, language, voice = contact
    context, page = new_game(browser)
    # Advice must leave a deliberately different player choice untouched.
    page.locator('.answer').nth(0).click()
    spoken_before = page.evaluate('window.__spoken.length')
    cancelled_before = page.evaluate('window.__cancelled')
    open_picker(page)
    assert page.evaluate('window.__cancelled') > cancelled_before, 'MC continued in picker'
    assert page.evaluate('window.__activeSpeech === null')
    expect(page.locator('.character--talking')).to_have_count(0)
    assert page.evaluate('window.__spoken.length') == spoken_before
    if screenshot:
        page.screenshot(path=str(ARTIFACTS / 'phone-picker-desktop.png'))
        page.keyboard.press('Escape')
        expect(page.get_by_role('dialog')).to_have_count(0)
        expect(page.get_by_role('button', name=PHONE_NAME)).to_be_enabled()
        expect(page.get_by_role('button', name=PHONE_NAME)).to_be_focused()
        assert saved_state(page)['lifelines']['phone'] is False
        assert saved_state(page)['selected'] == 0
        open_picker(page)
    connect(page, name)
    page.wait_for_function('(count) => window.__spoken.length === count + 1', arg=spoken_before)
    advice = page.evaluate('window.__spoken.at(-1)')
    assert advice['lang'].lower().startswith(language), advice
    assert voice in advice['name'], advice
    assert len(advice['text'].strip()) > 25
    assert page.locator('.phone-original').inner_text().strip().strip('“”') == advice['text'], \
        'Native subtitle differs from spoken advice'
    assert saved_state(page)['selected'] == 0, 'Phone advice selected an answer'
    expect(page.locator('.answer').nth(0)).to_have_attribute('aria-pressed', 'true')
    expect(page.locator('.answer').nth(FIRST['correct'])).to_have_attribute('aria-pressed', 'false')

    page.get_by_role('button', name='Nghe lại tư vấn', exact=True).click()
    page.wait_for_function('(count) => window.__spoken.length === count + 2', arg=spoken_before)
    assert page.evaluate('window.__spoken.at(-1)') == advice, 'Replay changed the advice or voice'
    cancelled_before = page.evaluate('window.__cancelled')
    page.get_by_role('button', name='Cúp máy & trở lại', exact=True).click()
    expect(page.get_by_role('dialog')).to_have_count(0)
    assert page.evaluate('window.__cancelled') > cancelled_before, 'Hangup did not stop speech'
    assert page.evaluate('window.__activeSpeech === null')
    assert saved_state(page)['selected'] == 0
    expect(page.get_by_role('button', name=PHONE_NAME)).to_be_disabled()
    expect(page.get_by_role('button', name=PHONE_NAME)).to_have_class(re.compile(r'\bused\b'))
    expect(page.locator('#current-question')).to_have_text(FIRST['question'])
    if screenshot:
        page.reload()
        expect(page.get_by_role('button', name=PHONE_NAME)).to_be_disabled()
        assert saved_state(page)['lifelines']['phone'] is True
        expect(page.locator('.answer').nth(0)).to_have_attribute('aria-pressed', 'true')
    context.close()
    print(f'PASS: contact {CONTACTS.index(contact) + 1} ({language}) speech, subtitles, replay, hangup, and one use')


def check_early_hangup(browser):
    context, page = new_game(browser)
    open_picker(page)
    spoken_before = page.evaluate('window.__spoken.length')
    page.get_by_role('button', name='Gọi Eimi Fukada', exact=True).click()
    expect(page.locator('.phone-screen')).to_be_visible()
    expect(page.locator('.phone-answer-card')).to_have_count(0)
    page.keyboard.press('Escape')
    expect(page.get_by_role('dialog')).to_have_count(0)
    # Past the connection delay, a closed call must not restart audio.
    page.wait_for_timeout(1600)
    assert page.evaluate('window.__spoken.length') == spoken_before
    assert page.evaluate('window.__activeSpeech === null')
    assert saved_state(page)['lifelines']['phone'] is True
    expect(page.get_by_role('button', name=PHONE_NAME)).to_be_disabled()
    context.close()
    print('PASS: closing during connection cancels delayed speech and retains one use')


def check_fifty_fifty(browser):
    context, page = new_game(browser, sound=False)
    page.get_by_role('button', name=re.compile(r'^50:50,')).click()
    expect(page.locator('.answer-hidden')).to_have_count(2)
    hidden = saved_state(page)['hidden']
    open_picker(page)
    # Force an uncertain, incorrect suggestion; it must use the one wrong option
    # still available rather than either answer already removed by 50:50.
    alternative = next(index for index in range(4) if index not in hidden and index != FIRST['correct'])
    page.evaluate('Math.random = () => .99')
    connect(page, 'Ronaldo', answer=LETTERS[alternative])
    options = page.locator('.phone-answer-options [data-answer]')
    offered = {option.get_attribute('data-answer') for option in options.all()}
    assert offered == set(LETTERS), f'Phone answer labels are incomplete: {offered}'
    suggested = page.locator('.phone-answer-options .is-suggested').get_attribute('data-answer')
    assert LETTERS.index(suggested) not in hidden, 'Phone suggested an answer removed by 50:50'
    assert page.evaluate('window.__spoken.length') == 0, 'Muted call played audio'
    assert saved_state(page)['selected'] is None
    replay = page.get_by_role('button', name='Nghe lại tư vấn', exact=True)
    expect(replay).to_be_disabled()
    page.get_by_role('button', name='Cúp máy & trở lại', exact=True).click()
    expect(page.locator('.answer-hidden')).to_have_count(2)
    assert saved_state(page)['selected'] is None
    context.close()
    print('PASS: uncertain advice respects 50:50 and muted calls retain both subtitles')


def check_mobile(browser, viewport, screenshot=False):
    context, page = new_game(browser, sound=False, viewport=viewport)
    open_picker(page)
    check_fit(page)
    connect(page, 'Eimi Fukada')
    check_fit(page)
    if screenshot:
        page.screenshot(path=str(ARTIFACTS / 'phone-call-mobile.png'))
    page.get_by_role('button', name='Cúp máy & trở lại', exact=True).click()
    expect(page.get_by_role('dialog')).to_have_count(0)
    context.close()
    print(f'PASS: picker and connected call fit {viewport["width"]}x{viewport["height"]}')


if __name__ == '__main__':
    ARTIFACTS.mkdir(exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for index, contact in enumerate(CONTACTS):
            check_contact(browser, contact, screenshot=index == 0)
        check_early_hangup(browser)
        check_fifty_fifty(browser)
        check_mobile(browser, {'width': 390, 'height': 844}, screenshot=True)
        check_mobile(browser, {'width': 360, 'height': 640})
        browser.close()
    assert not ERRORS, ERRORS
    print('PASS: no uncaught browser errors')
