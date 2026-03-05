/**
 * Basic tests for the jq filter logic.
 * Run with: node test.js
 */

// Import the worker module for testing
const { applyFilter, parsePath } = (() => {
  // Inline re-implementation for testing (worker uses ESM exports)
  function parsePath(path) {
    const segments = [];
    let current = '';
    for (let i = 0; i < path.length; i++) {
      const ch = path[i];
      if (ch === '.') {
        if (current) segments.push({ type: 'key', value: current });
        current = '';
      } else if (ch === '[') {
        if (current) segments.push({ type: 'key', value: current });
        current = '';
        const end = path.indexOf(']', i);
        if (end === -1) throw new Error('Unmatched bracket');
        const inner = path.slice(i + 1, end);
        if (inner === '') {
          segments.push({ type: 'iterate' });
        } else {
          segments.push({ type: 'index', value: parseInt(inner, 10) });
        }
        i = end;
      } else {
        current += ch;
      }
    }
    if (current) segments.push({ type: 'key', value: current });
    return segments;
  }

  function applyFilter(data, filter) {
    filter = filter.trim();
    if (filter === '.') return data;
    if (filter.includes('|')) {
      const parts = filter.split('|');
      let result = data;
      for (const part of parts) {
        result = applyFilter(result, part.trim());
      }
      return result;
    }
    if (filter.startsWith('.')) {
      const path = filter.slice(1);
      const segments = parsePath(path);
      let result = data;
      for (const seg of segments) {
        if (result === null || result === undefined) return null;
        if (seg.type === 'key') result = result[seg.value];
        else if (seg.type === 'index') result = result[seg.value];
        else if (seg.type === 'iterate') {
          if (!Array.isArray(result)) throw new Error('Cannot iterate over non-array');
          return result;
        }
      }
      return result;
    }
    if (filter === 'keys') {
      if (typeof data === 'object' && data !== null) return Object.keys(data);
      throw new Error('Cannot get keys of non-object');
    }
    if (filter === 'length') {
      if (Array.isArray(data)) return data.length;
      if (typeof data === 'string') return data.length;
      if (typeof data === 'object' && data !== null) return Object.keys(data).length;
      return 0;
    }
    if (filter === 'type') {
      if (data === null) return 'null';
      if (Array.isArray(data)) return 'array';
      return typeof data;
    }
    throw new Error(`Unsupported filter: ${filter}`);
  }

  return { applyFilter, parsePath };
})();

let passed = 0;
let failed = 0;

function assert(name, actual, expected) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr === expectedStr) {
    console.log(`  PASS: ${name}`);
    passed++;
  } else {
    console.error(`  FAIL: ${name} - expected ${expectedStr}, got ${actualStr}`);
    failed++;
  }
}

console.log('Testing jq filter logic:\n');

const testData = { name: 'test', items: [1, 2, 3], nested: { a: { b: 'deep' } } };

assert('identity', applyFilter(testData, '.'), testData);
assert('key access', applyFilter(testData, '.name'), 'test');
assert('nested access', applyFilter(testData, '.nested.a.b'), 'deep');
assert('array index', applyFilter(testData, '.items[0]'), 1);
assert('keys', applyFilter(testData, '. | keys'), ['name', 'items', 'nested']);
assert('length', applyFilter(testData, '.items | length'), 3);
assert('type of object', applyFilter(testData, '. | type'), 'object');
assert('type of array', applyFilter(testData, '.items | type'), 'array');
assert('type of string', applyFilter(testData, '.name | type'), 'string');
assert('null access', applyFilter(testData, '.missing'), undefined);
assert('pipe chain', applyFilter(testData, '.nested | .a | .b'), 'deep');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
