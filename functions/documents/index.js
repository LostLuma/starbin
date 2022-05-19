/*
MIT License

Copyright (c) 2019 - 2022 Lilly Rose Berner

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

import { HTTPError } from "../..";

function generateId(size) {
  let id = "";
  const keyspace = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (let idx = 0; idx < size; idx++) {
    id += keyspace.charAt(Math.random() * keyspace.length);
  }

  return id;
}

export async function onRequestPost({ request, env }) {
  const length = Number(request.headers.get("Content-Length") || 0);

  if (!length) {
    throw new HTTPError(400, "Content must contain at least one character.");
  }

  if (length > env.MAX_DOCUMENT_SIZE) {
    throw new HTTPError(400, `Content must be shorter than ${env.MAX_DOCUMENT_SIZE} characters (was ${length}).`);
  }

  const content = await request.text();
  const id = generateId(env.DOCUMENT_KEY_SIZE);

  await env.STORAGE.put(`documents:${id}`, content, { expirationTtl: env.DOCUMENT_EXPIRE_TTL });

  const domain = new URL(request.url).hostname;

  const json = {
    key: id,
    url: `https://${domain}/${id}`,
  };
  const headers = {
    "Content-Type": "application/json; charset=UTF-8",
  };

  const data = JSON.stringify(json);
  return new Response(data, { headers, status: 200 });
}
