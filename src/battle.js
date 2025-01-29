// src/battle.js

const Alliance = require('./Alliance');
const Agent = require('./Agent');
const { getRandomInt } = require('./utils');

/**
 * Performs a battle between two entities (Agent or Alliance).
 * @param {Agent|Alliance} entity1 
 * @param {Agent|Alliance} entity2 
 * @returns {Object} - Mapping of agent names to their percentage loss.
 */
function battle(entity1, entity2) {
    // Helper function to get total balance and list of agents
    function getEntityInfo(entity) {
        if (entity instanceof Agent) {
            return {
                totalBalance: entity.balance,
                agents: [entity]
            };
        } else if (entity instanceof Alliance) {
            return {
                totalBalance: entity.getCombinedBalance(),
                agents: entity.getAllAgents()
            };
        } else {
            throw new Error("Entity must be an Agent or an Alliance.");
        }
    }

    const info1 = getEntityInfo(entity1);
    const info2 = getEntityInfo(entity2);

    const totalBalance = info1.totalBalance + info2.totalBalance;

    // Avoid division by zero
    if (totalBalance === 0) {
        throw new Error("Total balance of both entities cannot be zero.");
    }

    // Calculate winning probabilities
    const probability1 = info1.totalBalance / totalBalance;
    const probability2 = info2.totalBalance / totalBalance;

    // Determine battle outcome
    const rand = Math.random();
    let loserInfo;

    if (rand < probability1) {
        loserInfo = info2;
    } else {
        loserInfo = info1;
    }

    // Generate random loss percentage between 20 and 31
    const lossPercentage = getRandomInt(20, 31);

    // Prepare the result object
    const result = {};

    // Initialize all agents with 0 loss
    [...info1.agents, ...info2.agents].forEach(agent => {
        result[agent.name] = 0;
    });

    // Assign loss to the losing agents
    loserInfo.agents.forEach(agent => {
        result[agent.name] = lossPercentage;
    });

    return result;
}

module.exports = battle;
