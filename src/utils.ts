export const isProduction = process.env.NODE_ENV === 'production';
export const isDebug = !isProduction;

export function debug() {
    if (isProduction) return;
    console.log.call(this, arguments);
}

export function logger(fn) {
    return function() {
        console.log(fn.name, ":", ...arguments);
        fn.apply(this, arguments);
    }
}