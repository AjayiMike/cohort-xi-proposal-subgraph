import { BigInt } from "@graphprotocol/graph-ts";
import {
    ProposalContract,
    ProposalCreated,
    ProposalExecuted,
    Voted,
} from "../generated/ProposalContract/ProposalContract";
import { Proposal, Vote } from "../generated/schema";
import { loadOrCreateUser } from "./util";

export function handleProposalCreated(event: ProposalCreated): void {
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    // let entity = ExampleEntity.load(event.transaction.from)
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    // if (!entity) {
    //   entity = new ExampleEntity(event.transaction.from)
    //   // Entity fields can be set using simple assignments
    //   entity.count = BigInt.fromI32(0)
    // }
    // BigInt and BigDecimal math are supported
    // entity.count = entity.count + BigInt.fromI32(1)
    // Entity fields can be set based on event parameters
    // entity.proposalId = event.params.proposalId
    // entity.description = event.params.description
    // Entities can be written to the store with `.save()`
    // entity.save()
    // Note: If a handler doesn't require existing field values, it is faster
    // _not_ to load the entity from the store. Instead, create it fresh with
    // `new Entity(...)`, set the fields that should be updated and save the
    // entity back to the store. Fields that were not set or unset remain
    // unchanged, allowing for partial updates to be applied.
    // It is also possible to access smart contracts from mappings. For
    // example, the contract that has emitted the event can be connected to
    // with:
    //
    // let contract = Contract.bind(event.address)
    //
    // The following functions can then be called on this contract to access
    // state variables and other data:
    //
    // - contract.hasVoted(...)
    // - contract.proposalCount(...)
    // - contract.proposals(...)

    let user = loadOrCreateUser(event.transaction.from.toHexString());

    const proposal = new Proposal(event.params.proposalId.toHexString());
    proposal.description = event.params.description;
    proposal.recipient = event.params.recipient;
    proposal.amount = event.params.amount;
    proposal.voteCount = 0;
    proposal.deadline = event.params.votingDeadline;
    proposal.minVoteToPass = event.params.minVotesToPass.toI32();
    proposal.executed = false;
    proposal.timestamp = event.block.timestamp;
    proposal.transactionHash = event.transaction.hash;
    proposal.createdBy = user.id;

    proposal.save();
}

export function handleVoted(event: Voted): void {
    let user = loadOrCreateUser(event.transaction.from.toHexString());

    const proposal = Proposal.load(event.params.proposalId.toHexString())!;
    proposal.voteCount = proposal.voteCount + 1;
    proposal.save();

    const vote = new Vote(
        event.transaction.from
            .toHexString()
            .concat("-")
            .concat(event.params.proposalId.toHexString())
    );

    vote.proposal = proposal.id;
    vote.voter = user.id;
    vote.timestamp = event.block.timestamp;
    vote.transactionHash = event.transaction.hash;

    // const contract = ProposalContract.bind(event.address)

    // const res = contract.try_hasVoted(event.transaction.from, event.params.proposalId);

    // if(res.reverted) {

    // }else {

    // }

    vote.save();
}

export function handleProposalExecuted(event: ProposalExecuted): void {
    loadOrCreateUser(event.transaction.from.toHexString());
    const proposal = Proposal.load(event.params.proposalId.toHexString())!;
    proposal.executed = true;
}
