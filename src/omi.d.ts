/** Type declarations for the Omi framework (minimal subset used by this project). */
declare module 'omi' {
  export class WeElement<P = Record<string, unknown>, D = Record<string, unknown>> {
    props: P;
    data: D;
    store: any;
    update(): void;
    install(): void;
    render(props: P): any;
    constructor(...args: unknown[]);
    static css: string;
    static use: unknown[];
  }

  export function define(name: string, ctor: typeof WeElement | (new (...args: unknown[]) => WeElement)): void;
  export function h(type: string | null, props: Record<string, unknown> | null, ...children: unknown[]): unknown;
  export function render(element: unknown, selector: string, store?: Record<string, unknown>): void;
}

declare module 'omi-router' {
  export function route(path: string, handler: () => void): void;
}

/** Allow JSX intrinsic elements for Omi custom elements. */
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
