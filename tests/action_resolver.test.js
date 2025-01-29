// tests/action_resolver.test.js

const Agent = require("../src/Agent");
const Alliance = require("../src/Alliance");
const { resolveActions } = require("../src/action_resolver");

describe("Action Resolver Tests", () => {
    let agentA, agentB, agentC, agentD;
    let agents;

    beforeEach(() => {
        agentA = new Agent("AgentA", 1000);
        agentB = new Agent("AgentB", 800);
        agentC = new Agent("AgentC", 600);
        agentD = new Agent("AgentD", 400);

        // Assign positions
        agentA.x = 0; agentA.y = 0;
        agentB.x = 1; agentB.y = 0;
        agentC.x = 2; agentC.y = 0;
        agentD.x = 3; agentD.y = 0;

        agents = [agentA, agentB, agentC, agentD];
    });

    test("Battle occurs if at least one agent initiates", () => {
        const actions = {
            "AgentA": { action: "Battle", target: "AgentB" },
            "AgentB": { action: "Ignore" },
            "AgentC": { action: "Ignore" },
            "AgentD": { action: "Ignore" },
        };

        const result = resolveActions(actions, agents, []);
        expect(result.battles.length).toBe(1);
        expect(result.ignoredAgents).toEqual(["AgentB", "AgentC", "AgentD"]);
    });

    test("Alliance is only formed if both agents agree", () => {
        const actions = {
            "AgentA": { action: "Alliance", target: "AgentB" },
            "AgentB": { action: "Alliance", target: "AgentA" },
            "AgentC": { action: "Ignore" },
            "AgentD": { action: "Ignore" },
        };

        const result = resolveActions(actions, agents, []);
        expect(result.newAlliances.length).toBe(1);
        expect(result.ignoredAgents).toEqual(["AgentC", "AgentD"]);
    });

    test("Ignore subordinate agent's action in alliance", () => {
        const alliance1 = new Alliance([agentA, agentB]); // A is dominant
        agentC.x = 0;
        const actions = {
            "AgentA": { action: "Battle", target: "AgentC" }, // Lead agent initiates battle
            "AgentB": { action: "Battle", target: "AgentD" }, // Should be ignored
        };

        const result = resolveActions(actions, agents, [alliance1]);
        expect(result.battles.length).toBe(1); // ✅ Ensures lead agent's battle happens
        expect(result.ignoredAgents).toContain("AgentB"); // ✅ Ensures subordinate agent's action is ignored
    });
});
