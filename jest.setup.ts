import 'jest-extended';

process.env.TZ = 'UTC';

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

jest.setTimeout(30000);
