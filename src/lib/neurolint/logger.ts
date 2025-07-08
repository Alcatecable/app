
/**
 * Enterprise-grade logging system for NeuroLint
 * Supports structured logging with different levels and contexts
 */
export interface LogContext {
  layerId?: number;
  operation?: string;
  executionId?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  context?: LogContext;
  error?: Error;
  duration?: number;
}

class NeuroLintLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private sessionId = this.generateSessionId();

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogEntry(
    level: LogEntry['level'], 
    message: string, 
    context?: LogContext,
    error?: Error,
    duration?: number
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        ...context,
        sessionId: this.sessionId
      },
      error,
      duration
    };
  }

  debug(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('debug', message, context);
    this.addLog(entry);
    if (process.env.NODE_ENV === 'development') {
      console.debug(`🔍 [DEBUG] ${message}`, context);
    }
  }

  info(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('info', message, context);
    this.addLog(entry);
    console.info(`ℹ️ [INFO] ${message}`, context);
  }

  warn(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('warn', message, context);
    this.addLog(entry);
    console.warn(`⚠️ [WARN] ${message}`, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createLogEntry('error', message, context, error);
    this.addLog(entry);
    console.error(`❌ [ERROR] ${message}`, error, context);
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createLogEntry('fatal', message, context, error);
    this.addLog(entry);
    console.error(`💥 [FATAL] ${message}`, error, context);
  }

  performance(message: string, duration: number, context?: LogContext): void {
    const entry = this.createLogEntry('info', message, context, undefined, duration);
    this.addLog(entry);
    console.info(`⚡ [PERF] ${message} (${duration.toFixed(2)}ms)`, context);
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  getLogs(level?: LogEntry['level']): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  getSessionId(): string {
    return this.sessionId;
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new NeuroLintLogger();
