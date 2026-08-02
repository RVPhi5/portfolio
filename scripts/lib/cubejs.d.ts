declare module 'cubejs' {
  export type CubeJson = {
    center: number[];
    cp: number[];
    co: number[];
    ep: number[];
    eo: number[];
  };

  export default class Cube {
    constructor(state?: CubeJson | Cube);
    static fromString(s: string): Cube;
    static random(): Cube;
    static inverse(alg: string | number[]): string;
    static initSolver(): void;
    static scramble(): string;
    toJSON(): CubeJson;
    asString(): string;
    clone(): Cube;
    isSolved(): boolean;
    move(alg: string): Cube;
    multiply(other: Cube): Cube;
    upright(): Cube;
    solve(maxDepth?: number): string;
  }
}
