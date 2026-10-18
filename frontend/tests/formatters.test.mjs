import test from 'node:test';
import assert from 'node:assert/strict';

// Test Bangla number conversion
function toBanglaNumber(num) {
  if (num === null || num === undefined) return '';
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => banglaDigits[parseInt(d, 10)]);
}

// Test SLA calculation logic
function calculateSlaCountdown(sla) {
  if (!sla || !sla.is_timer_running) {
    return { isRunning: false, isBreached: false, displayText: 'সময় গণনা স্থগিত' };
  }
  const remaining = sla.target_hours - sla.elapsed_hours;
  if (remaining <= 0) {
    return { isRunning: true, isBreached: true, displayText: 'এসএলএ সময়সীমা অতিক্রান্ত' };
  }
  return { isRunning: true, isBreached: false, displayText: `${toBanglaNumber(Math.round(remaining))} ঘণ্টা বাকি` };
}

// Test Role Permission logic
function canApproveCasePlan(role) {
  return role === 'coordinator' || role === 'admin';
}

function canUploadEvidence(role) {
  return role === 'officer' || role === 'ward_desk' || role === 'coordinator';
}

function canCitizenObject(role, isComplainant) {
  return role === 'citizen' && isComplainant;
}

test('toBanglaNumber correctly translates ASCII digits to Bangla digits', () => {
  assert.equal(toBanglaNumber(12345), '১২৩৪৫');
  assert.equal(toBanglaNumber(2026), '২০২৬');
  assert.equal(toBanglaNumber(0), '০');
});

test('calculateSlaCountdown calculates remaining hours and flags breaches correctly', () => {
  const normalSla = { is_timer_running: true, target_hours: 24, elapsed_hours: 10 };
  const resNormal = calculateSlaCountdown(normalSla);
  assert.equal(resNormal.isRunning, true);
  assert.equal(resNormal.isBreached, false);
  assert.equal(resNormal.displayText, '১৪ ঘণ্টা বাকি');

  const breachedSla = { is_timer_running: true, target_hours: 24, elapsed_hours: 26 };
  const resBreached = calculateSlaCountdown(breachedSla);
  assert.equal(resBreached.isBreached, true);
  assert.equal(resBreached.displayText, 'এসএলএ সময়সীমা অতিক্রান্ত');

  const pausedSla = { is_timer_running: false, target_hours: 24, elapsed_hours: 10 };
  const resPaused = calculateSlaCountdown(pausedSla);
  assert.equal(resPaused.isRunning, false);
  assert.equal(resPaused.displayText, 'সময় গণনা স্থগিত');
});

test('Role permissions strictly enforce coordinator sequence approval and citizen objection rights', () => {
  assert.equal(canApproveCasePlan('coordinator'), true);
  assert.equal(canApproveCasePlan('citizen'), false);
  assert.equal(canApproveCasePlan('officer'), false);

  assert.equal(canUploadEvidence('officer'), true);
  assert.equal(canUploadEvidence('citizen'), false);

  assert.equal(canCitizenObject('citizen', true), true);
  assert.equal(canCitizenObject('citizen', false), false);
  assert.equal(canCitizenObject('officer', true), false);
});
