// tests/battle.test.js

const Agent = require('../src/Agent');
const Alliance = require('../src/Alliance');
const battle = require('../src/battle');

describe("Agent Battle Protocol Tests", () => {
    // Define the four agents
    const agentA = new Agent("AgentA", 1000);
    const agentB = new Agent("AgentB", 800);
    const agentC = new Agent("AgentC", 600);
    const agentD = new Agent("AgentD", 400);

    // Create alliances
    const alliance1 = new Alliance([agentA, agentB]); // Total: 1800
    const alliance2 = new Alliance([agentC, agentD]); // Total: 1000

    test("Agent vs Agent Battle", () => {
        const result = battle(agentA, agentB);

        expect(result).toHaveProperty("winningAgents");
        expect(result).toHaveProperty("losingAgents");
        expect(result).toHaveProperty("losses");
        expect(result).toHaveProperty("deaths");

        // One agent should win, one should lose
        expect(result.winningAgents.length).toBe(1);
        expect(result.losingAgents.length).toBe(1);
        expect(result.winningAgents[0] !== result.losingAgents[0]).toBeTruthy();

        // Loss should be between 20% and 31%
        const losingAgent = result.losingAgents[0];
        expect(result.losses).toHaveProperty(losingAgent);
        expect(result.losses[losingAgent]).toBeGreaterThanOrEqual(20);
        expect(result.losses[losingAgent]).toBeLessThanOrEqual(31);

        // Death chance (5%) check
        if (result.deaths.length > 0) {
            expect(result.deaths.includes(losingAgent)).toBeTruthy();
        }
    });

    test("Agent vs Alliance Battle", () => {
        const result = battle(agentC, alliance1);

        expect(result).toHaveProperty("winningAgents");
        expect(result).toHaveProperty("losingAgents");
        expect(result).toHaveProperty("losses");
        expect(result).toHaveProperty("deaths");

        // Either agentC wins or the alliance wins
        if (result.winningAgents.includes("AgentC")) {
            // Alliance lost
            expect(result.losingAgents.length).toBe(2);
            expect(result.losses["AgentA"]).toBe(result.losses["AgentB"]);
        } else {
            // AgentC lost
            expect(result.losingAgents.length).toBe(1);
            expect(result.losses["AgentC"]).toBeGreaterThanOrEqual(20);
            expect(result.losses["AgentC"]).toBeLessThanOrEqual(31);
        }
    });

    test("Alliance vs Alliance Battle", () => {
        const result = battle(alliance1, alliance2);

        expect(result).toHaveProperty("winningAgents");
        expect(result).toHaveProperty("losingAgents");
        expect(result).toHaveProperty("losses");
        expect(result).toHaveProperty("deaths");

        // Ensure that either alliance1 or alliance2 loses
        if (result.losingAgents.includes("AgentA")) {
            // Alliance1 lost
            expect(result.losses["AgentA"]).toBe(result.losses["AgentB"]);
        } else {
            // Alliance2 lost
            expect(result.losses["AgentC"]).toBe(result.losses["AgentD"]);
        }
    });

    test("Same Agent vs Itself", () => {
        const result = battle(agentA, agentA);

        expect(result.winningAgents.length).toBe(0);
        expect(result.losingAgents.length).toBe(0);
        expect(result.losses).toEqual({});
        expect(result.deaths.length).toBe(0);
    });

    test("Death Probability (Multiple Simulations)", () => {
        let deathCount = 0;
        for (let i = 0; i < 100; i++) {
            const result = battle(agentA, agentB);
            if (result.deaths.length > 0) {
                deathCount++;
            }
        }
        // Approximate probability check (should be around 5%)
        expect(deathCount).toBeGreaterThanOrEqual(3);
        expect(deathCount).toBeLessThanOrEqual(10);
    });

    test("Multiple Battles Consistency", () => {
        for (let i = 0; i < 10; i++) {
            const result = battle(alliance1, alliance2);
            Object.values(result.losses).forEach(loss => {
                expect(loss).toBeGreaterThanOrEqual(20);
                expect(loss).toBeLessThanOrEqual(31);
            });
        }
    });
});
