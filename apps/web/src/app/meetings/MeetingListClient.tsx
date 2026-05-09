"use client";

import { CalendarDays, MapPin, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { meetingFields, type Meeting } from "@/data/dummyMeetings";
import { loadAllMeetings } from "./meetingStorage";
import { MeetingShell } from "./MeetingShell";

const filterTags = ["전체", ...meetingFields];

export function MeetingListClient() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeField, setActiveField] = useState("전체");

  useEffect(() => {
    const timer = window.setTimeout(() => setMeetings(loadAllMeetings()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const visibleMeetings = useMemo(
    () =>
      activeField === "전체"
        ? meetings
        : meetings.filter((meeting) => meeting.field === activeField),
    [activeField, meetings],
  );

  return (
    <MeetingShell>
      <section className="meetings-page">
        <div className="meetings-header">
          <div>
            <h1>모임</h1>
            <p>같은 분야 학생들과 함께 성장하세요</p>
          </div>
          <Link className="meeting-create-button" href="/meetings/new">
            모임 만들기
            <Plus size={18} />
          </Link>
        </div>

        <div className="meeting-filter-strip" aria-label="모임 분야 필터">
          {filterTags.map((field) => (
            <button
              className={activeField === field ? "active" : ""}
              key={field}
              type="button"
              onClick={() => setActiveField(field)}
            >
              {field}
            </button>
          ))}
        </div>

        <div className="meeting-grid">
          {visibleMeetings.map((meeting) => {
            const isFull = meeting.memberCount >= meeting.maxMembers;
            return (
              <article className="meeting-card" key={meeting.id}>
                <div className="meeting-card-top">
                  <span className="meeting-field-chip">{meeting.field}</span>
                  {isFull && <span className="meeting-full-badge">마감</span>}
                </div>
                <h2>{meeting.title}</h2>
                <p>{meeting.description}</p>
                <div className="meeting-meta">
                  <span>
                    <CalendarDays size={16} />
                    {meeting.date}
                  </span>
                  <span>
                    <MapPin size={16} />
                    {meeting.location}
                  </span>
                </div>
                <small>주최: {meeting.hostNickname}</small>
                <footer>
                  <strong>
                    <Users size={16} />
                    {meeting.memberCount} / {meeting.maxMembers}명
                  </strong>
                  <Link
                    aria-disabled={isFull}
                    className={isFull ? "disabled" : ""}
                    href={`/meetings/${meeting.id}`}
                  >
                    {isFull ? "마감" : "참여하기"}
                  </Link>
                </footer>
              </article>
            );
          })}
        </div>
      </section>
    </MeetingShell>
  );
}
