interface Waiter<A> {
  success: (a: A) => void
  failure: (reason: string) => void
  timestamp: number
}

export default class Q<A> {
  private queue: A[] = []

  private waiters: Waiter<A>[] = []

  private timeout: number

  constructor(timeoutInterval: number = 10000) {
    this.timeout = timeoutInterval
  }

  private refreshWaiters(): void {
    const now = Date.now()
    this.waiters = this.waiters.filter(_ => now - _.timestamp < this.timeout)
  }

  offer(a: A): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        this.refreshWaiters()
        const waiter = this.waiters.shift()
        if (waiter) {
          waiter.success(a)
          resolve(this.queue.length)
        } else {
          resolve(this.queue.push(a))
        }
      } catch (error) {
        reject(`Enqueue error: ${error}`)
      }
    })
  }

  take(): Promise<A> {
    const a = this.queue.shift()
    if (a) {
      return Promise.resolve(a)
    } else {
      return Promise.race([
        new Promise<A>((resolve, reject) => {
          this.refreshWaiters()
          this.waiters.push({
            success: resolve,
            failure: reject,
            timestamp: Date.now(),
          })
        }),
        new Promise<A>((_, reject) => {
          setTimeout(() => {
            reject('Queue timeout error')
          }, this.timeout)
        }),
      ])
    }
  }
}
