export const isNullOrWhitespace = (input: string | undefined | null): boolean => {
    return !input || !input.trim();
}