jest.mock('./environment.ts', () => ({
  IS_DEV: true,
  IS_PROD: false,
}));

describe(`Job Batch Runner`, () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
