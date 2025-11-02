declare module 'translate-google' {
  export default function translate(text: string, options: { to: string }): Promise<string>;
}

declare module 'quickchart-js' {
  export default class QuickChart {
    constructor();
    setConfig(config: unknown): this;
    setWidth(width: number): this;
    setHeight(height: number): this;
    setBackgroundColor(color: string): this;
    getUrl(): string;
    getShortUrl(): Promise<string>;
  }
}

declare module 'node-fetch' {
  const fetch: typeof globalThis.fetch;
  export default fetch;
}
