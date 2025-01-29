// src/Alliance.js

class Alliance {
    /**
     * Creates an Alliance instance.
     * @param {Agent[]} agents - Array of Agent instances.
     */
    constructor(agents) {
        if (!Array.isArray(agents) || agents.length === 0) {
            throw new Error("Alliance must have at least one agent.");
        }
        if (agents.length > 2) {
            throw new Error("Alliance can have at most two agents.");
        }
        this.agents = agents.slice(); // Clone to prevent external mutations
        this.agents.sort((a, b) => b.balance - a.balance);
        this.leadAgent = this.agents[0];
        this.partnerAgents = this.agents.slice(1);
    }

    /**
     * Calculates the combined balance of the alliance.
     * @returns {number}
     */
    getCombinedBalance() {
        return this.agents.reduce((acc, agent) => acc + agent.balance, 0);
    }

    /**
     * Retrieves all agents in the alliance.
     * @returns {Agent[]}
     */
    getAllAgents() {
        return this.agents;
    }
}

module.exports = Alliance;
