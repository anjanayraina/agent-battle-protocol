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
 * Handles conflicts when multiple battle or alliance proposals occur.
 * 
 * @param {Object} agentActions - Mapping of agents to their actions and targets.
 * @param {Agent[]} agents - List of all agents.
 * @param {Alliance[]} alliances - List of existing alliances.
 * @returns {Object} - Resolved actions including battles, alliances, and ignored actions.
 */
function resolveActions(agentActions, agents, alliances) {
    let battlePairs = new Set();
    let allianceProposals = new Map();
    let ignoredAgents = new Set();

    let agentToAlliance = new Map();
    alliances.forEach(alliance => {
        alliance.getAllAgents().forEach(agent => {
            agentToAlliance.set(agent.name, alliance);
        });
    });

    for (let agentName in agentActions) {
        let action = agentActions[agentName].action;
        let targetName = agentActions[agentName].target;
        let agent = agents.find(a => a.name === agentName);
        let targetAgent = agents.find(a => a.name === targetName);

        if (agentToAlliance.has(agentName)) {
            let alliance = agentToAlliance.get(agentName);
            if (agent !== alliance.leadAgent) {
                ignoredAgents.add(agentName);
                continue;
            }
        }

        if (!action || action === "Ignore") {
            ignoredAgents.add(agentName);
            continue;
        }

        if (targetAgent && calculateDistance(agent, targetAgent) > 1) {
            ignoredAgents.add(agentName);
            continue;
        }

        if (action === "Battle") {
            const sortedPair = [agent.name, targetAgent.name].sort().join("-");
            battlePairs.add(sortedPair);
        } else if (action === "Alliance") {
            if (agentActions[targetName]?.action === "Battle") {
                ignoredAgents.add(agentName);  // Alliance fails if the target wants to battle
            } else if (!agentToAlliance.has(agentName) && !agentToAlliance.has(targetName)) {
                const sortedPair = [agent.name, targetAgent.name].sort().join("-");
                allianceProposals.set(sortedPair, { agent, targetAgent });
            }
        }
    }

    let battleResults = [];
    let battledAgents = new Set();
    battlePairs.forEach(pair => {
        const [name1, name2] = pair.split("-");
        const agent1 = agents.find(a => a.name === name1);
        const agent2 = agents.find(a => a.name === name2);

        if (!battledAgents.has(agent1.name) && !battledAgents.has(agent2.name)) {
            battleResults.push(battle(agent1, agent2));
            battledAgents.add(agent1.name);
            battledAgents.add(agent2.name);
        }
    });

    let newAlliances = [];
    let alliedAgents = new Set();
    allianceProposals.forEach(({ agent, targetAgent }, key) => {
        if (
            allianceProposals.has(key) &&
            !alliedAgents.has(agent.name) &&
            !alliedAgents.has(targetAgent.name)
        ) {
            newAlliances.push([agent, targetAgent]);
            alliedAgents.add(agent.name);
            alliedAgents.add(targetAgent.name);
        }
    });

    return {
        battles: battleResults,
        newAlliances,
        ignoredAgents: Array.from(ignoredAgents),
    };
}


module.exports = {
    resolveActions,
    calculateDistance
};
