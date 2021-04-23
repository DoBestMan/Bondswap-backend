export interface Log {
  address: string;
  blockHash: string;
  blockNumber: string;
  data: string;
  logIndex: string;
  removed: boolean;
  topics: string[];
  transactionHash: string;
  transactionIndex: string;
}

export type PoolStatus = 'Live' | 'Filled' | 'Closed' | 'All';

// public 表示 public fixed pool and float pool
// fixed 表示 public fixed pool
export type PublicPoolType = 'public' | 'fixed' | 'float';

// private 表示 private fixed pool
export type PoolType = PublicPoolType | 'private';
