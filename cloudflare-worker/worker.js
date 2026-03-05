/**
 * alfred-jq Cloudflare Worker
 *
 * Provides a serverless API for processing jq-like JSON queries.
 * Supports basic jq operations: key access, array indexing, and pipes.
 *
 * Endpoints:
 *   POST /query   - Process a jq filter against JSON input
 *   GET  /health  - Health check
 *
 * Request body (POST /query):
 *   { "input": <any JSON>, "filter": "<jq filter string>" }
 *
 * Response:
 *   { "result": <filtered output>, "filter": "<filter used>" }
 */

const MAX_INPUT_SIZE = 102400; // 100KB

/**
 * Apply a basic jq-like filter to a JSON value.
 * Supports: identity (.), key access (.key), nested (.a.b),
 * array index (.[0]), and pipes (|).
 *
 * @param {*} data - Input JSON data
 * @param {string} filter - jq filter string
 * @returns {*} Filtered result
 */
function applyFilter(data, filter) {
  filter = filter.trim();

  // Identity
  if (filter === '.') {
    return data;
  }

  // Handle pipes
  if (filter.includes('|')) {
    const parts = filter.split('|');
    let result = data;
    for (const part of parts) {
      result = applyFilter(result, part.trim());
    }
    return result;
  }

  // Handle .key.subkey access
  if (filter.startsWith('.')) {
    const path = filter.slice(1);
    const segments = parsePath(path);
    let result = data;
    for (const seg of segments) {
      if (result === null || result === undefined) {
        return null;
      }
      if (seg.type === 'key') {
        result = result[seg.value];
      } else if (seg.type === 'index') {
        result = result[seg.value];
      } else if (seg.type === 'iterate') {
        if (!Array.isArray(result)) {
          throw new Error('Cannot iterate over non-array');
        }
        return result;
      }
    }
    return result;
  }

  // keys
  if (filter === 'keys') {
    if (typeof data === 'object' && data !== null) {
      return Object.keys(data);
    }
    throw new Error('Cannot get keys of non-object');
  }

  // length
  if (filter === 'length') {
    if (Array.isArray(data)) return data.length;
    if (typeof data === 'string') return data.length;
    if (typeof data === 'object' && data !== null) return Object.keys(data).length;
    return 0;
  }

  // type
  if (filter === 'type') {
    if (data === null) return 'null';
    if (Array.isArray(data)) return 'array';
    return typeof data;
  }

  throw new Error(`Unsupported filter: ${filter}`);
}

/**
 * Parse a jq-style path string into segments.
 * E.g. "foo.bar[0].baz" => [{type:'key',value:'foo'},{type:'key',value:'bar'},{type:'index',value:0},{type:'key',value:'baz'}]
 *
 * @param {string} path - Path string without leading dot
 * @returns {Array<{type: string, value: *}>} Parsed segments
 */
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

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'alfred-jq-api' }), { headers });
    }

    // Query endpoint
    if (url.pathname === '/query' && request.method === 'POST') {
      try {
        const body = await request.text();
        if (body.length > MAX_INPUT_SIZE) {
          return new Response(JSON.stringify({ error: 'Input too large', max_bytes: MAX_INPUT_SIZE }), {
            status: 413,
            headers,
          });
        }

        const { input, filter } = JSON.parse(body);
        if (input === undefined || !filter) {
          return new Response(JSON.stringify({ error: 'Missing required fields: input, filter' }), {
            status: 400,
            headers,
          });
        }

        const result = applyFilter(input, filter);
        return new Response(JSON.stringify({ result, filter }), { headers });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 400, headers });
      }
    }

    return new Response(JSON.stringify({ error: 'Not found', endpoints: ['/query', '/health'] }), {
      status: 404,
      headers,
    });
  },
};
