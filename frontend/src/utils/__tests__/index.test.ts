import { describe, expect, it } from 'vitest';
import {
    buildQueryString,
    capitalizeFirst,
    cn,
    formatDate,
    formatDateTime,
    formatTime,
    getErrorMessage,
    getStatusColor,
    isValidEmail,
    isValidUrl,
    slugify,
    truncateText,
} from '../index';

describe('Date utilities', () => {
  it('formats date correctly', () => {
    const date = new Date('2023-12-25T10:30:00Z');
    expect(formatDate(date)).toMatch(/Dec 25, 2023/);
  });

  it('formats date time correctly', () => {
    const date = new Date('2023-12-25T10:30:00Z');
    const result = formatDateTime(date);
    expect(result).toMatch(/Dec 25, 2023/);
    expect(result).toMatch(/\d{1,2}:\d{2}/); // Match any time format
  });

  it('formats time correctly', () => {
    const date = new Date('2023-12-25T10:30:00Z');
    const result = formatTime(date);
    expect(result).toMatch(/\d{1,2}:\d{2}/); // Match any time format
  });
});

describe('String utilities', () => {
  it('truncates text correctly', () => {
    expect(truncateText('Hello world', 5)).toBe('Hello...');
    expect(truncateText('Hi', 5)).toBe('Hi');
  });

  it('capitalizes first letter', () => {
    expect(capitalizeFirst('hello')).toBe('Hello');
    expect(capitalizeFirst('HELLO')).toBe('HELLO');
  });

  it('slugifies text correctly', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
    expect(slugify('Test & Example')).toBe('test-example');
  });
});

describe('Class name utilities', () => {
  it('combines class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
    expect(cn('class1', null, 'class2', undefined)).toBe('class1 class2');
    expect(cn('class1', false, 'class2')).toBe('class1 class2');
  });
});

describe('Validation utilities', () => {
  it('validates email correctly', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
  });

  it('validates URL correctly', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('invalid-url')).toBe(false);
  });
});

describe('Error utilities', () => {
  it('extracts error message correctly', () => {
    expect(getErrorMessage(new Error('Test error'))).toBe('Test error');
    expect(getErrorMessage('String error')).toBe('String error');
    expect(getErrorMessage({})).toBe('An unknown error occurred');
  });
});

describe('Status utilities', () => {
  it('returns correct status colors', () => {
    expect(getStatusColor('pending')).toContain('yellow');
    expect(getStatusColor('completed')).toContain('green');
    expect(getStatusColor('high')).toContain('red');
    expect(getStatusColor('unknown')).toContain('gray');
  });
});

describe('API utilities', () => {
  it('builds query string correctly', () => {
    expect(buildQueryString({ page: 1, limit: 10 })).toBe('page=1&limit=10');
    expect(buildQueryString({ search: 'test', filter: undefined })).toBe('search=test');
    expect(buildQueryString({})).toBe('');
  });
});
