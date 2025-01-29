// src/index.js

const Agent = require('./Agent');
const Alliance = require('./Alliance');
const battle = require('./battle');

// Define the four agents
const agentA = new Agent("AgentA", 1000);
const agentB = new Agent("AgentB", 800);
const agentC = new Agent("AgentC", 600);
const agentD = new Agent("AgentD", 400);

// Create alliances
const alliance1 = new Alliance([agentA, agentB]); // Total: 1800
const alliance2 = new Alliance([agentC, agentD]); // Total: 1000

// Perform a battle between Alliance1 and Alliance2
const battleResult = battle(alliance1, alliance2);
console.log("Battle Result between Alliance1 and Alliance2:", battleResult);
