import { Request, Response, NextFunction } from "express"

/**
 * Simple fixed-window in-memory rate limiter for sensitive endpoints
 * (login, register, password reset). Suitable for a single-instance
 * deployment; swap for a shared store (e.g. Redis) when scaling out.
 */
interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Periodically clear expired buckets so the map does not grow unbounded
const interval = setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}, 60_000)
interval.unref?.()

export function rateLimit(options: { windowMs: number; max: number; message?: string }) {
  const { windowMs, max, message = "Too many requests, please try again later." } = options

  return function limiter(req: Request, res: Response, next: NextFunction) {
    // Key on req.ip only. Do NOT read X-Forwarded-For directly: without a
    // trusted proxy configured, clients could spoof it to reset their bucket.
    const ip = req.ip || "unknown"
    const now = Date.now()
    let bucket = buckets.get(ip)

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs }
      buckets.set(ip, bucket)
    }

    bucket.count += 1

    if (bucket.count > max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
      res.setHeader("Retry-After", String(retryAfter))
      return res.status(429).json({ error: "Too Many Requests", message })
    }

    next()
  }
}
