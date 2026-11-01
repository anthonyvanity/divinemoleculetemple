/** A missing /assets file must not be cached. A cached miss looks like the design fell off. */
export default async function assetMissMiddleware(
  event: { url: URL },
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const response = await next();
  if (!event.url.pathname.startsWith("/assets/")) return response;
  if (!(response instanceof Response)) return response;
  const type = response.headers.get("content-type") || "";
  if (response.ok && !type.includes("text/html")) return response;
  const headers = new Headers(response.headers);
  headers.set("cache-control", "no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
