/**
 * Unit Tests for CSV sanitization helpers
 */

import { sanitizeCsvField, sanitizeFilename } from '@/lib/utils/csv';

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

describe('sanitizeFilename', () => {
  it('returns "untitled" for nullish values', () => {
    expect(sanitizeFilename(null)).toBe('untitled');
    expect(sanitizeFilename(undefined)).toBe('untitled');
    expect(sanitizeFilename('')).toBe('untitled');
  });

  it('removes path separators and dangerous characters', () => {
    expect(sanitizeFilename('C:\\Users\\test')).toBe('C_Users_test');
    expect(sanitizeFilename('/var/log/file')).toBe('varlogfile');
    expect(sanitizeFilename('file:name?.txt')).toBe('filename.txt');
    expect(sanitizeFilename('file<>|*.txt')).toBe('file.txt');
  });

  it('replaces spaces with underscores', () => {
    expect(sanitizeFilename('My File Name')).toBe('My_File_Name');
    expect(sanitizeFilename('  spaced  file  ')).toBe('spaced__file');
  });

  it('removes control characters', () => {
    expect(sanitizeFilename('file\x00name')).toBe('filename');
    expect(sanitizeFilename('file\x1Fname')).toBe('filename');
    expect(sanitizeFilename('file\x7Fname')).toBe('filename');
  });

  it('limits length to 200 characters', () => {
    const longName = 'a'.repeat(300);
    expect(sanitizeFilename(longName)).toBe('a'.repeat(200));
  });

  it('handles real-world provider names', () => {
    expect(sanitizeFilename('Nairobi Hospital')).toBe('Nairobi_Hospital');
    expect(sanitizeFilename('Aga Khan University Hospital')).toBe('Aga_Khan_University_Hospital');
    expect(sanitizeFilename('M.P. Shah Hospital')).toBe('M.P._Shah_Hospital');
  });
});
