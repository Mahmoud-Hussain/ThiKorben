import React, { createContext, useContext, useState } from 'react';

export type AppRole = 'customer' | 'worker' | null;

export interface CustomerProfile {
  name: string;
  phone: string;
  location: string;
  emergencyContact: string;
  avatar?: string | null;
}

export interface WorkerProfile {
  name: string;
  phone: string;
  trade: string;
  experience: string;
  desiredRate: string;
  serviceRadius: number;
  avatar?: string | null;
}

interface SessionContextValue {
  role: AppRole;
  setRole: (role: AppRole) => void;
  customerProfile: CustomerProfile;
  setCustomerProfile: React.Dispatch<React.SetStateAction<CustomerProfile>>;
  updateCustomerProfile: (updates: Partial<CustomerProfile>) => void;
  workerProfile: WorkerProfile;
  setWorkerProfile: React.Dispatch<React.SetStateAction<WorkerProfile>>;
  updateWorkerProfile: (updates: Partial<WorkerProfile>) => void;
  clearSession: () => void;
  isLogoutModalVisible: boolean;
  setLogoutModalVisible: (visible: boolean) => void;
}

const DEFAULT_CUSTOMER: CustomerProfile = {
  name: 'Nusrat Ahmed',
  phone: '01812345678',
  location: 'Dhanmondi, Dhaka',
  emergencyContact: '01898765432',
  avatar: null,
};

const DEFAULT_WORKER: WorkerProfile = {
  name: 'Rahim Uddin',
  phone: '01812345678',
  trade: 'Plumber',
  experience: '5',
  desiredRate: '500',
  serviceRadius: 5,
  avatar: null,
};

const SessionContext = createContext<SessionContextValue>({
  role: null,
  setRole: () => {},
  customerProfile: DEFAULT_CUSTOMER,
  setCustomerProfile: () => {},
  updateCustomerProfile: () => {},
  workerProfile: DEFAULT_WORKER,
  setWorkerProfile: () => {},
  updateWorkerProfile: () => {},
  clearSession: () => {},
  isLogoutModalVisible: false,
  setLogoutModalVisible: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<AppRole>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(DEFAULT_CUSTOMER);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile>(DEFAULT_WORKER);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

  const updateCustomerProfile = (updates: Partial<CustomerProfile>) => {
    setCustomerProfile((prev) => ({ ...prev, ...updates }));
  };

  const updateWorkerProfile = (updates: Partial<WorkerProfile>) => {
    setWorkerProfile((prev) => ({ ...prev, ...updates }));
  };

  const clearSession = () => {
    setRole(null);
    setCustomerProfile(DEFAULT_CUSTOMER);
    setWorkerProfile(DEFAULT_WORKER);
    setLogoutModalVisible(false);
  };

  return (
    <SessionContext.Provider
      value={{
        role,
        setRole,
        customerProfile,
        setCustomerProfile,
        updateCustomerProfile,
        workerProfile,
        setWorkerProfile,
        updateWorkerProfile,
        clearSession,
        isLogoutModalVisible,
        setLogoutModalVisible,
      }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
