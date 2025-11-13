/**
 * Centralized rate limit coordinator for parallel API requests.
 *
 * Prevents "thundering herd" problem where multiple parallel requests
 * independently hit rate limits and each retry without coordinating.
 *
 * Usage:
 *   const coordinator = new RateLimitCoordinator();
 *
 *   // Before each API call:
 *   await coordinator.checkAndWait();
 *
 *   // If rate limit hit:
 *   coordinator.notifyRateLimit(delayMs);
 */
export class RateLimitCoordinator {
  private pausedUntil: number | null = null;
  private rateLimitCount = 0;
  private lastLoggedWait = 0;

  /**
   * Check if rate limit is active and wait if needed.
   * All parallel requests should call this before making API requests.
   *
   * NOTE: This method intentionally does NOT log to avoid interfering with
   * progress bars. The progress bar will naturally freeze during the wait,
   * which provides visual feedback that rate limiting is active.
   */
  async checkAndWait(): Promise<void> {
    if (this.pausedUntil === null) {
      return; // No rate limit active
    }

    const now = Date.now();
    if (now < this.pausedUntil) {
      const waitMs = this.pausedUntil - now;
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }

    // Clear pause after waiting
    this.pausedUntil = null;
  }

  /**
   * Notify coordinator that a rate limit was hit.
   * This pauses ALL parallel requests for the specified duration.
   *
   * NOTE: This method intentionally does NOT log to avoid interfering with
   * progress bars. Rate limit stats are reported at the end of processing.
   *
   * @param delayMs How long to pause all requests (milliseconds)
   */
  notifyRateLimit(delayMs: number): void {
    const resumeAt = Date.now() + delayMs;

    // Only update if this is a longer pause than current
    // (multiple requests might hit rate limit simultaneously)
    if (this.pausedUntil === null || resumeAt > this.pausedUntil) {
      this.pausedUntil = resumeAt;
      this.rateLimitCount++;
    }
  }

  /**
   * Get statistics about rate limit hits during this session.
   */
  getStats(): { totalRateLimits: number; currentlyPaused: boolean } {
    return {
      totalRateLimits: this.rateLimitCount,
      currentlyPaused: this.pausedUntil !== null && Date.now() < this.pausedUntil,
    };
  }

  /**
   * Reset coordinator state (useful for testing or restarting processing).
   */
  reset(): void {
    this.pausedUntil = null;
    this.rateLimitCount = 0;
    this.lastLoggedWait = 0;
  }
}
