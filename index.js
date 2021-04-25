/*
MIT License

Copyright (c) 2019 - 2021 Lilly Rose Berner

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const DOCUMENT_KEY_SIZE = 6;

const MAX_DOCUMENT_SIZE = 400000;
const DOCUMENT_EXPIRE_TTL = 86400 * 180;

class HTTPError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function generateId() {
  let id = "";
  let keyspace = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (let idx = 0; idx < DOCUMENT_KEY_SIZE; idx++) {
    id += keyspace.charAt(Math.random() * keyspace.length);
  }

  return id;
}

async function getRawId(id) {
  const content = await STORAGE.get(`documents:${id}`);

  if (!content) {
    throw new HTTPError(404, `Document "${id}" not found.`);
  }

  const headers = {
    "Content-Type": "text/plain; charset=UTF-8",
  };
  return new Response(content, { headers, status: 200 });
}

async function postDocuments(request) {
  const length = request.headers.get("Content-Length") || 0;

  if (Number(length) > MAX_DOCUMENT_SIZE) {
    throw new HTTPError(400, `Content must be shorter than ${MAX_DOCUMENT_SIZE} (was ${length}).`);
  }

  const id = generateId();
  const content = await request.text();

  await STORAGE.put(`documents:${id}`, content, { expirationTtl: DOCUMENT_EXPIRE_TTL });

  const json = {
    key: id,
    url: `https://starb.in/${id}`,
  };
  const headers = {
    "Content-Type": "application/json; charset=UTF-8",
  };

  const data = JSON.stringify(json);
  return new Response(data, { headers, status: 200 });
}

async function getDocumentsId(id) {
  const content = await STORAGE.get(`documents:${id}`);

  if (!content) {
    throw new HTTPError(404, `Document "${id}" not found.`);
  }

  const json = { key: id, data: content };
  const headers = {
    "Content-Type": "application/json; charset=UTF-8",
  };

  const data = JSON.stringify(json);
  return new Response(data, { headers, status: 200 });
}

async function handleRequest({ request }) {
  const { method, url } = request;
  const { host, pathname } = new URL(url);

  const match = /^\/(?:documents|raw)\/(\w+)$/.exec(pathname);
  const documentId = match ? match[1] : null;

  if (method === "GET" && pathname.startsWith("/raw")) {
    return await getRawId(documentId);
  } else if (method === "GET" && pathname.startsWith("/documents")) {
    return await getDocumentsId(documentId);
  } else if (method === "POST" && pathname === "/documents") {
    return await postDocuments(request);
  }

  throw new HTTPError(404, "File not found.");
}

async function handleEvent(event) {
  try {
    return await handleRequest(event);
  } catch (e) {
    if (!(e instanceof HTTPError)) {
      throw e;
    }

    const json = { message: e.message };
    const headers = {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json; charset=UTF-8",
    };

    const data = JSON.stringify(json);
    return new Response(data, { headers, status: e.status });
  }
}

addEventListener("fetch", (event) => {
  event.respondWith(handleEvent(event));
});
