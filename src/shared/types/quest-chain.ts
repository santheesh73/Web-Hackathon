import type { Quest } from './quest';

export type ChainStatus = 'ACTIVE' | 'COMPLETED';
export type ChainStepStatus = 'LOCKED' | 'AVAILABLE' | 'COMPLETED';

export interface QuestChain {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: ChainStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuestChainStep {
  id: string;
  chainId: string;
  questId: string;
  stepOrder: number;
  status: ChainStepStatus;
  createdAt: string;
  updatedAt: string;
  quest?: Quest;
}

export interface QuestChainWithSteps extends QuestChain {
  steps: QuestChainStep[];
  totalSteps: number;
  completedSteps: number;
  progressPercent: number;
  currentStep?: QuestChainStep;
}

export interface ChainProgressionResult {
  chainId: string;
  chainTitle: string;
  completedStepOrder: number;
  totalSteps: number;
  completedSteps?: number;
  isChainCompleted: boolean;
  nextStepOrder?: number;
  nextQuestTitle?: string;
}
