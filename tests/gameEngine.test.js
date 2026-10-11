import test from 'node:test';
import assert from 'node:assert/strict';
import { initialGame, normalizePlayer, gameReducer, fiftyFifty, audienceVotes } from '../src/hooks/gameEngine.js';
import { moneyLadder } from '../src/data/moneyLadder.js';

const question = { answers: ['A', 'B', 'C', 'D'], correct: 1 };
function answer(state, correct = true) {
  state = gameReducer(state, { type: 'SELECT', answer: correct ? 1 : 0 });
  state = gameReducer(state, { type: 'CONFIRM' });
  state = gameReducer(state, { type: 'LOCK' });
  state = gameReducer(state, { type: 'REVEAL', correct: 1 });
  return state;
}
function reach(count) {
  let state = initialGame();
  for (let i = 0; i < count; i++) state = gameReducer(answer(state), {type:'NEXT'});
  return state;
}

test('new and legacy players default to female without retaining outfit preferences', () => {
  assert.deepEqual(initialGame().player, { name: 'nemnguynx', gender: 'female' });
  const legacy = { name: 'Linh', outfit: 'mint' };
  assert.deepEqual(normalizePlayer(legacy), { name: 'Linh', gender: 'female' });
  assert.deepEqual(legacy, { name: 'Linh', outfit: 'mint' });
  assert.deepEqual(normalizePlayer({ name: 'Linh', gender: 'unknown' }), { name: 'Linh', gender: 'female' });
  for (const gender of ['male', 'female']) {
    assert.deepEqual(initialGame({ name: 'Linh', gender }).player, { name: 'Linh', gender });
  }
});

test('locking requires confirmation and blocks answer changes and lifelines', () => {
  let state = initialGame();
  assert.equal(gameReducer(state, {type:'LOCK'}), state);
  assert.equal(gameReducer(state, {type:'SELECT', answer:9}), state);
  state = gameReducer(state, {type:'SELECT', answer:1});
  state = gameReducer(state, {type:'CONFIRM'});
  assert.equal(gameReducer(state, {type:'CANCEL'}).phase, 'selecting');
  state = gameReducer(state, {type:'LOCK'});
  for (const action of [{type:'SELECT', answer:0}, {type:'STOP'}, {type:'LIFELINE', kind:'phone'}, {type:'NEXT'}]) {
    assert.equal(gameReducer(state, action), state);
  }
  assert.equal(state.selected, 1);
});

test('wrong answers and timeouts pay the last completed safety milestone', () => {
  for (const [count, payout] of [[0, 0], [4, 0], [5, 2000000], [9, 2000000], [10, 22000000], [14, 22000000]]) {
    const state = reach(count);
    const lost = gameReducer(answer(state, false), {type:'NEXT'});
    assert.equal(lost.result.prize, payout, `lost after ${count} correct answers`);
    assert.equal(lost.result.answered, count);
    const timeout = gameReducer(state, {type:'TIMEOUT'});
    assert.equal(timeout.result.prize, payout);
  }
});

test('voluntary stopping pays the last correct answer, including between milestones', () => {
  for (let count = 0; count < 15; count++) {
    const stopped = gameReducer(reach(count), {type:'STOP'});
    assert.equal(stopped.result.kind, 'stopped');
    assert.equal(stopped.result.prize, count ? moneyLadder[count - 1] : 0);
  }
});

test('15 correct answers win 150 million and finish exactly once', () => {
  const state = reach(15);
  assert.equal(state.phase, 'finished');
  assert.deepEqual(state.result, {kind:'won', answered:15, prize:150000000});
  assert.equal(gameReducer(state, {type:'NEXT'}), state);
});

test('50:50 removes exactly two wrong answers, clears eliminated selection, and is single use', () => {
  for (let run = 0; run < 50; run++) {
    const hidden = fiftyFifty(question);
    assert.equal(new Set(hidden).size, 2);
    assert.ok(!hidden.includes(question.correct));
    let state = gameReducer(initialGame(), {type:'SELECT', answer:hidden[0]});
    state = gameReducer(state, {type:'LIFELINE', kind:'fifty', hidden});
    assert.equal(state.selected, null);
    assert.equal(state.phase, 'asking');
    assert.equal(gameReducer(state, {type:'SELECT', answer:hidden[0]}), state);
    assert.equal(gameReducer(state, {type:'LIFELINE', kind:'fifty', hidden:[0,3]}), state);
    assert.equal(gameReducer(state, {type:'LIFELINE', kind:'unknown'}), state);
  }
});

test('audience votes sum to 100% and never vote for removed options', () => {
  for (let difficulty = 0; difficulty < 15; difficulty++) {
    const hidden = fiftyFifty(question);
    const votes = audienceVotes(question, hidden, difficulty);
    assert.equal(votes.reduce((a,b) => a+b, 0), 100);
    assert.ok(votes.every(value => Number.isInteger(value) && value >= 0));
    hidden.forEach(index => assert.equal(votes[index], 0));
  }
});

test('player choice and lifelines persist between questions and new games reset all state', () => {
  let state = initialGame({name:'Linh', gender:'male'});
  state = gameReducer(state, {type:'LIFELINE', kind:'phone'});
  state = gameReducer(state, {type:'LIFELINE', kind:'audience'});
  state = gameReducer(answer(state), {type:'NEXT'});
  assert.equal(state.lifelines.phone, true);
  assert.equal(state.lifelines.audience, true);
  assert.equal(state.index, 1);
  assert.deepEqual(state.player, {name:'Linh', gender:'male'});
  assert.equal(state.selected, null);
  assert.deepEqual(state.hidden, []);
  assert.deepEqual(initialGame().lifelines, {fifty:false, audience:false, phone:false});
});
