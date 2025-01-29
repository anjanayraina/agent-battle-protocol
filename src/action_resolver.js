// src/action_resolver.js

const battle = require("./battle");
const Alliance = require("./Alliance");

/**
 * Calculates the Manhattan distance between two agents.
 * @param {Agent} agent1 
 * @param {Agent} agent2 
 * @returns {number} Distance
 */
function calculateDistance(agent1, agent2) {
    return Math.abs(agent1.x - agent2.x) + Math.abs(agent1.y - agent2.y);
}

/**
 * Resolves actions of all agents and determines what should happen.
 * @param {Object} agentActions - Mapping of agents to their actions and targets.
 * @param {Agent[]} agents - List of all agents.
 * @param {Alliance[]} alliances - List of existing alliances.
 * @returns {Object} - Resolved actions including battles, alliances, and ignored actions.
 */
function resolveActions(agentActions, agents, alliances) {
    let battlePairs = [];
    let alliancePairs = new Set(); // Using a Set to prevent duplicates
    let ignoredAgents = new Set();

    // Map agents to their alliances
    let agentToAlliance = new Map();
    alliances.forEach(alliance => {
        alliance.getAllAgents().forEach(agent => {
            agentToAlliance.set(agent.name, alliance);
        });
    });

    // Process agent actions
    for (let agentName in agentActions) {
        let action = agentActions[agentName].action;
        let targetName = agentActions[agentName].target;
        let agent = agents.find(a => a.name === agentName);
        let targetAgent = agents.find(a => a.name === targetName);

        // Check if agent is in an alliance
        if (agentToAlliance.has(agentName)) {
            let alliance = agentToAlliance.get(agentName);
            if (agent !== alliance.leadAgent) {
                // Subordinate agent’s actions are ignored
                ignoredAgents.add(agentName);
                continue;
            }
        }

        // Default action is Ignore
        if (!action || action === "Ignore") {
            ignoredAgents.add(agentName);
            continue;
        }

        // Check valid distance
        if (targetAgent && calculateDistance(agent, targetAgent) > 1) {
            ignoredAgents.add(agentName);
            continue;
        }

        if (action === "Battle") {
            battlePairs.push([agent, targetAgent]); // ✅ Ensure battles happen for dominant agents
        } else if (action === "Alliance") {
            // Ensure both agents choose alliance and neither is in an existing alliance
            if (
                agentActions[targetName]?.action === "Alliance" &&
                agentActions[targetName]?.target === agentName &&
                !agentToAlliance.has(agentName) &&
                !agentToAlliance.has(targetName)
            ) {
                const sortedPair = [agent.name, targetAgent.name].sort().join("-");
                alliancePairs.add(sortedPair); // Prevent duplicate alliances
            } else {
                ignoredAgents.add(agentName);
            }
        }
    }

    // Perform Battles (if any)
    let battleResults = [];
    if (battlePairs.length > 0) {
        battlePairs.forEach(([agent1, agent2]) => {
            if (agent1 && agent2) {
                battleResults.push(battle(agent1, agent2));
            }
        });
    }

    return {
        battles: battleResults,
        newAlliances: Array.from(alliancePairs).map(pair => {
            const [name1, name2] = pair.split("-");
            return [agents.find(a => a.name === name1), agents.find(a => a.name === name2)];
        }),
        ignoredAgents: Array.from(ignoredAgents),
    };
}

module.exports = {
    resolveActions,
    calculateDistance
};
