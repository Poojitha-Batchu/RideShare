export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class AppLogger {
  private static isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');

  static debug(message: unknown, ...optionalParams: unknown[]) {
    this.log('debug', message, optionalParams);
  }

  static info(message: unknown, ...optionalParams: unknown[]) {
    this.log('info', message, optionalParams);
  }

  static warn(message: unknown, ...optionalParams: unknown[]) {
    this.log('warn', message, optionalParams);
  }

  static error(message: unknown, ...optionalParams: unknown[]) {
    this.log('error', message, optionalParams);
  }

  private static log(level: LogLevel, message: unknown, optionalParams: unknown[]) {
    if (!this.isProduction) {
      const logMethod = console[level] ?? console.log;
      logMethod.call(console, `[${level.toUpperCase()}]`, message, ...optionalParams);
    }

    const payload = {
      level,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      details: optionalParams.length > 0 ? optionalParams : undefined,
      url: window.location.href,
    };

    const backendBaseUrl = (window as any).__API_BASE_URL__ || window.location.origin;
    const endpoint = `${backendBaseUrl.replace(/\/$/, '')}/logs/frontend/`;

    void fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // ignore logging failures so app behavior stays intact
    });
  }
}
