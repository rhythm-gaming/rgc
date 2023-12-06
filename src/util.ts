export type First<T> = T extends [infer Car, ...unknown[]] ? Car : never;
export type Rest<T> = T extends [unknown, ...infer Cdr] ? Cdr : never;

/**
 * Checks whether the given value is an `Iterable`.
 */
export function isIterable(x: unknown): x is Iterable<unknown> {
    if(x == null || (typeof x !== 'object')) return false;
    if(!(Symbol.iterator in x)) return false;
    return typeof x[Symbol.iterator] === 'function';
}

/**
 * Merge multiple sorted lists into one.
 * @generator
 * @param lists Sorted lists. Elements in each sorted list must be tuples with common first element type.
 * @yields Merged values in ascending order, in the form of `[key, [index, ...values]]`
 */
export function* mergeSortedLists<Key, Values extends unknown[]>(...lists: (Iterable<[Key, ...Values]>|Iterator<[Key, ...Values]>)[]): Generator<[Key, [number, ...Values][]]> {
    let iterators: Array<[number, Iterator<[Key, ...Values]>|null]> = [];

    // Using a heap would have been faster theoretically, but in practice lists.length is small.
    const curr_objects: Array<[Key, [number, ...Values]]|null> = [];

    for(let i=0; i<lists.length; ++i) {
        const list = lists[i];
        const iterator = isIterable(list) ? list[Symbol.iterator]() : list;
        iterators.push([i, iterator]);
        curr_objects.push(null);
    }

    while(iterators.length > 0) {
        let one_ended = false;

        for(const iterator_pair of iterators) {
            const [ind, iterator] = iterator_pair;
            if(curr_objects[ind]) continue;
            if(iterator == null) continue; // (never hit)

            const nxt = iterator.next();
            if(nxt.done) {
                iterator_pair[1] = null;
                one_ended = true;
                continue;
            }

            const [first, ...rest] = nxt.value;
            curr_objects[ind] = [first, [ind, ...rest]];
        }
        
        let min_key: Key|null = null;
        let min_values: Array<[number, ...Values]> = [];

        for(const obj of curr_objects) {
            if(obj == null) continue;
            const obj_key: Key = obj[0];

            if(min_key != null && min_key < obj_key) continue;

            if(min_key == null || obj_key < min_key) {
                min_key = obj_key;
                min_values = [obj[1]];
            } else {
                min_values.push(obj[1]);
            }
        }

        for(const [ind] of min_values) curr_objects[ind] = null;

        if(min_key != null) yield [min_key, min_values];

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        if(one_ended) iterators = iterators.filter(([_, it]) => it != null)
    }
}

export function min<T>(...values: T[]): T|undefined {
    if(values.length === 0) return void 0;

    let curr_min = values[0];
    for(let i=1; i<values.length; ++i) {
        if(values[i] < curr_min) curr_min = values[i];
    }

    return curr_min;
}

export function max<T>(...values: T[]): T|undefined {
    if(values.length === 0) return void 0;

    let curr_max = values[0];
    for(let i=1; i<values.length; ++i) {
        if(curr_max < values[i]) curr_max = values[i];
    }

    return curr_max;
}

export function gcd<T extends number|bigint>(...values: T[]): T {
    if(values.length <= 1) return values[0];
    let x: T = values[0]; if(x < 0) x = -x as T;
    for(let i=1; i<values.length; ++i) {
        let y: T = values[i];
        if(y < 0) y = -y as T;
        if(x == 0) {
            x = y; continue;
        }
        while(x > 0) {
            [x, y] = [y%x as T, x];
        }
        x = y;
        if(x == 1) return x;
    }
    return x;
}