"use client";

import { CheckCircle2 } from "lucide-react";

export type IntentRecord = {
  id: string;
  targetType: "peer" | "meeting";
  targetId: string;
  label: string;
  reason: string;
  createdAt: string;
};

export function NetworkingIntentSummary({ intents }: { intents: IntentRecord[] }) {
  return (
    <section className="intent-summary-card" aria-label="내가 관심 표시한 추천">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">MVP 전환 기록</p>
          <h2>내가 관심 표시한 추천</h2>
        </div>
        <strong>{intents.length}개</strong>
      </div>

      {intents.length === 0 ? (
        <p className="intent-empty">추천 학생이나 모임에 관심을 남기면 여기에 쌓입니다.</p>
      ) : (
        <div className="intent-list">
          {intents.slice(0, 4).map((intent) => (
            <article key={intent.id}>
              <CheckCircle2 size={18} />
              <div>
                <strong>{intent.label}</strong>
                <p>{intent.reason}</p>
              </div>
              <small>{intent.targetType === "peer" ? "학생" : "모임"}</small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
