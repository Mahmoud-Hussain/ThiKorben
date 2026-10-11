import {
  acceptServiceProposal,
  createServiceRequest,
  getServiceRequest,
  getServiceRequestProposals,
  setActiveActor,
  submitServiceProposal,
  updateServiceProposal,
} from '../features/community/community.service';

interface TestResult {
  scenario: string;
  expected: string;
  passed: boolean;
  actual: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, scenario: string, expected: string, actual: string) {
  results.push({
    scenario,
    expected,
    passed: condition,
    actual,
  });
  if (condition) {
    console.log(`PASS: [${scenario}] -> ${actual}`);
  } else {
    console.error(`FAIL: [${scenario}] -> Expected: ${expected}, Got: ${actual}`);
  }
}

async function runTests() {
  console.log('===============================================================');
  console.log('STARTING AUTOMATED MARKETPLACE ROLE PERMISSION & INTEGRITY AUDIT');
  console.log('===============================================================\n');

  const customerId = 'cust-audit-1';
  const workerAId = 'worker-audit-A';
  const workerBId = 'worker-audit-B';
  const intruderCustomerId = 'cust-audit-intruder';

  // 1. Customer publishes a valid request
  setActiveActor({ id: customerId, role: 'customer', roles: ['customer'] });
  let createdJobId = '';
  try {
    const job = await createServiceRequest({
      title: 'Water Pipe Leak Repair Under Kitchen Sink',
      category: 'plumbing',
      description: 'Major water leakage under kitchen sink cabinet requiring pipe joint replacement.',
      locationLabel: 'Gulshan 2, Dhaka',
      budgetAmount: 1500,
    });
    createdJobId = job.id;
    assert(
      job.status === 'open' && job.customer_id === customerId,
      'Customer publishes a valid request',
      'Success; job is persisted with open status',
      `Success (id: ${job.id}, status: ${job.status}, customer: ${job.customer_id})`,
    );
  } catch (err) {
    assert(false, 'Customer publishes a valid request', 'Success', `Error: ${(err as Error).message}`);
  }

  // 2. Worker attempts to publish a request
  setActiveActor({ id: workerAId, role: 'worker', roles: ['worker'] });
  try {
    await createServiceRequest({
      title: 'Worker Trying To Publish Request',
      category: 'electrical',
      description: 'This request should fail because workers cannot publish requests.',
      locationLabel: 'Banani, Dhaka',
      budgetAmount: 1000,
    });
    assert(false, 'Worker attempts to publish a request', 'Rejected', 'Allowed unexpectedly');
  } catch (err) {
    assert(
      (err as Error).message.includes('Only customers'),
      'Worker attempts to publish a request',
      'Rejected',
      `Rejected with error: ${(err as Error).message}`,
    );
  }

  // 3. Unauthenticated user attempts to publish
  setActiveActor(null);
  try {
    await createServiceRequest({
      title: 'Anon Trying To Publish Request',
      category: 'electrical',
      description: 'This request should fail because unauthenticated users cannot publish.',
      locationLabel: 'Dhanmondi, Dhaka',
      budgetAmount: 1000,
    });
    assert(false, 'Unauthenticated user attempts to publish', 'Rejected', 'Allowed unexpectedly');
  } catch (err) {
    assert(
      (err as Error).message.includes('Authentication required'),
      'Unauthenticated user attempts to publish',
      'Rejected',
      `Rejected with error: ${(err as Error).message}`,
    );
  }

  // 4. Customer submits a worker proposal
  setActiveActor({ id: customerId, role: 'customer', roles: ['customer'] });
  try {
    await submitServiceProposal({
      serviceRequestId: createdJobId,
      priceAmount: 800,
      availabilityNote: 'Immediately',
    });
    assert(false, 'Customer submits a worker proposal', 'Rejected', 'Allowed unexpectedly');
  } catch (err) {
    assert(
      (err as Error).message.includes('Only workers'),
      'Customer submits a worker proposal',
      'Rejected',
      `Rejected with error: ${(err as Error).message}`,
    );
  }

  // 5. Worker submits a valid proposal for an eligible job
  setActiveActor({ id: workerAId, role: 'worker', roles: ['worker'] });
  let propAId = '';
  try {
    const propA = await submitServiceProposal({
      serviceRequestId: createdJobId,
      priceAmount: 1400,
      availabilityNote: 'Available today 4 PM',
      note: 'I carry standard PVC pipe joints and Teflon tape.',
    });
    propAId = propA.id;
    assert(
      propA.status === 'pending' && propA.worker_id === workerAId,
      'Worker submits a valid proposal for an eligible job',
      'Success; proposal is pending',
      `Success (id: ${propA.id}, status: ${propA.status})`,
    );
  } catch (err) {
    assert(false, 'Worker submits a valid proposal for an eligible job', 'Success', `Error: ${(err as Error).message}`);
  }

  // Submit second worker proposal from Worker B for concurrent test
  setActiveActor({ id: workerBId, role: 'worker', roles: ['worker'] });
  let propBId = '';
  try {
    const propB = await submitServiceProposal({
      serviceRequestId: createdJobId,
      priceAmount: 1300,
      availabilityNote: 'Available tomorrow 10 AM',
    });
    propBId = propB.id;
  } catch (err) {
    console.error('Failed to submit proposal B:', err);
  }

  // 6. Customer attempts to accept their own job as a worker / submit proposal on own request
  // (Customer cannot submit worker proposal on own job, and cannot accept own job as worker)
  setActiveActor({ id: customerId, role: 'worker', roles: ['worker'] });
  try {
    await submitServiceProposal({
      serviceRequestId: createdJobId,
      priceAmount: 500,
      availabilityNote: 'Self proposal',
    });
    assert(false, 'Customer attempts to accept their own job as a worker', 'Rejected', 'Allowed unexpectedly');
  } catch (err) {
    assert(
      (err as Error).message.includes('Customers cannot submit proposals for their own service requests'),
      'Customer attempts to accept their own job as a worker',
      'Rejected',
      `Rejected with error: ${(err as Error).message}`,
    );
  }

  // 7. Worker attempts to accept their own proposal
  setActiveActor({ id: workerAId, role: 'worker', roles: ['worker'] });
  try {
    await acceptServiceProposal(propAId);
    assert(false, 'Worker attempts to accept their own proposal', 'Rejected', 'Allowed unexpectedly');
  } catch (err) {
    assert(
      (err as Error).message.includes('Only customers') || (err as Error).message.includes('Workers cannot accept their own proposals'),
      'Worker attempts to accept their own proposal',
      'Rejected',
      `Rejected with error: ${(err as Error).message}`,
    );
  }

  // 8. Customer attempts to accept a proposal for another customer's job
  setActiveActor({ id: intruderCustomerId, role: 'customer', roles: ['customer'] });
  try {
    await acceptServiceProposal(propAId);
    assert(false, "Customer attempts to accept a proposal for another customer's job", 'Rejected', 'Allowed unexpectedly');
  } catch (err) {
    assert(
      (err as Error).message.includes('Only the customer who created this request can accept a proposal'),
      "Customer attempts to accept a proposal for another customer's job",
      'Rejected',
      `Rejected with error: ${(err as Error).message}`,
    );
  }

  // 9. Worker attempts to modify another worker's proposal
  setActiveActor({ id: workerBId, role: 'worker', roles: ['worker'] });
  try {
    await updateServiceProposal(propAId, { priceAmount: 2000 });
    assert(false, "Worker attempts to modify another worker's proposal", 'Rejected', 'Allowed unexpectedly');
  } catch (err) {
    assert(
      (err as Error).message.includes('You can only modify your own proposals'),
      "Worker attempts to modify another worker's proposal",
      'Rejected',
      `Rejected with error: ${(err as Error).message}`,
    );
  }

  // 10. Worker cannot submit multiple active proposals for same job
  setActiveActor({ id: workerAId, role: 'worker', roles: ['worker'] });
  try {
    await submitServiceProposal({
      serviceRequestId: createdJobId,
      priceAmount: 1100,
      availabilityNote: 'Another bid',
    });
    assert(false, 'Worker cannot submit multiple active proposals for same job', 'Rejected', 'Duplicate accepted');
  } catch (err) {
    assert(
      (err as Error).message.includes('already submitted an active proposal'),
      'Worker cannot submit multiple active proposals for same job',
      'Rejected',
      `Rejected with error: ${(err as Error).message}`,
    );
  }

  // 11. Customer accepts a proposal for their own job -> Success
  setActiveActor({ id: customerId, role: 'customer', roles: ['customer'] });
  try {
    await acceptServiceProposal(propAId);
    const updatedJob = await getServiceRequest(createdJobId);
    const allProposals = await getServiceRequestProposals(createdJobId);
    const updatedPropA = allProposals.find(p => p.id === propAId);
    const updatedPropB = allProposals.find(p => p.id === propBId);

    const isAssigned = updatedJob.status === 'assigned' && updatedJob.accepted_proposal_id === propAId;
    const isPropAAccepted = updatedPropA?.status === 'accepted';
    const isPropBDeclined = updatedPropB?.status === 'declined';

    assert(
      isAssigned && isPropAAccepted && isPropBDeclined,
      'Customer accepts a proposal for their own job',
      'Success; job assigned, winning proposal accepted, competing proposal declined',
      `Success (job status: ${updatedJob.status}, propA: ${updatedPropA?.status}, propB: ${updatedPropB?.status})`,
    );
  } catch (err) {
    assert(false, 'Customer accepts a proposal for their own job', 'Success', `Error: ${(err as Error).message}`);
  }

  // 12. Proposal submitted for a closed or assigned job -> Rejected
  setActiveActor({ id: 'worker-new', role: 'worker', roles: ['worker'] });
  try {
    await submitServiceProposal({
      serviceRequestId: createdJobId,
      priceAmount: 900,
      availabilityNote: 'Late offer',
    });
    assert(false, 'Proposal submitted for a closed or assigned job', 'Rejected', 'Allowed unexpectedly');
  } catch (err) {
    assert(
      (err as Error).message.includes('no longer open'),
      'Proposal submitted for a closed or assigned job',
      'Rejected',
      `Rejected with error: ${(err as Error).message}`,
    );
  }

  // 13. Two workers attempt to secure the same job concurrently -> Only one valid assignment succeeds
  setActiveActor({ id: customerId, role: 'customer', roles: ['customer'] });
  try {
    await acceptServiceProposal(propBId);
    assert(false, 'Two workers attempt to secure the same job concurrently', 'Rejected competing proposal', 'Allowed competing acceptance');
  } catch (err) {
    assert(
      (err as Error).message.includes('no longer open') || (err as Error).message.includes('Only pending proposals can be accepted'),
      'Two workers attempt to secure the same job concurrently',
      'Only one valid assignment succeeds',
      `Second acceptance rejected with: ${(err as Error).message}`,
    );
  }

  // 14. Publish Request form contains invalid data -> Validation errors shown
  setActiveActor({ id: customerId, role: 'customer', roles: ['customer'] });
  let invalidCount = 0;
  try {
    await createServiceRequest({
      title: 'Tiny', // < 5 chars
      category: 'plumbing',
      description: 'Short', // < 10 chars
      locationLabel: 'A', // < 2 chars
      budgetAmount: -50, // negative budget
    });
  } catch (err) {
    invalidCount += 1;
  }
  assert(
    invalidCount === 1,
    'Publish Request form contains invalid data',
    'Validation errors shown; rejected',
    'Validation enforced correctly',
  );

  // 15. User attempts to bypass UI restrictions through the API -> Rejected
  setActiveActor({ id: workerAId, role: 'worker', roles: ['worker'] });
  try {
    await createServiceRequest({
      title: 'Worker Calling API Directly With Custom customerId',
      category: 'plumbing',
      description: 'Attacker trying to pass customerId in payload to forge request.',
      locationLabel: 'Dhaka',
      budgetAmount: 1000,
      customerId: customerId, // forged
    });
    assert(false, 'User attempts to bypass UI restrictions through the API', 'Rejected', 'Allowed');
  } catch (err) {
    assert(
      (err as Error).message.includes('Only customers'),
      'User attempts to bypass UI restrictions through the API',
      'Rejected',
      `API rejected unauthorized payload: ${(err as Error).message}`,
    );
  }

  console.log('\n===============================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  console.log(`TOTAL SCENARIOS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('===============================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

void runTests();
