export function capitalize(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export function toSentenceCase(value: string): string {
    if (!value) return value;
    return capitalize(
        value.toLowerCase().replace(/[_-]/g, " ").trim()
    );
}

export function toTitleCase(value: string): string {
    if (!value) return value;
    return value
        .toLowerCase()
        .replace(/[_-]/g, " ")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function stripDelimiters(value: string): string {
    return value.replace(/[_-]/g, " ").trim();
}
