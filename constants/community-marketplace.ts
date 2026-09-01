import { useSyncExternalStore } from 'react';

export type MarketplaceRole = 'customer' | 'worker';

export type JobCategory =
  | 'plumbing'
  | 'electrical'
  | 'carpentry'
  | 'cleaning'
  | 'painting'
  | 'ac';

export type JobStatus = 'open' | 'assigned' | 'ordered';

export type ProposalStatus = 'pending' | 'accepted' | 'declined';

export type WorkerProfile = {
  id: string;
  name: string;
  profession: string;
  rating: number;
  completedJobs: number;
  verified: boolean;
};

export type JobComment = {
  id: string;
  authorName: string;
  authorRole: MarketplaceRole;
  text: string;
  time: string;
};

export type JobProposal = {
  id: string;
  workerId: string;
  workerName: string;
  profession: string;
  rating: number;
  completedJobs: number;
  price: number;
  availability: string;
  note: string;
  status: ProposalStatus;
};

export type JobPost = {
  id: string;

  customerId: string;
  customerName: string;

  title: string;
  category: JobCategory;
  description: string;

  location: string;
  budget: number;
  schedule: string;

  photoUri?: string;

  createdAt: string;

  status: JobStatus;

  reactions: number;
  reactedBy: string[];

  comments: JobComment[];
  proposals: JobProposal[];

  acceptedProposalId?: string;
};

export type MessageRecommendation = {
  productId: string;
  reason: string;
  confidence: 'high' | 'medium';
};

export type MarketplaceChatMessage = {
  id: string;
  senderRole: MarketplaceRole | 'system';
  text: string;
  time: string;
  recommendations?: MessageRecommendation[];
};

export type ChatThread = {
  jobId: string;
  workerId: string;
  messages: MarketplaceChatMessage[];
};

export type ServiceOrder = {
  id: string;
  jobId: string;
  customerName: string;
  workerName: string;
  jobTitle: string;

  paymentMethod: string;

  laborCost: number;
  materialSubtotal: number;
  deliveryFee: number;
  shopPlatformFee: number;
  servicePlatformFee: number;
  grandTotal: number;

  createdAt: string;
};

export const CURRENT_CUSTOMER = {
  id: 'customer-nusrat',
  name: 'Nusrat Jahan',
};

export const WORKERS: WorkerProfile[] = [
  {
    id: 'worker-rahim',
    name: 'Rahim Ahmed',
    profession: 'Expert Plumber',
    rating: 4.9,
    completedJobs: 128,
    verified: true,
  },

  {
    id: 'worker-sajid',
    name: 'Sajid Hasan',
    profession: 'Electrical Technician',
    rating: 4.8,
    completedJobs: 94,
    verified: true,
  },

  {
    id: 'worker-farhan',
    name: 'Farhan Kabir',
    profession: 'Home Service Expert',
    rating: 4.7,
    completedJobs: 77,
    verified: true,
  },
];

export const CURRENT_WORKER = WORKERS[0];

let version = 0;

const listeners = new Set<() => void>();

function emitChange() {
  version += 1;

  listeners.forEach(listener => {
    listener();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getVersion() {
  return version;
}

export function useMarketplaceVersion() {
  return useSyncExternalStore(subscribe, getVersion, getVersion);
}

function nowLabel() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

let demoRole: MarketplaceRole = 'customer';

let selectedJobId: string | null = null;

let selectedWorkerId: string = CURRENT_WORKER.id;

let orderCounter = 1;

let orders: ServiceOrder[] = [];

let jobs: JobPost[] = [
  {
    id: 'seed-job-1',

    customerId: 'customer-ayesha',
    customerName: 'Ayesha Rahman',

    title: 'Bathroom Tap Is Leaking',
    category: 'plumbing',

    description:
      'The bathroom basin tap keeps dripping even after closing it properly. Looking for a plumber who can inspect and repair it.',

    location: 'Mirpur 10, Dhaka',
    budget: 900,
    schedule: 'Today',

    createdAt: '18 min ago',

    status: 'open',

    reactions: 7,

    reactedBy: [],

    comments: [
      {
        id: 'seed-comment-1',
        authorName: 'Rahim Ahmed',
        authorRole: 'worker',
        text: 'Is the leakage coming from the tap head or from the pipe below the basin?',
        time: '12 min ago',
      },
      {
        id: 'seed-comment-2',
        authorName: 'Ayesha Rahman',
        authorRole: 'customer',
        text: 'Mostly from the tap head. There is also a little water below the basin.',
        time: '9 min ago',
      },
    ],

    proposals: [
      {
        id: 'seed-proposal-1',
        workerId: CURRENT_WORKER.id,
        workerName: CURRENT_WORKER.name,
        profession: CURRENT_WORKER.profession,
        rating: CURRENT_WORKER.rating,
        completedJobs: CURRENT_WORKER.completedJobs,
        price: 700,
        availability: 'Today, after 5:00 PM',
        note: 'I can inspect both the tap and the basin connection. Any required materials will be confirmed before purchase.',
        status: 'pending',
      },
    ],
  },
];

let chatThreads: Record<string, ChatThread> = {};

export function getDemoRole() {
  return demoRole;
}

export function setDemoRole(role: MarketplaceRole) {
  demoRole = role;

  emitChange();
}

export function getJobs() {
  return jobs;
}

export function getJobById(jobId: string) {
  return jobs.find(job => job.id === jobId);
}

export function getSelectedJob() {
  if (!selectedJobId) {
    return undefined;
  }

  return getJobById(selectedJobId);
}

export function selectJob(jobId: string) {
  selectedJobId = jobId;

  emitChange();
}

export type CreateJobInput = {
  title: string;
  category: JobCategory;
  description: string;
  location: string;
  budget: number;
  schedule: string;
  photoUri?: string;
};

export function createJob(input: CreateJobInput) {
  const job: JobPost = {
    id: `job-${Date.now()}`,

    customerId: CURRENT_CUSTOMER.id,
    customerName: CURRENT_CUSTOMER.name,

    title: input.title,
    category: input.category,
    description: input.description,

    location: input.location,
    budget: input.budget,
    schedule: input.schedule,

    photoUri: input.photoUri,

    createdAt: 'Just now',

    status: 'open',

    reactions: 0,
    reactedBy: [],

    comments: [],
    proposals: [],
  };

  jobs = [job, ...jobs];

  selectedJobId = job.id;

  emitChange();

  return job;
}

function updateJob(jobId: string, updater: (job: JobPost) => JobPost) {
  jobs = jobs.map(job => (job.id === jobId ? updater(job) : job));

  emitChange();
}

export function toggleReaction(jobId: string, role: MarketplaceRole) {
  const actorId = role === 'customer' ? CURRENT_CUSTOMER.id : CURRENT_WORKER.id;

  updateJob(jobId, job => {
    const alreadyReacted = job.reactedBy.includes(actorId);

    return {
      ...job,

      reactions: alreadyReacted
        ? Math.max(0, job.reactions - 1)
        : job.reactions + 1,

      reactedBy: alreadyReacted
        ? job.reactedBy.filter(id => id !== actorId)
        : [...job.reactedBy, actorId],
    };
  });
}

export function hasReacted(job: JobPost, role: MarketplaceRole) {
  const actorId = role === 'customer' ? CURRENT_CUSTOMER.id : CURRENT_WORKER.id;

  return job.reactedBy.includes(actorId);
}

export function addJobComment(
  jobId: string,
  text: string,
  role: MarketplaceRole,
) {
  const cleanText = text.trim();

  if (!cleanText) {
    return;
  }

  const author = role === 'customer' ? CURRENT_CUSTOMER : CURRENT_WORKER;

  const comment: JobComment = {
    id: `comment-${Date.now()}`,

    authorName: author.name,
    authorRole: role,

    text: cleanText,
    time: 'Just now',
  };

  updateJob(jobId, job => ({
    ...job,
    comments: [...job.comments, comment],
  }));
}

export type ProposalInput = {
  price: number;
  availability: string;
  note: string;
};

export function sendWorkerProposal(jobId: string, input: ProposalInput) {
  const existingId = getJobById(jobId)?.proposals.find(
    proposal => proposal.workerId === CURRENT_WORKER.id,
  )?.id;

  const proposal: JobProposal = {
    id: existingId ?? `proposal-${Date.now()}`,

    workerId: CURRENT_WORKER.id,
    workerName: CURRENT_WORKER.name,

    profession: CURRENT_WORKER.profession,

    rating: CURRENT_WORKER.rating,

    completedJobs: CURRENT_WORKER.completedJobs,

    price: input.price,

    availability: input.availability,

    note: input.note,

    status: 'pending',
  };

  updateJob(jobId, job => {
    const alreadyExists = job.proposals.some(
      item => item.workerId === CURRENT_WORKER.id,
    );

    return {
      ...job,

      proposals: alreadyExists
        ? job.proposals.map(item =>
            item.workerId === CURRENT_WORKER.id ? proposal : item,
          )
        : [...job.proposals, proposal],
    };
  });

  return proposal;
}

export function getAcceptedProposal(jobId: string) {
  const job = getJobById(jobId);

  if (!job?.acceptedProposalId) {
    return undefined;
  }

  return job.proposals.find(proposal => proposal.id === job.acceptedProposalId);
}

function threadKey(jobId: string, workerId: string) {
  return `${jobId}:${workerId}`;
}

function ensureThread(job: JobPost, worker: WorkerProfile) {
  const key = threadKey(job.id, worker.id);

  if (!chatThreads[key]) {
    chatThreads[key] = {
      jobId: job.id,
      workerId: worker.id,

      messages: [
        {
          id: `system-inquiry-${job.id}-${worker.id}`,

          senderRole: 'system',

          text:
            `Private conversation started for "${job.title}". ` +
            'The worker can ask questions before sending or accepting a proposal.',

          time: nowLabel(),
        },
      ],
    };
  }

  const accepted = getAcceptedProposal(job.id);

  if (accepted?.workerId === worker.id) {
    const acceptanceId = `system-accepted-${job.id}-${worker.id}`;

    const alreadyAdded = chatThreads[key].messages.some(
      message => message.id === acceptanceId,
    );

    if (!alreadyAdded) {
      chatThreads[key].messages.push({
        id: acceptanceId,

        senderRole: 'system',

        text:
          `${accepted.workerName}'s proposal was accepted. ` +
          `This is now an active job chat with agreed labor cost ৳${accepted.price.toLocaleString()}.`,

        time: nowLabel(),
      });
    }
  }

  return chatThreads[key];
}

export function acceptProposal(jobId: string, proposalId: string) {
  const job = getJobById(jobId);

  if (!job) {
    return;
  }

  const accepted = job.proposals.find(proposal => proposal.id === proposalId);

  if (!accepted) {
    return;
  }

  jobs = jobs.map(item => {
    if (item.id !== jobId) {
      return item;
    }

    return {
      ...item,

      status: 'assigned',

      acceptedProposalId: proposalId,

      proposals: item.proposals.map(proposal => ({
        ...proposal,

        status:
          proposal.id === proposalId
            ? 'accepted'
            : proposal.status === 'pending'
              ? 'declined'
              : proposal.status,
      })),
    };
  });

  selectedJobId = jobId;
  selectedWorkerId = accepted.workerId;

  const worker =
    WORKERS.find(item => item.id === accepted.workerId) ?? CURRENT_WORKER;

  const updatedJob = getJobById(jobId);

  if (updatedJob) {
    ensureThread(updatedJob, worker);
  }

  emitChange();
}

export function getWorkerById(workerId: string) {
  return WORKERS.find(worker => worker.id === workerId);
}

export function openJobChat(
  jobId: string,
  workerId: string = CURRENT_WORKER.id,
) {
  const job = getJobById(jobId);

  const worker = getWorkerById(workerId) ?? CURRENT_WORKER;

  if (!job) {
    return;
  }

  selectedJobId = jobId;
  selectedWorkerId = worker.id;

  ensureThread(job, worker);

  emitChange();
}

export function getActiveChatContext() {
  const job = getSelectedJob() ?? jobs[0];

  if (!job) {
    return undefined;
  }

  const accepted = getAcceptedProposal(job.id);

  const workerId = accepted?.workerId ?? selectedWorkerId ?? CURRENT_WORKER.id;

  const worker = getWorkerById(workerId) ?? CURRENT_WORKER;

  const thread = ensureThread(job, worker);

  return {
    job,
    worker,
    thread,
    accepted,
    isAccepted: accepted?.workerId === worker.id,
  };
}

export function sendChatMessage(
  text: string,
  role: MarketplaceRole,
  recommendations?: MessageRecommendation[],
) {
  const context = getActiveChatContext();

  const cleanText = text.trim();

  if (!context || !cleanText) {
    return;
  }

  context.thread.messages.push({
    id: `message-${Date.now()}`,

    senderRole: role,

    text: cleanText,

    time: nowLabel(),

    recommendations: recommendations?.length ? recommendations : undefined,
  });

  emitChange();
}

export function getOrders() {
  return orders;
}

function createOrderId() {
  const date = new Date();

  const year = date.getFullYear().toString();

  const month = String(date.getMonth() + 1).padStart(2, '0');

  const day = String(date.getDate()).padStart(2, '0');

  const serial = String(orderCounter).padStart(3, '0');

  orderCounter += 1;

  return `TK-${year}${month}${day}-${serial}`;
}

export type CreateServiceOrderInput = {
  paymentMethod: string;

  laborCost: number;
  materialSubtotal: number;
  deliveryFee: number;
  shopPlatformFee: number;
  servicePlatformFee: number;
  grandTotal: number;
};

export function submitServiceOrder(input: CreateServiceOrderInput) {
  const job = getSelectedJob();

  if (!job) {
    return undefined;
  }

  const accepted = getAcceptedProposal(job.id);

  if (!accepted) {
    return undefined;
  }

  const order: ServiceOrder = {
    id: createOrderId(),

    jobId: job.id,

    customerName: job.customerName,

    workerName: accepted.workerName,

    jobTitle: job.title,

    paymentMethod: input.paymentMethod,

    laborCost: input.laborCost,

    materialSubtotal: input.materialSubtotal,

    deliveryFee: input.deliveryFee,

    shopPlatformFee: input.shopPlatformFee,

    servicePlatformFee: input.servicePlatformFee,

    grandTotal: input.grandTotal,

    createdAt: new Date().toLocaleString(),
  };

  orders = [order, ...orders];

  jobs = jobs.map(item =>
    item.id === job.id
      ? {
          ...item,
          status: 'ordered',
        }
      : item,
  );

  emitChange();

  return order;
}
