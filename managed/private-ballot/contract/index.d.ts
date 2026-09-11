export type Ledger = {
  votingOpen: boolean;
  admin: Uint8Array;
  yesVotes: bigint;
  noVotes: bigint;
  allowlist: string[];
};

export declare function ledger(state: any): Ledger;

export declare class Contract<T> {
  constructor(witnesses: any);
  impureCircuits: {
    castVote(ctx: any, choice: boolean): any;
    closeVoting(ctx: any): any;
  };
  initialState(ctx: any, admin: any, description: any, voters: any): any;
}
