export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

function checkBaseUrl(baseUrl) {
  if (typeof baseUrl !== "string") {
    throw new TypeError("baseUrl должен быть строкой");
  }
  let url;
  try {
    url = new URL(baseUrl);
  } catch (error) {
    throw new TypeError("baseUrl должен быть абсолютным адресом");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new TypeError("baseUrl должен начинаться с http или https");
  }
  if (url.search !== "" || url.hash !== "") {
    throw new TypeError("baseUrl не должен содержать query и hash");
  }
}

export function buildUrl(baseUrl, path, query = {}) {
  checkBaseUrl(baseUrl);
  if (typeof path !== "string" || path.trim() === "") {
    throw new TypeError("path должен быть непустой строкой");
  }
  if (query === null || typeof query !== "object" || Array.isArray(query)) {
    throw new TypeError("query должен быть объектом");
  }

  let base = baseUrl;
  while (base.endsWith("/")) {
    base = base.slice(0, -1);
  }
  let cleanPath = path;
  while (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.slice(1);
  }

  const url = new URL(base + "/" + cleanPath);
  for (const key in query) {
    const value = query[key];
    if (value === undefined || value === null || value === "") {
      continue;
    }
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 3000,
} = {}) {
  checkBaseUrl(baseUrl);
  if (typeof fetchFn !== "function") {
    throw new TypeError("fetchFn должен быть функцией");
  }
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError("timeoutMs должен быть положительным целым числом");
  }
  const defaultTimeoutMs = timeoutMs;

  async function requestJson(path, options = {}) {
    let method = "GET";
    if (options.method !== undefined) {
      method = String(options.method).toUpperCase();
    }
    if (method !== "GET" && method !== "POST" && method !== "PATCH" && method !== "DELETE") {
      throw new TypeError("Метод " + method + " не поддерживается");
    }
    if (method === "GET" && options.body !== undefined) {
      throw new TypeError("У GET-запроса не может быть тела");
    }

    const url = buildUrl(baseUrl, path, options.query || {});
    const headers = { Accept: "application/json" };
    const init = { method: method, headers: headers };
    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(options.body);
    }

    let limit = defaultTimeoutMs;
    if (options.timeoutMs !== undefined) {
      limit = options.timeoutMs;
    }
    const timeoutSignal = AbortSignal.timeout(limit);
    let signal = timeoutSignal;
    if (options.signal !== undefined) {
      signal = AbortSignal.any([options.signal, timeoutSignal]);
    }

    let response;
    try {
      init.signal = signal;
      response = await fetchFn(url, init);
    } catch (error) {
      if (options.signal !== undefined && options.signal.aborted) {
        throw new ApiError("Запрос отменён.", { kind: "aborted", url: url, cause: error });
      }
      if (timeoutSignal.aborted) {
        throw new ApiError("Превышено время ожидания ответа (" + limit + " мс).", { kind: "timeout", url: url, cause: error });
      }
      throw new ApiError("Сервер недоступен: ответ не получен.", { kind: "network", url: url, cause: error });
    }

    if (!(response instanceof Response)) {
      throw new ApiError("fetch вернул не Response.", { kind: "invalid-response", url: url });
    }

    if (!response.ok) {
      let payload = null;
      try {
        payload = await response.json();
      } catch (error) {
        payload = null;
      }
      let message = "Сервер вернул ошибку HTTP " + response.status + ".";
      let code = null;
      let details = null;
      if (payload !== null && typeof payload === "object" && payload.error) {
        if (typeof payload.error.message === "string") {
          message = payload.error.message;
        }
        if (payload.error.code !== undefined) {
          code = payload.error.code;
        }
        if (payload.error.details !== undefined) {
          details = payload.error.details;
        }
      }
      throw new ApiError(message, { kind: "http", status: response.status, code: code, details: details, url: url });
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("Content-Type") || "";
    if (!contentType.includes("application/json")) {
      throw new ApiError("Ответ не является JSON: " + contentType, { kind: "invalid-response", url: url });
    }

    try {
      return await response.json();
    } catch (error) {
      throw new ApiError("Сервер вернул повреждённый JSON.", { kind: "invalid-response", url: url, cause: error });
    }
  }

  return { requestJson: requestJson };
}
