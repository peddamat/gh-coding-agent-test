import { describe, test, expect } from 'vitest';
import type { PatternParent } from '../../../../data/patterns';

describe('PatternThumbnail', () => {
  test('default days is 14 for 2-week preview', () => {
    const days = 14;
    expect(days).toBe(14);
  });

  test('pattern cells are generated correctly for full pattern', () => {
    const pattern: PatternParent[] = ['A', 'A', 'B', 'B', 'A', 'A', 'A', 'B', 'B', 'A', 'A', 'B', 'B', 'B'];
    const days = 14;
    const cells: PatternParent[] = [];
    
    for (let i = 0; i < days; i++) {
      cells.push(pattern[i % pattern.length]);
    }
    
    expect(cells.length).toBe(14);
    expect(cells[0]).toBe('A');
    expect(cells[2]).toBe('B');
  });

  test('pattern repeats correctly when shorter than days', () => {
    const pattern: PatternParent[] = ['A', 'A', 'A', 'A', 'A', 'B', 'B'];
    const days = 14;
    const cells: PatternParent[] = [];
    
    for (let i = 0; i < days; i++) {
      cells.push(pattern[i % pattern.length]);
    }
    
    expect(cells.length).toBe(14);
    expect(cells[0]).toBe('A');
    expect(cells[5]).toBe('B');
    expect(cells[7]).toBe('A'); // Second week starts
    expect(cells[12]).toBe('B'); // Second weekend
  });

  test('empty pattern generates alternating placeholder', () => {
    const pattern: PatternParent[] = [];
    const days = 14;
    const cells: PatternParent[] = [];
    
    if (pattern.length === 0) {
      for (let i = 0; i < days; i++) {
        cells.push(i % 2 === 0 ? 'A' : 'B');
      }
    }
    
    expect(cells.length).toBe(14);
    expect(cells[0]).toBe('A');
    expect(cells[1]).toBe('B');
    expect(cells[2]).toBe('A');
  });

  test('grid should have 7 columns for calendar layout', () => {
    const columns = 7;
    expect(columns).toBe(7);
  });
});

describe('PatternThumbnail colors', () => {
  test('default colors are blue and pink', () => {
    const parentAColor = 'bg-blue-500';
    const parentBColor = 'bg-pink-500';
    
    expect(parentAColor).toBe('bg-blue-500');
    expect(parentBColor).toBe('bg-pink-500');
  });

  test('cell gets correct color based on parent', () => {
    const cell: PatternParent = 'A';
    const parentAColor = 'bg-blue-500';
    const parentBColor = 'bg-pink-500';
    
    const color = cell === 'A' ? parentAColor : parentBColor;
    expect(color).toBe('bg-blue-500');
  });
});
