/**
 * Unit Tests for CSV sanitization helpers
 *
 * NOTE: Tests assume a Jest/Vitest-like environment will be configured.
 * Until then, describe/it/expect are declared as ambient globals to keep
 * the file type-safe without pulling in a test runner dependency.
 */

import { sanitizeCsvField } from '@/lib/utils/csv';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const describe: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const it: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const expect: any;

describe('sanitizeCsvField', () => {
  it('returns empty string for nullish values', () => {
    expect(sanitizeCsvField(null)).toBe('');
    expect(sanitizeCsvField(undefined)).toBe('');
  });

  it('prefixes risky values with a single quote', () => {
    expect(sanitizeCsvField('=SUM(A1:A3)')).toBe("'=SUM(A1:A3)");
    expect(sanitizeCsvField('+1+1')).toBe("'+1+1");
    expect(sanitizeCsvField('-1')).toBe("'-1");
    expect(sanitizeCsvField('@HYPERLINK("http://malicious")')).toBe('"\'@HYPERLINK(""http://malicious"")"');
  });

  it('wraps values containing commas, quotes, or new lines', () => {
    expect(sanitizeCsvField('Nairobi, Kenya')).toBe('"Nairobi, Kenya"');
    expect(sanitizeCsvField('Hello\nWorld')).toBe('"Hello\nWorld"');
    expect(sanitizeCsvField('He said "Hello"')).toBe('"He said ""Hello"""');
  });

  it('combines formula prefixing and quoting when both are needed', () => {
    expect(sanitizeCsvField('=1,2')).toBe('"\'=1,2"');
  });

  it('returns stringified numbers and booleans unchanged when safe', () => {
    expect(sanitizeCsvField(42)).toBe('42');
    expect(sanitizeCsvField(true)).toBe('true');
  });
});
