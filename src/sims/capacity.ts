export type Capacity = {
  workers: number
  threads: number
  arrivals: number
  io: number
  pool: number
  dbLimit: number
}

type Request = {
  arrival: number
  stage: 'queue' | 'cpu' | 'checkout' | 'io' | 'done' | 'timeout'
  worker: number
  remaining: number
  waitSince: number
  finished?: number
}

export function simulateCapacity(settings: Capacity) {
  const tick = 10
  const timeout = 120
  const cpuTime = 100 - settings.io
  const requests: Request[] = Array.from({ length: settings.arrivals }, (_, index) => ({
    arrival: Math.floor(index / 8) * 30, stage: 'queue', worker: -1,
    remaining: cpuTime, waitSince: 0,
  }))
  const timeline: { time: number; queued: number; checkout: number; using: number }[] = []
  let finished = 0
  let maxQueue = 0
  let maxCheckout = 0
  for (let time = 0; finished < requests.length; time += tick) {
    const active = requests.filter((r) => r.arrival <= time && r.stage !== 'done' && r.stage !== 'timeout')
    // 前の区切りで処理を終えた要求を、スレッドを割り当てる前に次の段階へ進める。
    for (const request of active) {
      if (request.remaining > 0 || (request.stage !== 'cpu' && request.stage !== 'io')) continue
      if (request.stage === 'cpu' && settings.io > 0) {
        request.stage = 'checkout'
        request.waitSince = time
      } else {
        request.stage = 'done'
        request.finished = time
        finished++
      }
    }
    // 待っている要求は、処理中の要求が最も少ないワーカーに渡す。
    const load = Array.from({ length: settings.workers }, (_, worker) =>
      active.filter((r) => r.worker === worker && (r.stage === 'cpu' || r.stage === 'checkout' || r.stage === 'io')).length)
    for (const request of active) {
      if (request.stage !== 'queue') continue
      const worker = load.indexOf(Math.min(...load))
      if (load[worker] >= settings.threads) break
      request.worker = worker
      request.stage = 'cpu'
      load[worker]++
    }
    let using = active.filter((r) => r.stage === 'io').length
    for (let worker = 0; worker < settings.workers; worker++) {
      const assigned = active.filter((r) => r.worker === worker && (r.stage === 'cpu' || r.stage === 'checkout' || r.stage === 'io'))
      // このモデルでは各ワーカーで一度に1スレッドだけが Ruby の処理を進める。
      const running = assigned.find((r) => r.stage === 'cpu')
      for (const request of assigned) {
        if (request.stage !== 'checkout') continue
        if (using < settings.dbLimit && assigned.filter((r) => r.stage === 'io').length < settings.pool) {
          request.stage = 'io'
          request.remaining = settings.io
          using++
        } else if (time - request.waitSince >= timeout) {
          request.stage = 'timeout'
          request.finished = time
          finished++
        }
      }
      if (running) running.remaining -= tick
    }
    const queued = active.filter((r) => r.stage === 'queue').length
    const checkout = active.filter((r) => r.stage === 'checkout').length
    maxQueue = Math.max(maxQueue, queued)
    maxCheckout = Math.max(maxCheckout, checkout)
    if (time % 50 === 0 || finished === requests.length) timeline.push({ time, queued, checkout, using })
    for (const request of active) {
      if (request.stage === 'io') request.remaining -= tick
    }
  }

  const latencies = requests.filter((r) => r.stage === 'done').map((r) => r.finished! - r.arrival).sort((a, b) => a - b)
  const p95 = latencies[Math.ceil(latencies.length * 0.95) - 1]
  return { timeline, maxQueue, maxCheckout, p95, timeouts: requests.length - latencies.length }
}
