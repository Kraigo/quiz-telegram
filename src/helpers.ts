export function isNull(item: any): boolean {
    return item === null
        || item === undefined
        || item === ''
        || isNaN(item);
}


export function delay(time: number = 0): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), time);
    });
}

export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}