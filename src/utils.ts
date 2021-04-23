export function parseNum(hex: string): number {
    if (hex && hex.startsWith('0x')) {
        hex = hex.slice(2);
    }

    return parseInt(hex, 16);
}

export function between(num: number, min: number, max?: number): number {
    num = num * 1;
    if (isNaN(num)) return min;
    if (num < min) return min;
    if (max && num > max) return max;
    return num;
}

export function parseOffsetLimit(_offset: string, _limit: string): { offset: number; limit: number } {
    return {
        offset: between(parseInt(_offset, 10), 0),
        limit: between(parseInt(_limit, 10), 0, 20),
    };
}

export function nows(): number {
    return Math.floor(Date.now() / 1000);
}
