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
    const alliance3 = new Alliance([agentA, agentC]); // Additional alliance for testing

    test("Agent vs Agent", () => {
        const result = battle(agentA, agentB);
        expect(Object.keys(result)).toHaveLength(2);
        expect(result["AgentA"] === 0 || result["AgentB"] === 0).toBeTruthy();
        const lossValues = Object.values(result).filter(loss => loss !== 0);
        if (lossValues.length === 1) {
            expect(lossValues[0]).toBeGreaterThanOrEqual(20);
            expect(lossValues[0]).toBeLessThanOrEqual(31);
        } else {
            // In case both have zero loss (very low probability)
            expect(lossValues.length).toBeLessThanOrEqual(1);
        }
    });

    test("Agent vs Alliance", () => {
        const result = battle(agentC, alliance1);
        expect(Object.keys(result)).toHaveLength(3);
        expect(result).toHaveProperty("AgentC");
        expect(result).toHaveProperty("AgentA");
        expect(result).toHaveProperty("AgentB");

        const lossAgents = ["AgentC", "AgentA", "AgentB"].filter(name => result[name] !== 0);
        if (lossAgents.length === 1) {
            const lostAgent = lossAgents[0];
            if (lostAgent === "AgentC") {
                expect(result["AgentC"]).toBeGreaterThanOrEqual(20);
                expect(result["AgentC"]).toBeLessThanOrEqual(31);
            } else {
                // Alliance1 lost
                expect(result["AgentA"]).toBe(result["AgentB"]);
                expect(result["AgentA"]).toBeGreaterThanOrEqual(20);
                expect(result["AgentA"]).toBeLessThanOrEqual(31);
            }
        } else if (lossAgents.length === 2) {
            // Both agents in the alliance lost
            expect(result["AgentA"]).toBe(result["AgentB"]);
            expect(result["AgentA"]).toBeGreaterThanOrEqual(20);
            expect(result["AgentA"]).toBeLessThanOrEqual(31);
        }
    });

    test("Alliance vs Alliance", () => {
        const result = battle(alliance1, alliance2);
        expect(Object.keys(result)).toHaveLength(4);
        expect(result).toHaveProperty("AgentA");
        expect(result).toHaveProperty("AgentB");
        expect(result).toHaveProperty("AgentC");
        expect(result).toHaveProperty("AgentD");

        const lossAgents = ["AgentA", "AgentB", "AgentC", "AgentD"].filter(name => result[name] !== 0);
        if (lossAgents.length === 2) {
            // One alliance lost
            const alliance1Lost = result["AgentA"] !== 0 && result["AgentB"] !== 0;
            const alliance2Lost = result["AgentC"] !== 0 && result["AgentD"] !== 0;
            expect(alliance1Lost !== alliance2Lost).toBeTruthy();
            if (alliance1Lost) {
                expect(result["AgentA"]).toBe(result["AgentB"]);
                expect(result["AgentA"]).toBeGreaterThanOrEqual(20);
                expect(result["AgentA"]).toBeLessThanOrEqual(31);
            }
            if (alliance2Lost) {
                expect(result["AgentC"]).toBe(result["AgentD"]);
                expect(result["AgentC"]).toBeGreaterThanOrEqual(20);
                expect(result["AgentC"]).toBeLessThanOrEqual(31);
            }
        } else if (lossAgents.length === 4) {
            // Both alliances lost (rare scenario)
            expect(result["AgentA"]).toBe(result["AgentB"]);
            expect(result["AgentC"]).toBe(result["AgentD"]);
            expect(result["AgentA"]).toBeGreaterThanOrEqual(20);
            expect(result["AgentA"]).toBeLessThanOrEqual(31);
            expect(result["AgentC"]).toBeGreaterThanOrEqual(20);
            expect(result["AgentC"]).toBeLessThanOrEqual(31);
        }
    });

    test("Same Agent vs Itself", () => {
        const result = battle(agentA, agentA);
        expect(Object.keys(result)).toHaveLength(1);
        expect(result["AgentA"]).toBe(0);
    });

    test("Invalid Alliance (Empty)", () => {
        expect(() => new Alliance([])).toThrow("Alliance must have at least one agent.");
    });

    test("Multiple Battles Consistency", () => {
        for (let i = 0; i < 10; i++) {
            const result = battle(alliance1, alliance2);
            Object.values(result).forEach(loss => {
                expect(loss === 0 || (loss >= 20 && loss <= 31)).toBeTruthy();
            });
        }
    });
});
