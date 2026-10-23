interface LatencyRecord {
  operation: string;
  durationMs: number;
  timestamp: string;
}

class PerformanceMonitor {
  private records: LatencyRecord[] = [];
  private maxRecords = 50;

  recordCall(operation: string, durationMs: number) {
    const record: LatencyRecord = {
      operation,
      durationMs: Number(durationMs.toFixed(2)),
      timestamp: new Date().toLocaleTimeString()
    };
    this.records.unshift(record);
    if (this.records.length > this.maxRecords) {
      this.records.pop();
    }
  }

  getAverageLatency(): number {
    if (this.records.length === 0) return 0;
    const sum = this.records.reduce((acc, r) => acc + r.durationMs, 0);
    return Number((sum / this.records.length).toFixed(2));
  }

  getRecords(): LatencyRecord[] {
    return this.records;
  }

  async measure<T>(operationName: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordCall(operationName, duration);
      return result;
    } catch (err) {
      const duration = performance.now() - start;
      this.recordCall(`${operationName} (Error)`, duration);
      throw err;
    }
  }
}

export const perfMonitor = new PerformanceMonitor();
