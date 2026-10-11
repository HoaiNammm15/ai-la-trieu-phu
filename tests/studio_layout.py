"""Verify viewport fit and visible controls, rather than just hidden scrollbars.
Run against the dev server: python -u tests/studio_layout.py.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'qa-artifacts'
OUT.mkdir(exist_ok=True)
QUESTIONS = json.loads((ROOT / 'src/data/questions.json').read_text(encoding='utf-8'))
VIEWPORTS = [(1920,1080), (1440,900), (1366,768), (1280,720), (1024,600),
             (768,1024), (390,844), (375,667), (360,640), (320,568), (844,390)]
URL = 'http://127.0.0.1:5173'
errors = []
failures = []


def inside(page, selector):
    for node in page.locator(selector).all():
        if not node.is_visible():
            continue
        box = node.bounding_box()
        viewport = page.viewport_size
        if box and (box['x'] < -1 or box['y'] < -1 or box['x'] + box['width'] > viewport['width'] + 1 or box['y'] + box['height'] > viewport['height'] + 1):
            return f'{selector}: {box}'
    return None


def state_at(index, phase):
    return dict(player=dict(name='Người chơi tên dài 24 ký', gender='female'), index=index, phase=phase,
                selected=QUESTIONS[index]['correct'] if phase == 'reveal' else None,
                isCorrect=True if phase == 'reveal' else None, answered=index+1 if phase == 'reveal' else index,
                hidden=[], lifelines=dict(fifty=False, audience=False, phone=False), result=None)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(reduced_motion='reduce')
    page = context.new_page()
    page.on('pageerror', lambda err: errors.append(str(err)))
    for width, height in VIEWPORTS:
        page.set_viewport_size(dict(width=width, height=height))
        page.goto(URL)
        page.evaluate('document.fonts.ready')
        for selector in ['.site-header', '.home-intro', '.home-cta', '.home-features']:
            issue = inside(page, selector)
            if issue: failures.append(f'HOME {width}x{height}: {issue}')
        assert page.evaluate('document.documentElement.scrollHeight <= innerHeight + 1')
        if (width,height) in [(1440,900),(390,844)]:
            page.screenshot(path=str(OUT / f'studio-home-{width}.png'))
        page.goto(URL + '/setup')
        for selector in ['.site-header', '.setup-copy h1', '#player-name', '.character-choice', '.setup-copy .button-start']:
            issue = inside(page, selector)
            if issue: failures.append(f'SETUP {width}x{height}: {issue}')
        assert page.evaluate('document.documentElement.scrollHeight <= innerHeight + 1')
        if (width,height) in [(1440,900),(390,844)]:
            page.screenshot(path=str(OUT / f'studio-setup-{width}.png'))
        for result_kind in ['won', 'lost', 'stopped', 'timeout']:
            result_state = state_at(14, 'finished')
            result_state['result'] = dict(kind=result_kind, answered=15 if result_kind == 'won' else 10,
                                         prize=150000000 if result_kind == 'won' else 22000000)
            page.evaluate('(state) => sessionStorage.setItem("millionaire-game-v1", JSON.stringify(state))', result_state)
            page.goto(URL + '/result')
            for selector in ['.site-header', '.result-page h1', '.result-prize', '.result-stats', '.result-card .button']:
                issue = inside(page, selector)
                if issue: failures.append(f'RESULT {width}x{height} {result_kind}: {issue}')
            assert page.evaluate('document.documentElement.scrollHeight <= innerHeight + 1')
            if result_kind == 'won' and (width,height) in [(1440,900),(390,844)]:
                page.screenshot(path=str(OUT / f'studio-result-{width}.png'))
        for index in range(15):
            for phase in ['asking', 'reveal']:
                page.evaluate('(state) => sessionStorage.setItem("millionaire-game-v1", JSON.stringify(state))', state_at(index, phase))
                page.goto(URL + '/game')
                expect(page.locator('#current-question')).to_have_text(QUESTIONS[index]['question'])
                for selector in ['.site-header', '.studio-toolbar', '.stage-controls', '.dialogue-box', '#current-question', '.answer', '.question-actions .button', '.answer-explanation', '.desktop-ladder .money-ladder']:
                    issue = inside(page, selector)
                    if issue: failures.append(f'GAME {width}x{height} Q{index+1} {phase}: {issue}')
                assert page.evaluate('document.documentElement.scrollHeight <= innerHeight + 1')
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
                stage_height = page.locator('.studio-stage-space').bounding_box()['height']
                if stage_height < 45: failures.append(f'GAME {width}x{height} Q{index+1} {phase}: stage collapsed to {stage_height}px')
                if index == 0 and phase == 'asking' and (width,height) in [(1440,900),(1366,768),(390,844),(320,568),(844,390)]:
                    page.screenshot(path=str(OUT / f'studio-game-{width}x{height}.png'))
        print(f'CHECKED {width}x{height}: 15 questions, asking + reveal', flush=True)
    page.set_viewport_size(dict(width=1366, height=768))
    page.goto(URL)
    if page.get_by_role('button', name='Toàn màn hình', exact=True).count():
        page.get_by_role('button', name='Toàn màn hình', exact=True).click()
        expect(page.get_by_role('button', name='Thoát toàn màn hình', exact=True)).to_be_visible()
        page.get_by_role('button', name='Thoát toàn màn hình', exact=True).click()
        expect(page.get_by_role('button', name='Toàn màn hình', exact=True)).to_be_visible()
        print('PASS: native fullscreen enter and exit')
    browser.close()
assert not errors, errors
assert not failures, '\n'.join(failures)
print('PASS: all 4 screens and 15 questions fit 11 viewports without page scrolling or clipped controls')
