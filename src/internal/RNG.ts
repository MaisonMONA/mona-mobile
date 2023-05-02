/* ~~~~~~~~~~~~~~ */
/* Small RNG because TS/JS does not allow seeding Math.random().
/* Distribution should be uniform in [0;m) ∩ N.
/* ~~~~~~~~~~~~~~ */

export class RNG {
    private previous: number;

    // Equation parameters (by default the ones used by glibc)
    private readonly a: number;
    private readonly c: number;
    private readonly m: number;

    constructor(seed=Math.round(Date.now()), a=1103515245, c=12345, m=2**31) {
        /**
         * Create a RNG using the given parameters.
         *
         * @param seed - seed for initializing
         * @param a - (optional) multiplier
         * @param c - (optional) constant added to the calculation
         * @param m - (optional) upper bound of the possible range (max is m-1)
         */
        this.previous = seed;
        this.a = a;
        this.c = c;
        this.m = m;
    }

    nextInt() {
        /**
         * Returns the next integer in [0;m) calculated by the RNG
         */
        this.previous = (this.a * this.previous + this.c) % this.m;

        // Return the integer represented by the bits 30..16 of `this.previous`
        return (this.previous >> 16) & 0x7FFF;
    }

    random() {
        /**
         * Returns a pseudorandom decimal number in [0;1).
         */
        this.nextInt();
        return this.previous / this.m;
    }

    nextInRange(left: number, right: number) {
        /**
         * Returns a pseudorandom number in [left;right].
         *
         * @param left - minimum value of the range
         * @param right - maximum value of the range
         */
        if (right < left)
            throw new Error(`Invalid range ([${left};${right}] is invalid).`);

        this.nextInt()
        return this.previous % Math.abs(right - left + 1) + left
    }

    randomString(size: number) {
        /**
         * Returns a string of length `size`, composed of random alphanumeric characters
         *
         * @param size - the desired size of the output
         */
        if (size < 0) throw new Error("Invalid size.");

        const base = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

        let str = '';
        for (let i = 0; i < size; i++) {
            str += base[this.nextInRange(0, base.length - 1)];
        }

        return str;
    }
}
