// src/index.js

const Agent = require('./Agent');
const Alliance = require('./Alliance');
const battle = require('./battle');
const { resolveActions } = require('./action_resolver');

// Define agents
const agentA = new Agent("AgentA", 1000);
const agentB = new Agent("AgentB", 800);
const agentC = new Agent("AgentC", 600);
const agentD = new Agent("AgentD", 400);

// Assign positions
agentA.x = 0; agentA.y = 0;
agentB.x = 1; agentB.y = 0;
agentC.x = 2; agentC.y = 0;
agentD.x = 3; agentD.y = 0;

// Initial Alliances
const alliances = [];

// Agent actions
const actions = {
    "AgentA": { action: "Battle", target: "AgentB" },
    "AgentB": { action: "Ignore" },
    "AgentC": { action: "Alliance", target: "AgentD" },
    "AgentD": { action: "Alliance", target: "AgentC" }
};

// Resolve actions
const result = resolveActions(actions, [agentA, agentB, agentC, agentD], alliances);

console.log("Action Resolution Result:", result);
