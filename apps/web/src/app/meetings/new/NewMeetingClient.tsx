"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { meetingFields, type Meeting } from "@/data/dummyMeetings";
import { MeetingShell } from "../MeetingShell";
import { saveMeeting } from "../meetingStorage";

function formatMeetingDate(value: string) {
  return value.replaceAll("-", ".");
}

function createMeetingId(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-|-$/g, "");
  return `meeting-${slug || "new"}-${Date.now()}`;
}

export function NewMeetingClient() {
  const router = useRouter();
  const [field, setField] = useState("백엔드");
  const [descriptionLength, setDescriptionLength] = useState(0);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim();
    const date = String(form.get("date") || "");
    const location = String(form.get("location") || "").trim();
    const maxMembers = Number(form.get("maxMembers") || 0);

    if (!title || !description || !date || !location || maxMembers < 2) {
      return;
    }

    const meeting: Meeting = {
      id: createMeetingId(title),
      title,
      description,
      field,
      date: formatMeetingDate(date),
      location,
      hostNickname: "새싹호스트",
      memberCount: 1,
      maxMembers,
      members: ["새싹호스트"],
    };

    saveMeeting(meeting);
    router.push("/meetings");
  }

  return (
    <MeetingShell>
      <section className="meeting-new-page">
        <Link className="meeting-back-link" href="/meetings">
          <ArrowLeft size={18} />
          모임 목록으로
        </Link>

        <div className="meetings-header">
          <div>
            <h1>모임 만들기</h1>
            <p>함께 성장할 학생들을 만날 작은 모임을 열어보세요</p>
          </div>
        </div>

        <form className="meeting-form-card" onSubmit={handleSubmit}>
          <label>
            <span>모임 제목</span>
            <input name="title" placeholder="예: 백엔드 API 배포 스터디" required />
          </label>

          <fieldset className="meeting-field-picker">
            <legend>분야 선택</legend>
            <div>
              {meetingFields.map((option) => (
                <button
                  className={field === option ? "active" : ""}
                  key={option}
                  type="button"
                  onClick={() => setField(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="meeting-description-field">
            <span>
              모임 소개 <small>{descriptionLength} / 200</small>
            </span>
            <textarea
              maxLength={200}
              name="description"
              onChange={(event) => setDescriptionLength(event.target.value.length)}
              placeholder="어떤 목표로 모이고 어떤 방식으로 진행할지 적어주세요."
              required
            />
          </label>

          <div className="meeting-form-grid">
            <label>
              <span>날짜 선택</span>
              <input name="date" type="date" required />
            </label>
            <label>
              <span>장소</span>
              <input name="location" placeholder="서울 강남구 스터디카페" required />
            </label>
            <label>
              <span>최대 인원</span>
              <input name="maxMembers" type="number" min={2} max={20} defaultValue={6} required />
            </label>
          </div>

          <button className="meeting-submit-button" type="submit">
            모임 개설하기
            <Plus size={18} />
          </button>
        </form>
      </section>
    </MeetingShell>
  );
}
