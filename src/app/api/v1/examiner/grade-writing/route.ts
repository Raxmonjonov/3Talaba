import { NextRequest, NextResponse } from "next/server";
import {
  EssayEvaluationSchema,
  evaluateEssayDeterministically,
  STRICT_EXAMINER_SYSTEM_PROMPT,
} from "@/lib/examiner/essay-evaluator";

// In-memory credit ledger per client IP / user ID for standalone Next.js runtime
const dailyCreditLedger = new Map<string, { dateKey: string; count: number }>();

function checkAndConsumeDailyCredits(
  userKey: string,
  tier: "FREE" | "PREMIUM",
  dailyLimit = 5
): { allowed: boolean; usedToday: number; dailyLimit: number } {
  if (tier === "PREMIUM") {
    return { allowed: true, usedToday: 0, dailyLimit: 999 };
  }
  const todayKey = new Date().toISOString().slice(0, 10);
  const entry = dailyCreditLedger.get(userKey);
  const currentCount = entry && entry.dateKey === todayKey ? entry.count : 0;

  if (currentCount >= dailyLimit) {
    return { allowed: false, usedToday: currentCount, dailyLimit };
  }

  const nextCount = currentCount + 1;
  dailyCreditLedger.set(userKey, { dateKey: todayKey, count: nextCount });
  return { allowed: true, usedToday: nextCount, dailyLimit };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const essayText = String(body?.essay_text ?? "").trim();
    const promptText = String(
      body?.prompt_text ??
        "Some people believe that university education should focus exclusively on preparing students for practical career paths, while others think higher education should serve a broader intellectual purpose. Discuss both views and give your own opinion."
    ).trim();
    const taskType =
      body?.task_type === "WRITING_TASK_1" ? "WRITING_TASK_1" : "WRITING_TASK_2";
    const subscriptionTier =
      body?.subscription_tier === "PREMIUM" ? "PREMIUM" : "FREE";
    const userId = String(body?.user_id ?? "anonymous-candidate");

    if (essayText.length < 15) {
      return NextResponse.json(
        {
          detail:
            "Essay is too short to grade. Please write at least one complete sentence.",
        },
        { status: 400 }
      );
    }

    // 1. Validate User Daily Credits
    const creditStatus = checkAndConsumeDailyCredits(
      userId,
      subscriptionTier,
      5
    );
    if (!creditStatus.allowed) {
      return NextResponse.json(
        {
          code: "DAILY_CREDITS_EXHAUSTED",
          detail: `Free tier daily limit of ${creditStatus.dailyLimit} AI Examiner evaluations reached. Upgrade to Premium for unlimited grading.`,
          used_today: creditStatus.usedToday,
          daily_limit: creditStatus.dailyLimit,
        },
        { status: 429 }
      );
    }

    // 2. Call OpenAI Structured Outputs if OPENAI_API_KEY is configured, otherwise run deterministic linguistic engine
    const openAiKey = process.env.OPENAI_API_KEY?.trim();
    let evaluation = null;

    if (openAiKey) {
      try {
        const wordCount = essayText.split(/\s+/).filter(Boolean).length;
        const llmRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openAiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.1,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: STRICT_EXAMINER_SYSTEM_PROMPT },
              {
                role: "user",
                content: `Task Type: ${taskType}\nOfficial Prompt: ${promptText}\nExact Word Count: ${wordCount}\n\nCandidate Essay:\n${essayText}`,
              },
            ],
          }),
        });

        if (llmRes.ok) {
          const rawJson = await llmRes.json();
          const parsedContent = JSON.parse(
            rawJson.choices?.[0]?.message?.content ?? "{}"
          );
          evaluation = EssayEvaluationSchema.parse(parsedContent);
        }
      } catch {
        // Fallback cleanly to deterministic linguistic analyzer
      }
    }

    if (!evaluation) {
      evaluation = evaluateEssayDeterministically(
        essayText,
        promptText,
        taskType
      );
    }

    const elapsedMs = Date.now() - startTime;
    return NextResponse.json(
      {
        ...evaluation,
        meta: {
          processing_time_ms: elapsedMs,
          word_count: essayText.split(/\s+/).filter(Boolean).length,
          credits_used_today: creditStatus.usedToday,
          daily_credit_limit: creditStatus.dailyLimit,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        detail: "Failed to evaluate IELTS Writing submission.",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
