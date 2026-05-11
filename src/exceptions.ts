export class NeptrackException extends Error {
  readonly statusCode?: number;
  constructor(message: string, opts: { statusCode?: number } = {}) {
    super(message);
    this.name = 'NeptrackException';
    this.statusCode = opts.statusCode;
  }
}

/** 401 — missing / invalid / revoked token. */
export class NeptrackAuthException extends NeptrackException {
  constructor(message: string) {
    super(message, { statusCode: 401 });
    this.name = 'NeptrackAuthException';
  }
}

/** 403 — token lacks the scope required for the endpoint. */
export class NeptrackScopeException extends NeptrackException {
  constructor(message: string) {
    super(message, { statusCode: 403 });
    this.name = 'NeptrackScopeException';
  }
}

/** 429 — too many failed auth attempts. */
export class NeptrackRateLimitException extends NeptrackException {
  constructor(message: string) {
    super(message, { statusCode: 429 });
    this.name = 'NeptrackRateLimitException';
  }
}

/** Endpoint returned `err: true`. */
export class NeptrackApiException extends NeptrackException {
  constructor(message: string) {
    super(message);
    this.name = 'NeptrackApiException';
  }
}
