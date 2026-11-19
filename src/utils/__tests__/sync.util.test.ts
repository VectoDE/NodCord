import { Once } from '@/utils/sync.util';

describe('Once', () => {
  it('runs a void initializer only once', async () => {
    const once = new Once<void>();
    let calls = 0;
    await once.run(async () => {
      calls++;
    });
    await once.run(async () => {
      calls++;
    });
    once.run(() => {
      calls++;
    });
    expect(calls).toBe(1);
  });

  it('caches values and runs again after reset', async () => {
    const once = new Once<number>();
    expect(await once.run(() => 1)).toBe(1);
    expect(await once.run(() => 2)).toBe(1);
    once.reset();
    expect(await once.run(() => 3)).toBe(3);
  });

  it('shares a pending initializer', async () => {
    const once = new Once<void>();
    let calls = 0;
    await Promise.all([
      once.run(async () => {
        calls++;
      }),
      once.run(async () => {
        calls++;
      }),
    ]);
    expect(calls).toBe(1);
  });
});
