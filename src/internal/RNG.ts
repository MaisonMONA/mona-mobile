/* ~~~~~~~~~~~~~~ */
/* Small RNG because TS/JS do not giving a seed to Math.random().
/* Distribution should be uniform in [0;m) ∩ N
/* ~~~~~~~~~~~~~~ */

export class RNG {
    private previous: number;

    // Equation parameters (by default the ones used by glibc)
    private readonly a: number;
    private readonly c: number;
    private readonly m: number;

    constructor(seed=Math.round(Math.random() * 42), a=1103515245, c=12345, m=2**31) {
        this.previous = seed;
        this.a = a;
        this.c = c;
        this.m = m;
    }

    nextInt() {
        this.previous = (this.a * this.previous + this.c) % this.m;
        return this.previous;
    }

    random() {
        this.nextInt();
        return this.previous / this.m;
    }

    nextInRange(left: number, right: number) {
        if (left == 0 && right == 0) {
            throw new Error("Invalid range")
        }

        this.nextInt()
        return this.previous % Math.abs(right - left)
    }
}
