import test from 'node:test';
import assert from 'node:assert/strict';

// 1. Department Acceptance & Rejection Rules
function validateDepartmentAction(action, reasonBn) {
  if (action === 'accept') {
    return { valid: true };
  }
  if (action === 'reject') {
    if (!reasonBn || reasonBn.trim().length === 0) {
      return { valid: false, error: 'Rejection requires a mandatory reason in Bangla' };
    }
    return { valid: true };
  }
  return { valid: false, error: 'Invalid department action' };
}

// 2. Officer Eligibility and Capacity Constraint
function isOfficerEligibleForTask(officer, task) {
  // Must belong to the responsible department
  if (officer.department_id !== task.department_id) {
    return { eligible: false, reason: 'Department mismatch' };
  }
  // Must be available
  if (officer.availability_status !== 'available') {
    return { eligible: false, reason: `Officer is ${officer.availability_status}` };
  }
  // Must cover the ward/zone if ward is assigned
  if (officer.ward_id && task.ward_id && officer.ward_id !== task.ward_id) {
    return { eligible: false, reason: 'Ward coverage mismatch' };
  }
  // Must have capacity remaining
  if (officer.current_active_tasks >= officer.max_concurrent_tasks) {
    return { eligible: false, reason: 'Officer is at maximum capacity' };
  }
  return { eligible: true, reason: 'Eligible with available capacity' };
}

// 3. Sequential Task Prerequisite Guard
function isTaskBlockedByPrerequisites(task, caseTasks) {
  if (!task.prerequisite_task_ids || task.prerequisite_task_ids.length === 0) {
    return false;
  }
  for (const prereqId of task.prerequisite_task_ids) {
    const prereq = caseTasks.find(t => t.id === prereqId);
    if (!prereq || prereq.status !== 'completed') {
      return true; // Blocked!
    }
  }
  return false;
}

// 4. Queue Ranking Policy
function computeQueuePriorityScore(queueItem) {
  const priorityWeights = {
    critical: 100,
    high: 70,
    medium: 40,
    low: 10
  };
  const baseScore = priorityWeights[queueItem.priority] || 40;
  const waitingBonus = Math.min(queueItem.waiting_hours * 2, 50); // Fairness: up to 50 pts for waiting
  const slaUrgency = queueItem.sla_breach_risk === 'high' ? 60 : (queueItem.sla_breach_risk === 'medium' ? 30 : 0);
  return baseScore + waitingBonus + slaUrgency;
}

// Tests
test('validateDepartmentAction enforces mandatory reason on rejection', () => {
  const acceptRes = validateDepartmentAction('accept', '');
  assert.equal(acceptRes.valid, true);

  const rejectWithoutReason = validateDepartmentAction('reject', '');
  assert.equal(rejectWithoutReason.valid, false);
  assert.ok(rejectWithoutReason.error.includes('mandatory reason'));

  const rejectWithReason = validateDepartmentAction('reject', 'বর্জ্য অপসারণ না হওয়ায় ড্রেন মেরামত শুরু করা যাচ্ছে না');
  assert.equal(rejectWithReason.valid, true);
});

test('isOfficerEligibleForTask enforces department, ward, status, and capacity limits', () => {
  const task = { id: 't1', department_id: 'dept_drainage', ward_id: 'ward_04' };

  // Officer in different department
  const wrongDeptOfficer = {
    id: 'off_waste',
    department_id: 'dept_waste',
    ward_id: 'ward_04',
    availability_status: 'available',
    current_active_tasks: 0,
    max_concurrent_tasks: 3
  };
  assert.equal(isOfficerEligibleForTask(wrongDeptOfficer, task).eligible, false);

  // Officer in different ward
  const wrongWardOfficer = {
    id: 'off_drain_other_ward',
    department_id: 'dept_drainage',
    ward_id: 'ward_09',
    availability_status: 'available',
    current_active_tasks: 0,
    max_concurrent_tasks: 3
  };
  assert.equal(isOfficerEligibleForTask(wrongWardOfficer, task).eligible, false);

  // Officer is busy / on leave
  const busyOfficer = {
    id: 'off_drain_busy',
    department_id: 'dept_drainage',
    ward_id: 'ward_04',
    availability_status: 'on_leave',
    current_active_tasks: 0,
    max_concurrent_tasks: 3
  };
  assert.equal(isOfficerEligibleForTask(busyOfficer, task).eligible, false);

  // Officer at max capacity
  const maxedOfficer = {
    id: 'off_drain_maxed',
    department_id: 'dept_drainage',
    ward_id: 'ward_04',
    availability_status: 'available',
    current_active_tasks: 3,
    max_concurrent_tasks: 3
  };
  assert.equal(isOfficerEligibleForTask(maxedOfficer, task).eligible, false);

  // Eligible officer with capacity
  const eligibleOfficer = {
    id: 'off_drain_ready',
    department_id: 'dept_drainage',
    ward_id: 'ward_04',
    availability_status: 'available',
    current_active_tasks: 1,
    max_concurrent_tasks: 4
  };
  const res = isOfficerEligibleForTask(eligibleOfficer, task);
  assert.equal(res.eligible, true);
  assert.equal(res.reason, 'Eligible with available capacity');
});

test('isTaskBlockedByPrerequisites prevents road repair before drain task completion', () => {
  const caseTasks = [
    { id: 't_waste', status: 'completed' },
    { id: 't_drain', status: 'in_progress' },
    { id: 't_road', status: 'pending', prerequisite_task_ids: ['t_drain'] }
  ];

  const roadTask = caseTasks[2];
  // Drain is in_progress -> Road must be blocked
  assert.equal(isTaskBlockedByPrerequisites(roadTask, caseTasks), true);

  // Mark drain as completed
  caseTasks[1].status = 'completed';
  // Road should now be unblocked
  assert.equal(isTaskBlockedByPrerequisites(roadTask, caseTasks), false);
});

test('computeQueuePriorityScore ranks SLA risk and critical emergency above routine tasks with fairness bonus', () => {
  const routineTask = {
    id: 'q1',
    priority: 'low',
    waiting_hours: 2,
    sla_breach_risk: 'low'
  };
  const routineScore = computeQueuePriorityScore(routineTask); // 10 + 4 + 0 = 14

  const criticalTask = {
    id: 'q2',
    priority: 'critical',
    waiting_hours: 1,
    sla_breach_risk: 'high'
  };
  const criticalScore = computeQueuePriorityScore(criticalTask); // 100 + 2 + 60 = 162

  assert.ok(criticalScore > routineScore, 'Critical SLA task must have higher priority than routine');

  // Long waiting routine task gets fairness boost
  const starvedTask = {
    id: 'q3',
    priority: 'medium',
    waiting_hours: 25,
    sla_breach_risk: 'medium'
  };
  const starvedScore = computeQueuePriorityScore(starvedTask); // 40 + 50 + 30 = 120
  assert.ok(starvedScore > routineScore, 'Starved task receives fairness elevation');
});
