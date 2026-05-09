"use client";

import { ArrowLeft, CalendarDays, LockKeyhole, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  fallbackMeetingRecommendations,
  meetingRecommendations,
  type Meeting,
} from "@/data/dummyMeetings";
import { MeetingShell } from "../MeetingShell";
import { loadAllMeetings } from "../meetingStorage";

export function MeetingDetailClient({ meetingId }: { meetingId: string }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setMeetings(loadAllMeetings()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const meeting = meetings.find((item) => item.id === meetingId);
  const recommendations = useMemo(
    () =>
      meeting
        ? meetingRecommendations[meeting.field] || fallbackMeetingRecommendations
        : fallbackMeetingRecommendations,
    [meeting],
  );

  if (!meeting) {
    return (
      <MeetingShell>
        <section className="meeting-detail-page">
          <Link className="meeting-back-link" href="/meetings">
            <ArrowLeft size={18} />
            모임 목록으로
          </Link>
          <article className="meeting-empty-card">
            <h1>모임을 찾을 수 없어요</h1>
            <p>세션에 저장된 모임이 사라졌거나 잘못된 주소입니다.</p>
          </article>
        </section>
      </MeetingShell>
    );
  }

  return (
    <MeetingShell>
      <section className="meeting-detail-page">
        <Link className="meeting-back-link" href="/meetings">
          <ArrowLeft size={18} />
          모임 목록으로
        </Link>

        <article className="meeting-detail-hero">
          <span className="meeting-field-chip">{meeting.field}</span>
          <h1>{meeting.title}</h1>
          <div className="meeting-meta">
            <span>
              <CalendarDays size={17} />
              {meeting.date}
            </span>
            <span>
              <MapPin size={17} />
              {meeting.location}
            </span>
          </div>
          <small>주최: {meeting.hostNickname}</small>
        </article>

        <div className="meeting-detail-grid">
          <article className="meeting-detail-card meeting-intro-card">
            <h2>모임 소개</h2>
            <p>{meeting.description}</p>
          </article>

          <article className="meeting-detail-card">
            <div className="meeting-detail-title">
              <h2>멤버 목록</h2>
              <span>
                <Users size={16} />
                {meeting.memberCount} / {meeting.maxMembers}명
              </span>
            </div>
            <div className="meeting-member-list">
              {meeting.members.map((member, index) => (
                <div className="meeting-member-row" key={`${member}-${index}`}>
                  <span
                    className="meeting-member-avatar"
                    style={
                      {
                        "--avatar-color": ["#4F46E5", "#7C3AED", "#10B981", "#F59E0B"][
                          index % 4
                        ],
                      } as React.CSSProperties
                    }
                    aria-hidden="true"
                  >
                    {Array.from(member)[0]}
                  </span>
                  <strong>{member}</strong>
                  <small>
                    <LockKeyhole size={14} />
                    프리미엄에서 상세 확인
                  </small>
                </div>
              ))}
            </div>
          </article>
        </div>

        <article className="meeting-ai-card">
          <h2>✦ AI 추천 활동</h2>
          <p>같은 {meeting.field} 분야 학생들의 포트폴리오를 분석한 결과예요</p>
          <ul>
            {recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </MeetingShell>
  );
}
