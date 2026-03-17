import queryString from "query-string";

//  Helper lấy token từ cookie (client-side) 
const getTokenFromCookie = (): string | null => {
  if (typeof window === "undefined") return null;
  const match = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith("token="));
  return match ? match.split("=")[1] : null;
};

//  sendRequest 
export const sendRequest = async <T>(props: IRequest): Promise<T> => {
  let {
    url,
    method,
    body,
    queryParams = {},
    useCredentials = false,
    headers = {},
    nextOption = {},
    isFormData = false,
  } = props;

  const token = getTokenFromCookie();

  const options: RequestInit = {
    method,
    headers: new Headers({
      ...(!isFormData &&
      body &&
      ["POST", "PATCH"].includes(method.toUpperCase())
        ? { "content-type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    }),
    body:
      body && ["POST", "PATCH", "DELETE"].includes(method.toUpperCase())
        ? isFormData
          ? body
          : JSON.stringify(body)
        : undefined,
    ...nextOption,
  };

  if (useCredentials) options.credentials = "include";

  if (Object.keys(queryParams).length) {
    url = `${url}?${queryString.stringify(queryParams)}`;
  }

  return fetch(url, options).then((res) => {
    if (res.ok) {
      return res.json() as T;
    }
    return res.json().then(
      (json) =>
        ({
          statusCode: res.status,
          message: json?.message ?? "Có lỗi xảy ra",
          error: json?.error ?? "",
        }) as T,
    );
  });
};

export const sendRequestServer = async <T>(
  props: IRequest & { token?: string },
): Promise<T> => {
  let {
    url,
    method,
    body,
    queryParams = {},
    headers = {},
    nextOption = {},
    isFormData = false,
    token,
  } = props;

  const options: RequestInit = {
    method,
    headers: new Headers({
      ...(!isFormData &&
      body &&
      ["POST", "PATCH"].includes(method.toUpperCase())
        ? { "content-type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    }),
    body:
      body && ["POST", "PATCH", "DELETE"].includes(method.toUpperCase())
        ? isFormData
          ? body
          : JSON.stringify(body)
        : undefined,
    ...nextOption,
  };

  if (Object.keys(queryParams).length) {
    url = `${url}?${queryString.stringify(queryParams)}`;
  }

  return fetch(url, options).then((res) => {
    if (res.ok) return res.json() as T;
    return res.json().then(
      (json) =>
        ({
          statusCode: res.status,
          message: json?.message ?? "Có lỗi xảy ra",
          error: json?.error ?? "",
        }) as T,
    );
  });
};
