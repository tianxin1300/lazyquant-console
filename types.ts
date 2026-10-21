import type { IntentType, MarketType, SpotOrderIntent, FuturesOrderIntent, NormalizedOrder, PositionSnapshot } from "../adapters/types";

export type GatewayState = "DISCONNECTED" | "SYNCING" | "READY" | "RUNNING" | "PROTECTIVE_ONLY" | "HALTED" | "RECONCILIATION_REQUIRED" | "EMERGENCY_CLOSING";
export type RiskDecisionAction = "ALLOW" | "REJECT" | "PROTECTIVE_ONLY" | "HALT";
export type GatewayOrderIntent = SpotOrderIntent | FuturesOrderIntent;

/** 代码级最大上限；运行时配置只能更严格，不能放宽。 */
export const HARD_RISK_CAPS = {
  maxSingleEntryNotional: 500,
  maxTotalExposure: 1_000,
  maxSymbolExposure: 500,
  maxStrategyExposure: 500,
  maxDailyLoss: 50,
  maxTotalLoss: 100,
  maxDrawdownPct: 5,
  maxConsecutiveLosses: 3,
  maxMarketDataStalenessMs: 5_000,
  maxAccountSyncAgeMs: 15_000,
  maxServerTimeOffsetMs: 1_000,
  maxOrderAgeMs: 5_000,
} as const;

export type RiskLimits = {
  maxSingleEntryNotional: number;
  maxTotalExposure: number;
  maxSymbolExposure: number;
  maxStrategyExposure: number;
  maxDailyLoss: number;
  maxTotalLoss: number;
  maxDrawdownPct: number;
  maxConsecutiveLosses: number;
  maxMarketDataStalenessMs: number;
  maxAccountSyncAgeMs: number;
  maxServerTimeOffsetMs: number;
  maxOrderAgeMs: number;
};

export type RiskContext = {
  now?: number;
  referencePrice?: number;
  marketDataAt: number;
  candleClosed: boolean;
  accountSyncedAt: number;
  reconciliationOk: boolean;
  serverTimeOffsetMs: number;
  state: GatewayState;
  dailyPnl: number;
  totalPnl: number;
  drawdownPct: number;
  consecutiveLosses: number;
  totalExposure: number;
  exposureBySymbol: Record<string, number>;
  exposureByStrategy: Record<string, number>;
  positions?: PositionSnapshot[];
  pendingUnknownOrder: boolean;
};

export type RiskDecision = {
  allowed: boolean;
  action: RiskDecisionAction;
  reasons: string[];
  checkedAt: number;
  marketType: MarketType;
  symbol: string;
  intentType: IntentType | undefined;
  notional?: number;
  audit: {
    signalId?: string;
    strategyId?: string;
    strategyVersion?: string;
    clientOrderId: string;
  };
};

export type RiskAuditEvent = {
  event: "risk_decision" | "order_submitted" | "order_unknown" | "gateway_state_changed";
  at: number;
  action?: RiskDecisionAction;
  reasons?: string[];
  state?: GatewayState;
  marketType?: MarketType;
  symbol?: string;
  clientOrderId?: string;
  order?: NormalizedOrder;
  signalId?: string;
  strategyId?: string;
  strategyVersion?: string;
};

export type RiskAuditSink = (event: RiskAuditEvent) => void;
