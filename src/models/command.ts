import { toBool, toString_ } from './common';

export type EngineAction = 'stop' | 'restore';

export interface CommandResult {
  ok: boolean;
  message: string;
}

export function parseCommandResult(j: Record<string, unknown>): CommandResult {
  return {
    ok: !toBool(j.err),
    message: toString_(j.msg),
  };
}
