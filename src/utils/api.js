const BASE = import.meta.env.VITE_API_URL || '/api';

function buildUrl(path) {
  if (!path) return BASE;
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function get(path) {
  const url = buildUrl(path);
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  try {
    const json = await res.json();
    return json;
  } catch (e) {
    return null;
  }
}

export async function post(path, data) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  try {
    const json = await res.json();
    return json;
  } catch (e) {
    return null;
  }
}

export default { get, post };
