
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export enum BetStatus {
  PENDING = 'PENDING',
  WON = 'WON',
  LOST = 'LOST',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  CASH_OUT = 'CASH_OUT'
}

export type Sport = 'Fútbol' | 'Baloncesto' | 'Tenis' | 'eSports' | 'Béisbol' | 'NFL' | 'MMA' | 'Ciclismo' | 'F1' | 'MotoGP' | 'Boxeo' | 'Caballos' | 'Otros';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'FREE' | 'PRO';
}

export interface Bankroll {
  id: string;
  name: string;
  initialCapital: number;
  color: string;
}

export interface Bet {
  id: string;
  bankrollId: string;
  date: string;
  bookmaker: string;
  sport: Sport;
  odds: number;
  stake: number;
  status: BetStatus;
  profit: number;
  description: string;
}

export interface BankrollStats {
  totalProfit: number;
  roi: number;
  yield: number;
  winRate: number;
  totalBets: number;
  activeBets: number;
  initialBankroll: number;
  currentBankroll: number;
}
