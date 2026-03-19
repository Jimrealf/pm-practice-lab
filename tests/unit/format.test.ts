import { describe, it, expect } from "vitest";
import { capitalize, toSentenceCase, toTitleCase, stripDelimiters } from "@/lib/format";

describe("capitalize", () => {
    it("returns empty string unchanged", () => {
        expect(capitalize("")).toBe("");
    });

    it("capitalizes a single lowercase character", () => {
        expect(capitalize("a")).toBe("A");
    });

    it("leaves an already capitalized string unchanged", () => {
        expect(capitalize("Hello")).toBe("Hello");
    });

    it("capitalizes a fully lowercase string", () => {
        expect(capitalize("hello world")).toBe("Hello world");
    });

    it("leaves an all-caps string unchanged", () => {
        expect(capitalize("HELLO")).toBe("HELLO");
    });

    it("capitalizes a string with leading space (space stays)", () => {
        expect(capitalize(" hello")).toBe(" hello");
    });

    it("handles a string that starts with a number", () => {
        expect(capitalize("3rd place")).toBe("3rd place");
    });

    it("handles unicode characters", () => {
        expect(capitalize("uber")).toBe("Uber");
    });

    it("handles a string with mixed case", () => {
        expect(capitalize("hELLO")).toBe("HELLO");
    });

    it("handles a single uppercase character", () => {
        expect(capitalize("A")).toBe("A");
    });

    it("handles a string with only spaces", () => {
        expect(capitalize("   ")).toBe("   ");
    });
});

describe("toSentenceCase", () => {
    it("returns empty string unchanged", () => {
        expect(toSentenceCase("")).toBe("");
    });

    it("converts underscored lowercase string", () => {
        expect(toSentenceCase("hello_world")).toBe("Hello world");
    });

    it("converts hyphenated lowercase string", () => {
        expect(toSentenceCase("hello-world")).toBe("Hello world");
    });

    it("converts ALL_CAPS with underscores", () => {
        expect(toSentenceCase("HELLO_WORLD")).toBe("Hello world");
    });

    it("converts mixed case with underscores", () => {
        expect(toSentenceCase("Hello_World")).toBe("Hello world");
    });

    it("converts string already in sentence case", () => {
        expect(toSentenceCase("Hello world")).toBe("Hello world");
    });

    it("handles double underscores", () => {
        expect(toSentenceCase("hello__world")).toBe("Hello  world");
    });

    it("handles leading underscore", () => {
        expect(toSentenceCase("_hello_world")).toBe("Hello world");
    });

    it("handles trailing underscore", () => {
        expect(toSentenceCase("hello_world_")).toBe("Hello world");
    });

    it("handles leading and trailing underscores", () => {
        expect(toSentenceCase("_hello_")).toBe("Hello");
    });

    it("handles leading hyphen", () => {
        expect(toSentenceCase("-hello-world")).toBe("Hello world");
    });

    it("handles mixed delimiters", () => {
        expect(toSentenceCase("hello_world-test")).toBe("Hello world test");
    });

    it("handles single word", () => {
        expect(toSentenceCase("HELLO")).toBe("Hello");
    });

    it("handles string with numbers", () => {
        expect(toSentenceCase("step_1_review")).toBe("Step 1 review");
    });

    it("handles already lowercase no delimiters", () => {
        expect(toSentenceCase("hello")).toBe("Hello");
    });

    it("lowercases all characters except the first", () => {
        expect(toSentenceCase("PRODUCT_STRATEGY")).toBe("Product strategy");
    });
});

describe("toTitleCase", () => {
    it("returns empty string unchanged", () => {
        expect(toTitleCase("")).toBe("");
    });

    it("converts a single word", () => {
        expect(toTitleCase("hello")).toBe("Hello");
    });

    it("converts multi-word space-separated string", () => {
        expect(toTitleCase("hello world")).toBe("Hello World");
    });

    it("converts underscored string to title case", () => {
        expect(toTitleCase("hello_world")).toBe("Hello World");
    });

    it("converts hyphenated string to title case", () => {
        expect(toTitleCase("hello-world")).toBe("Hello World");
    });

    it("converts ALL_CAPS underscored", () => {
        expect(toTitleCase("PRODUCT_STRATEGY")).toBe("Product Strategy");
    });

    it("handles mixed delimiters", () => {
        expect(toTitleCase("hello_world-test")).toBe("Hello World Test");
    });

    it("handles leading and trailing delimiters", () => {
        expect(toTitleCase("_hello_world_")).toBe("Hello World");
    });

    it("handles string with numbers", () => {
        expect(toTitleCase("step_1_review")).toBe("Step 1 Review");
    });

    it("handles already title-cased input", () => {
        expect(toTitleCase("Hello World")).toBe("Hello World");
    });

    it("handles single character", () => {
        expect(toTitleCase("a")).toBe("A");
    });

    it("lowercases everything before capitalizing word starts", () => {
        expect(toTitleCase("hELLO wORLD")).toBe("Hello World");
    });

    it("handles three words with underscores", () => {
        expect(toTitleCase("user_acceptance_testing")).toBe("User Acceptance Testing");
    });
});

describe("stripDelimiters", () => {
    it("replaces underscores with spaces", () => {
        expect(stripDelimiters("hello_world")).toBe("hello world");
    });

    it("replaces hyphens with spaces", () => {
        expect(stripDelimiters("hello-world")).toBe("hello world");
    });

    it("replaces mixed underscores and hyphens", () => {
        expect(stripDelimiters("hello_world-test")).toBe("hello world test");
    });

    it("returns string unchanged when no delimiters present", () => {
        expect(stripDelimiters("hello world")).toBe("hello world");
    });

    it("trims leading delimiter-replaced spaces", () => {
        expect(stripDelimiters("_hello")).toBe("hello");
    });

    it("trims trailing delimiter-replaced spaces", () => {
        expect(stripDelimiters("hello_")).toBe("hello");
    });

    it("handles consecutive underscores", () => {
        expect(stripDelimiters("hello__world")).toBe("hello  world");
    });

    it("handles consecutive hyphens", () => {
        expect(stripDelimiters("hello--world")).toBe("hello  world");
    });

    it("handles empty string", () => {
        expect(stripDelimiters("")).toBe("");
    });

    it("handles string with only delimiters", () => {
        expect(stripDelimiters("___")).toBe("");
    });

    it("preserves internal spaces", () => {
        expect(stripDelimiters("hello world_test")).toBe("hello world test");
    });

    it("handles mixed consecutive delimiters", () => {
        expect(stripDelimiters("hello_-world")).toBe("hello  world");
    });
});
