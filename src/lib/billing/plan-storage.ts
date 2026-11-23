"use client";

import { loadSecureLocal, saveSecureLocal } from "@/lib/security/client-storage";

export type PlanId = "free" | "pro";
export type BillingCycle = "monthly" | "yearly";
export type PaymentMethod = "click" | "payme" | "uzum" | "telegram";

export interface StoredPlanState {
  plan: PlanId;
  billingCycle: BillingCycle;
  paymentMethod?: PaymentMethod;
  orderId?: string;
  activatedAt?: string;
}

const PLAN_STORAGE_KEY = "3talaba_plan";
const PLAN_EVENT_NAME = "3talaba:plan-changed";

export function loadStoredPlan(): StoredPlanState {
  const saved = loadSecureLocal<StoredPlanState>(PLAN_STORAGE_KEY);
  if (saved && (saved.plan === "free" || saved.plan === "pro")) {
    return {
      plan: saved.plan,
      billingCycle: saved.billingCycle === "yearly" ? "yearly" : "monthly",
      paymentMethod: saved.paymentMethod,
      orderId: saved.orderId,
      activatedAt: saved.activatedAt,
    };
  }
  return { plan: "free", billingCycle: "monthly" };
}

export function saveStoredPlan(next: StoredPlanState): void {
  saveSecureLocal(PLAN_STORAGE_KEY, next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PLAN_EVENT_NAME, { detail: next }));
  }
}

export function subscribeStoredPlan(listener: (state: StoredPlanState) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => {
    const custom = event as CustomEvent<StoredPlanState>;
    if (custom.detail) {
      listener(custom.detail);
    } else {
      listener(loadStoredPlan());
    }
  };
  window.addEventListener(PLAN_EVENT_NAME, handler);
  return () => window.removeEventListener(PLAN_EVENT_NAME, handler);
}
