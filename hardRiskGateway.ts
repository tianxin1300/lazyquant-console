import { AdapterRequestError, type SpotAdapter, type UsdmFuturesAdapter } from "../adapters";
import type { GatewayOrderIntent, GatewayState, RiskAuditEvent, RiskAuditSink, RiskContext, RiskDecision, RiskLimits } from "./types";
import { HARD_RISK_CAPS } from "./types";

export type RiskGatewayAdapter = SpotAdapter | UsdmFuturesAdapter;

function tighten(value: number | undefined, cap: number) {
  if (value === undefined) return cap;
  if (!Number.isFinite(value) || value < 0) throw new Error("Risk limits must be finite non-negative numbers");
  return Math.min(value, cap);
}

export function createRiskLimits(input: Partial<RiskLimits> = {}): RiskLimits {
  return {
    maxSingleEntryNotional: tighten(input.maxSingleEntryNotional, HARD_RISK_CAPS.maxSingleEntryNotional),
    maxTotalExposure: tighten(input.maxTotalExposure, HARD_RISK_CAPS.maxTotalExposure),
    maxSymbolExposure: tighten(input.maxSymbolExposure, HARD_RISK_CAPS.maxSymbolExposure),
    maxStrategyExposure: tighten(input.maxStrategyExposure, HARD_RISK_CAPS.maxStrategyExposure),
    maxDailyLoss: tighten(input.maxDailyLoss, HARD_RISK_CAPS.maxDailyLoss),
    maxTotalLoss: tighten(input.maxTotalLoss, HARD_RISK_CAPS.maxTotalLoss),
    maxDrawdownPct: tighten(input.maxDrawdownPct, HARD_RISK_CAPS.maxDrawdownPct),
    maxConsecutiveLosses: Math.floor(tighten(input.maxConsecutiveLosses, HARD_RISK_CAPS.maxConsecutiveLosses)),
    maxMarketDataStalenessMs: tighten(input.maxMarketDataStalenessMs, HARD_RISK_CAPS.maxMarketDataStalenessMs),
    maxAccountSyncAgeMs: tighten(input.maxAccountSyncAgeMs, HARD_RISK_CAPS.maxAccountSyncAgeMs),
    maxServerTimeOffsetMs: tighten(input.maxServerTimeOffsetMs, HARD_RISK_CAPS.maxServerTimeOffsetMs),
    maxOrderAgeMs: tighten(input.maxOrderAgeMs, HARD_RISK_CAPS.maxOrderAgeMs),
  };
}

export class RiskRejectedError extends Error {
  constructor(readonly decision: RiskDecision) {
    super(`Hard Risk Gateway rejected ${decision.symbol}: ${decision.reasons.join(", ")}`);
    this.name = "RiskRejectedError";
  }
}

export class HardRiskGateway {
  private state: GatewayState = "SYNCING";
  private readonly usedSignalKeys = new Set<string>();
  private readonly limits: RiskLimits;

  constructor(
    private readonly adapter: RiskGatewayAdapter,
    limits: Partial<RiskLimits> = {},
    private readonly audit: RiskAuditSink = () => undefined,
  ) {
    this.limits = createRiskLimits(limits);
  }

  get gatewayState() { return this.state; }
  get riskLimits() { return { ...this.limits }; }

  setState(next: GatewayState, at = Date.now()) {
    this.state = next;
    this.emit({ event: "gateway_state_changed", at, state: next, marketType: this.adapter.marketType });
  }

  markReady(at = Date.now()) { this.setState("READY", at); }
  start(at = Date.now()) { if (this.state !== "READY" && this.state !== "PROTECTIVE_ONLY") throw new Error(`Cannot start gateway from ${this.state}`); this.setState("RUNNING", at); }
  enterProtectiveOnly(reason = "manual_protective_mode", at = Date.now()) { this.setState("PROTECTIVE_ONLY", at); this.emit({ event: "risk_decision", at, action: "PROTECTIVE_ONLY", reasons: [reason], marketType: this.adapter.marketType }); }
  halt(reason = "manual_halt", at = Date.now()) { this.setState("HALTED", at); this.emit({ event: "risk_decision", at, action: "HALT", reasons: [reason], marketType: this.adapter.marketType }); }
  requireReconciliation(reason = "reconciliation_required", at = Date.now()) { this.setState("RECONCILIATION_REQUIRED", at); this.emit({ event: "risk_decision", at, action: "HALT", reasons: [reason], marketType: this.adapter.marketType }); }

  evaluate(intent: GatewayOrderIntent, context: RiskContext): RiskDecision {
    const now = context.now ?? Date.now();
    const reasons: string[] = [];
    const intentType = intent.intentType;
    const isEmergency = intentType === "EMERGENCY_CLOSE";
    const isOpening = intentType === "OPEN" || intentType === "ADD";
    const notional = this.calculateNotional(intent, context.referencePrice);

    if (intent.marketType !== this.adapter.marketType) reasons.push("MARKET_DOMAIN_MISMATCH");
    if (!intentType) reasons.push("MISSING_INTENT_TYPE");
    if (!intent.clientOrderId || !/^[.A-Z:/a-z0-9_-]{1,36}$/.test(intent.clientOrderId)) reasons.push("INVALID_CLIENT_ORDER_ID");
    if (isOpening && !intent.signalId) reasons.push("OPENING_SIGNAL_ID_REQUIRED");
    if (isOpening && context.pendingUnknownOrder) reasons.push("PENDING_UNKNOWN_ORDER");
    if (!context.candleClosed && isOpening) reasons.push("CANDLE_NOT_CLOSED");
    if (Math.abs(context.serverTimeOffsetMs) > this.limits.maxServerTimeOffsetMs) reasons.push("SERVER_TIME_OFFSET_TOO_LARGE");
    if (now - context.marketDataAt > this.limits.maxMarketDataStalenessMs && !isEmergency) reasons.push("MARKET_DATA_STALE");
    if (now - context.accountSyncedAt > this.limits.maxAccountSyncAgeMs && !isEmergency) reasons.push("ACCOUNT_SYNC_STALE");
    if (!context.reconciliationOk && !isEmergency) reasons.push("RECONCILIATION_NOT_CONFIRMED");
    if (context.state === "DISCONNECTED" || (!isEmergency && (context.state === "HALTED" || context.state === "RECONCILIATION_REQUIRED"))) reasons.push(`GATEWAY_STATE_${context.state}`);
    if (this.state === "DISCONNECTED" || (!isEmergency && (this.state === "HALTED" || this.state === "RECONCILIATION_REQUIRED"))) reasons.push(`LOCAL_GATEWAY_STATE_${this.state}`);
    if (isOpening && (context.state === "PROTECTIVE_ONLY" || this.state === "PROTECTIVE_ONLY")) reasons.push("PROTECTIVE_ONLY_BLOCKS_OPENING");
    if (context.dailyPnl <= -this.limits.maxDailyLoss && isOpening) reasons.push("MAX_DAILY_LOSS");
    if (context.totalPnl <= -this.limits.maxTotalLoss && isOpening) reasons.push("MAX_TOTAL_LOSS");
    if (context.drawdownPct >= this.limits.maxDrawdownPct && isOpening) reasons.push("MAX_DRAWDOWN");
    if (context.consecutiveLosses >= this.limits.maxConsecutiveLosses && isOpening) reasons.push("MAX_CONSECUTIVE_LOSSES");
    if (notional !== undefined && isOpening && notional > this.limits.maxSingleEntryNotional) reasons.push("MAX_SINGLE_ENTRY_NOTIONAL");
    if (notional !== undefined && isOpening && context.totalExposure + notional > this.limits.maxTotalExposure) reasons.push("MAX_TOTAL_EXPOSURE");
    if (notional !== undefined && isOpening && (context.exposureBySymbol[intent.symbol] ?? 0) + notional > this.limits.maxSymbolExposure) reasons.push("MAX_SYMBOL_EXPOSURE");
    if (notional !== undefined && isOpening && intent.strategyId && (context.exposureByStrategy[intent.strategyId] ?? 0) + notional > this.limits.maxStrategyExposure) reasons.push("MAX_STRATEGY_EXPOSURE");

    const signalKey = this.signalKey(intent);
    if (isOpening && signalKey && this.usedSignalKeys.has(signalKey)) reasons.push("DUPLICATE_SIGNAL");
    if (intent.marketType === "USD_M_FUTURES" && isOpening && intent.closePosition) reasons.push("OPENING_CANNOT_CLOSE_POSITION");
    if (intent.marketType === "USD_M_FUTURES" && intent.closePosition && !["STOP_MARKET", "TAKE_PROFIT_MARKET"].includes(intent.type)) reasons.push("INVALID_CLOSE_POSITION_TYPE");

    const allowed = reasons.length === 0 || isEmergency && reasons.every((reason) => ["CANDLE_NOT_CLOSED", "MARKET_DATA_STALE", "ACCOUNT_SYNC_STALE", "RECONCILIATION_NOT_CONFIRMED"].includes(reason));
    const action = allowed ? "ALLOW" : isOpening ? "REJECT" : isEmergency ? "HALT" : "PROTECTIVE_ONLY";
    const decision: RiskDecision = { allowed, action, reasons, checkedAt: now, marketType: intent.marketType, symbol: intent.symbol, intentType, notional, audit: { signalId: intent.signalId, strategyId: intent.strategyId, strategyVersion: intent.strategyVersion, clientOrderId: intent.clientOrderId } };
    this.emit({ event: "risk_decision", at: now, action, reasons, marketType: intent.marketType, symbol: intent.symbol, clientOrderId: intent.clientOrderId, signalId: intent.signalId, strategyId: intent.strategyId, strategyVersion: intent.strategyVersion });
    return decision;
  }

  async submit(intent: GatewayOrderIntent, context: RiskContext) {
    const decision = this.evaluate(intent, context);
    if (!decision.allowed) throw new RiskRejectedError(decision);
    const signalKey = this.signalKey(intent);
    if (signalKey) this.usedSignalKeys.add(signalKey);
    try {
      const order = intent.marketType === "SPOT" ? await this.adapterAsSpot().createOrder(intent) : await this.adapterAsFutures().createOrder(intent);
      this.emit({ event: "order_submitted", at: Date.now(), order, marketType: intent.marketType, symbol: intent.symbol, clientOrderId: intent.clientOrderId, signalId: intent.signalId, strategyId: intent.strategyId, strategyVersion: intent.strategyVersion });
      return order;
    } catch (error) {
      if (error instanceof AdapterRequestError && error.executionUnknown) {
        this.requireReconciliation("ORDER_EXECUTION_UNKNOWN");
        this.emit({ event: "order_unknown", at: Date.now(), marketType: intent.marketType, symbol: intent.symbol, clientOrderId: intent.clientOrderId, signalId: intent.signalId, strategyId: intent.strategyId, strategyVersion: intent.strategyVersion });
      }
      throw error;
    }
  }

  private calculateNotional(intent: GatewayOrderIntent, referencePrice?: number) {
    if (intent.marketType === "SPOT" && intent.quoteOrderQty) return Number(intent.quoteOrderQty);
    if (!intent.quantity) return undefined;
    const priceValue = intent.price ? Number(intent.price) : referencePrice;
    const quantity = Number(intent.quantity);
    if (priceValue === undefined || !Number.isFinite(priceValue) || !Number.isFinite(quantity) || priceValue <= 0 || quantity <= 0) return undefined;
    return priceValue * quantity;
  }

  private signalKey(intent: GatewayOrderIntent) {
    if (!intent.signalId || !intent.strategyVersion || !intent.intentType) return undefined;
    return [intent.marketType, intent.symbol, intent.strategyId ?? "unknown", intent.strategyVersion, intent.signalId, intent.intentType].join("|");
  }

  private adapterAsSpot(): SpotAdapter { if (this.adapter.marketType !== "SPOT") throw new Error("Spot adapter required"); return this.adapter as SpotAdapter; }
  private adapterAsFutures(): UsdmFuturesAdapter { if (this.adapter.marketType !== "USD_M_FUTURES") throw new Error("Futures adapter required"); return this.adapter as UsdmFuturesAdapter; }
  private emit(event: RiskAuditEvent) { this.audit(event); }
}
