/**
 * Global type declarations for Jest in test files.
 * This file ensures describe, it, expect, jest, beforeEach, etc. are recognized by TypeScript.
 */

/// <reference types="jest" />

declare const describe: jest.Describe;
declare const it: jest.It;
declare const test: jest.It;
declare const expect: jest.Expect;
declare const jest: jest.Jest;
declare const beforeEach: jest.Lifecycle;
declare const afterEach: jest.Lifecycle;
declare const beforeAll: jest.Lifecycle;
declare const afterAll: jest.Lifecycle;
