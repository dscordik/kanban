export function pluralize(count: number): string {
    const lastTwoDigits = count % 100;
    const lastDigit = count % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return `${count} участников`;
    }

    if (lastDigit === 1) {
        return `${count} участник`;
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
        return `${count} участника`;
    }

    return `${count} участников`;
}