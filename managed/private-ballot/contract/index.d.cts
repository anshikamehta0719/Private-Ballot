import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<T> = {
  localSecretKey(context: __compactRuntime.WitnessContext<Ledger, T>): [T, Uint8Array];
}

export type ImpureCircuits<T> = {
  castVote(context: __compactRuntime.CircuitContext<T>, support_0: boolean): __compactRuntime.CircuitResults<T, []>;
  closeVoting(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, []>;
}

export type PureCircuits = {
}

export type Circuits<T> = {
  castVote(context: __compactRuntime.CircuitContext<T>, support_0: boolean): __compactRuntime.CircuitResults<T, []>;
  closeVoting(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, []>;
}

export type Ledger = {
  readonly admin: Uint8Array;
  readonly votingOpen: boolean;
  readonly proposal: string;
  eligibleVoters: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  usedNullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  readonly yesVotes: bigint;
  readonly noVotes: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> {
  witnesses: W;
  circuits: Circuits<T>;
  impureCircuits: ImpureCircuits<T>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<T>,
               adminKeyHash_0: Uint8Array,
               proposalText_0: string,
               initialVoterCommitments_0: Uint8Array[]): __compactRuntime.ConstructorResult<T>;
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
export declare const pureCircuits: PureCircuits;
