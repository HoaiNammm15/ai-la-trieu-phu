"""Focused regression checks for speech cancellation and the question-bank lifecycle.
Run with npm run dev on port 5173, then python -u tests/feedback_smoke.py.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
URL = 'http://127.0.0.1:5173'
OUT = ROOT / 'qa-artifacts'
OUT.mkdir(exist_ok=True)
QUESTIONS = json.loads((ROOT / 'src/data/questions.json').read_text(encoding='utf-8'))
BANK = [{**q, 'level': i + 1, 'speechVersion': 'test-version'} for i, q in enumerate(QUESTIONS)]
ERRORS = []

LOCAL_SPEECH = """
window.__spoken = [];
window.__cancelled = 0;
window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
const voices = [
  {name: 'Microsoft HoaiMy Online (Natural)', lang: 'vi-VN'},
  {name: 'Microsoft NamMinh Online (Natural)', lang: 'vi-VN'}
];
Object.defineProperty(window, 'speechSynthesis', {value: {
  getVoices: () => voices,
  speak: speech => { window.__spoken.push({name: speech.voice.name, text: speech.text}); speech.onstart?.(); },
  cancel: () => { window.__cancelled++; },
  addEventListener: () => {}, removeEventListener: () => {}
}});
"""

REMOTE_SPEECH = """
window.__audioStarted = 0;
window.__audioPaused = 0;
window.__fetchAborted = 0;
window.__pendingSpeech = [];
window.__deferSpeech = false;
const originalFetch = window.fetch.bind(window);
window.fetch = (url, options) => {
  if (!String(url).startsWith('/api/speech')) return originalFetch(url, options);
  options.signal.addEventListener('abort', () => window.__fetchAborted++);
  const response = () => new Response(new Blob(['mock mp3'], {type: 'audio/mpeg'}), {headers: {'Content-Type': 'audio/mpeg'}});
  if (!window.__deferSpeech) return Promise.resolve(response());
  // Simulate a response racing with abort; the generation check must still reject it.
  return new Promise(resolve => window.__pendingSpeech.push(() => resolve(response())));
};
window.Audio = class {
  play() { window.__audioStarted++; this.onplaying?.(); return Promise.resolve(); }
  pause() { window.__audioPaused++; }
  removeAttribute() {}
};
"""


def start(page):
    page.goto(URL + '/setup')
    expect(page.get_by_role('button', name='TÔI ĐÃ SẴN SÀNG')).to_be_enabled()
    page.get_by_role('button', name='TÔI ĐÃ SẴN SÀNG').click()
    expect(page.locator('#current-question')).to_have_text(QUESTIONS[0]['question'])


def mock_bank(page, remote=False):
    page.route('**/api/questions', lambda route: route.fulfill(json={'source': 'sheets', 'questions': BANK, 'speechEnabled': remote}))


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    local = browser.new_context(viewport={'width': 1366, 'height': 768}, reduced_motion='reduce')
    local.add_init_script('Math.random = () => 0;\n' + LOCAL_SPEECH)
    page = local.new_page()
    page.on('pageerror', lambda e: ERRORS.append(str(e)))
    mock_bank(page)
    page.goto(URL)
    page.evaluate("localStorage.setItem('millionaire-settings', JSON.stringify({sound:true,timer:false}))")
    start(page)
    page.wait_for_function('window.__spoken.length >= 1')
    spoken = page.evaluate('window.__spoken.length')
    assert page.evaluate('window.__spoken[0].name') == 'Microsoft NamMinh Online (Natural)'
    expect(page.locator('.character--talking')).to_have_count(1)
    page.locator('.answer').nth(1).click()
    expect(page.locator('.character--talking')).to_have_count(1)
    cancelled = page.evaluate('window.__cancelled')
    page.get_by_role('button', name='CHỐT ĐÁP ÁN').click()
    assert page.evaluate('window.__cancelled') > cancelled
    expect(page.locator('.character--talking')).to_have_count(0)
    page.get_by_role('button', name='Suy nghĩ thêm').click()
    expect(page.get_by_role('button', name='MC nhắc lại câu hỏi')).to_be_enabled()
    assert page.evaluate('window.__spoken.length') == spoken
    page.get_by_role('button', name='MC nhắc lại câu hỏi').click()
    page.wait_for_function('(count) => window.__spoken.length === count + 1', arg=spoken)
    page.get_by_role('button', name='CHỐT ĐÁP ÁN').click()
    page.get_by_role('button', name='Đúng, tôi chốt!').click()
    expect(page.get_by_role('button', name='MC nhắc lại câu hỏi')).to_be_disabled()
    for answer in page.locator('.answer').all():
        expect(answer).to_be_disabled()
    assert page.evaluate('window.__spoken.length') == spoken + 1
    expect(page.locator('.answer-explanation')).to_be_visible()
    page.get_by_role('button', name='Câu tiếp theo').click()
    page.wait_for_function('(count) => window.__spoken.length === count + 2', arg=spoken)
    page.goto(URL + '/setup')
    page.screenshot(path=str(OUT / 'feedback-setup-desktop.png'))
    print('PASS: male selection, talking expression, immediate stop, cancel confirmation, locked repeat/answers')

    remote = browser.new_context(viewport={'width': 1366, 'height': 768}, reduced_motion='reduce')
    remote.add_init_script('Math.random = () => 0;\n' + LOCAL_SPEECH + REMOTE_SPEECH)
    page = remote.new_page()
    page.on('pageerror', lambda e: ERRORS.append(str(e)))
    mock_bank(page, remote=True)
    page.goto(URL)
    page.evaluate("localStorage.setItem('millionaire-settings', JSON.stringify({sound:true,timer:false}))")
    start(page)
    page.wait_for_function('window.__audioStarted === 1')
    assert page.evaluate('window.__spoken.length') == 0
    page.locator('.answer').nth(1).click()
    page.get_by_role('button', name='CHỐT ĐÁP ÁN').click()
    assert page.evaluate('window.__audioPaused') == 1
    page.get_by_role('button', name='Suy nghĩ thêm').click()
    page.evaluate('window.__deferSpeech = true')
    page.get_by_role('button', name='MC nhắc lại câu hỏi').click()
    page.wait_for_function('window.__pendingSpeech.length === 1')
    page.get_by_role('button', name='CHỐT ĐÁP ÁN').click()
    page.get_by_role('button', name='Đúng, tôi chốt!').click()
    page.evaluate('window.__pendingSpeech.splice(0).forEach(resolve => resolve())')
    page.wait_for_timeout(200)
    assert page.evaluate('window.__audioStarted') == 1, 'Late speech played after locking'
    assert page.evaluate('window.__fetchAborted') >= 1
    expect(page.locator('.character--talking')).to_have_count(0)
    print('PASS: remote audio stops and a late network response cannot restart speech after lock')
    page.reload()
    expect(page.get_by_role('button', name='MC nhắc lại câu hỏi')).to_be_disabled()
    for answer in page.locator('.answer').all():
        expect(answer).to_be_disabled()
    expect(page.locator('.answer-explanation')).to_be_visible()
    assert page.evaluate('window.__audioStarted') == 0
    print('PASS: reloading a locked answer keeps it locked and completes the reveal')

    page.goto(URL + '/setup')
    mock_error = lambda route: route.fulfill(status=503, json={'error': 'Kho câu hỏi cần ít nhất 15 câu đang hoạt động.'})
    page.unroute('**/api/questions')
    page.route('**/api/questions', mock_error)
    page.reload()
    expect(page.locator('.bank-status')).to_contain_text('ít nhất 15 câu')
    expect(page.get_by_role('button', name='TÔI ĐÃ SẴN SÀNG')).to_be_disabled()
    page.unroute('**/api/questions')
    mock_bank(page)
    page.get_by_role('button', name='Thử lại').click()
    expect(page.get_by_role('button', name='TÔI ĐÃ SẴN SÀNG')).to_be_enabled()
    page.get_by_role('button', name='TÔI ĐÃ SẴN SÀNG').click()
    page.evaluate('sessionStorage.setItem("saved-round", sessionStorage.getItem("millionaire-game-v1"))')
    page.unroute('**/api/questions')
    changed = [{**q, 'question': 'Nội dung mới trong Sheet'} if i == 0 else q for i, q in enumerate(BANK)]
    page.route('**/api/questions', lambda route: route.fulfill(json={'source': 'sheets', 'questions': changed, 'speechEnabled': False}))
    page.reload()
    expect(page.locator('#current-question')).to_have_text(QUESTIONS[0]['question'])
    page.goto(URL + '/setup')
    page.get_by_role('button', name='TÔI ĐÃ SẴN SÀNG').click()
    expect(page.locator('#current-question')).to_have_text('Nội dung mới trong Sheet')
    print('PASS: Sheets failure/retry, saved round survives edits, new round reads updates')
    browser.close()

assert not ERRORS, ERRORS
print('PASS: no uncaught browser errors')
