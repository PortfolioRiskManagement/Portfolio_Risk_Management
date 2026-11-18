// Purpose: Verify the API client builds requests correctly and turns failed responses into errors.
import { afterEach, describe, expect, it, vi } from "vitest"

import apiClient from "./apiClient"

function mockFetch(response: Partial<Response> & { jsonBody?: unknown }) {
  const fn = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => response.jsonBody ?? {},
    ...response,
  })
  vi.stubGlobal("fetch", fn)
  return fn
}

afterEach(() => vi.unstubAllGlobals())

describe("apiClient.get", () => {
  it("returns the parsed body and status", async () => {
    mockFetch({ jsonBody: { hello: "world" }, status: 200 })

    expect(await apiClient.get("/api/health")).toEqual({ data: { hello: "world" }, status: 200 })
  })

  it("calls the local backend with credentials and a JSON header", async () => {
    const fn = mockFetch({})
    await apiClient.get("/api/health")

    expect(fn).toHaveBeenCalledWith("http://localhost:5001/api/health", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
  })

  it("throws with the status code and text when the response is not ok", async () => {
    mockFetch({ ok: false, status: 500, statusText: "Server Error" })

    await expect(apiClient.get("/api/health")).rejects.toThrow("HTTP 500: Server Error")
  })

  it("passes through a 404 as an error", async () => {
    mockFetch({ ok: false, status: 404, statusText: "Not Found" })

    await expect(apiClient.get("/api/nope")).rejects.toThrow("HTTP 404")
  })
})

describe("apiClient.post", () => {
  it("sends the body as JSON", async () => {
    const fn = mockFetch({})
    await apiClient.post("/api/scenario/calculate", { scenarioId: "x", holdings: [] })

    const [url, options] = fn.mock.calls[0]
    expect(url).toBe("http://localhost:5001/api/scenario/calculate")
    expect(options.method).toBe("POST")
    expect(options.credentials).toBe("include")
    expect(JSON.parse(options.body)).toEqual({ scenarioId: "x", holdings: [] })
  })

  it("returns the parsed body and status", async () => {
    mockFetch({ jsonBody: { success: true }, status: 201 })

    expect(await apiClient.post("/api/x", {})).toEqual({ data: { success: true }, status: 201 })
  })

  it("throws when the server rejects the request", async () => {
    mockFetch({ ok: false, status: 400, statusText: "Bad Request" })

    await expect(apiClient.post("/api/x", {})).rejects.toThrow("HTTP 400: Bad Request")
  })
})
