function toHex(bytes) {
  return Buffer.from(bytes).toString('hex');
}
function commitmentFor(secret) {
  return secret; // mock commitment is just the secret
}
export function ledger(state) {
  return state;
}

export class Contract {
  constructor(witnesses) {
    this.witnesses = witnesses;
    this.voted = new Set();
    
    this.impureCircuits = {
      castVote: (ctx, choice) => {
        const state = ctx.transactionContext.state;
        if (!state.votingOpen) throw new Error("voting is closed");
        
        const secret = ctx.currentPrivateState.secret;
        const voterHex = toHex(secret);
        
        // Mock allowlist check
        const isEligible = state.allowlist.includes(toHex(commitmentFor(secret)));
        if (!isEligible) throw new Error("not an eligible voter");
        
        if (this.voted.has(voterHex)) throw new Error("already cast");
        this.voted.add(voterHex);
        
        return {
          context: {
            ...ctx,
            transactionContext: {
              state: {
                ...state,
                yesVotes: choice ? state.yesVotes + 1n : state.yesVotes,
                noVotes: !choice ? state.noVotes + 1n : state.noVotes,
                serialize: () => new Uint8Array([1, 2, 3])
              }
            }
          }
        };
      },
      closeVoting: (ctx) => {
        return {
          context: {
            ...ctx,
            transactionContext: {
              state: {
                ...ctx.transactionContext.state,
                votingOpen: false,
                serialize: () => new Uint8Array([1, 2, 3])
              }
            }
          }
        };
      }
    };
  }

  initialState(ctx, admin, description, voters) {
    const allowlistHex = voters.map(v => toHex(v));
    return {
      currentPrivateState: ctx.privateState,
      currentZswapLocalState: {},
      currentContractState: {
        data: {
          votingOpen: true,
          admin: admin,
          yesVotes: 0n,
          noVotes: 0n,
          allowlist: allowlistHex,
          serialize: () => new Uint8Array([1, 2, 3])
        }
      }
    };
  }
}
