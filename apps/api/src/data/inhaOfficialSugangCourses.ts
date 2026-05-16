export type InhaOfficialSugangCourse = {
  title: string;
  code: string;
  requirementType: string;
  grade: string;
  credits: number | null;
  sourceDepartment: string;
};

export type InhaOfficialSugangDepartment = {
  department: string;
  departmentCodes: string[];
  sourceTitles: string[];
  term: string;
  sourceUrl: string;
  courses: InhaOfficialSugangCourse[];
};

export const inhaOfficialSugangSourceUrl = "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx";

export const inhaOfficialSugangEvidence =
  "인하대학교 수강신청 2026학년도 1학기 강의시간표 및 강의계획서";

export const inhaOfficialSugangMinimumCourseSignals = 4;

export const inhaOfficialSugangDepartments: InhaOfficialSugangDepartment[] = [
  {
    "department": "전기전자공학부",
    "departmentCodes": [
      "1601284",
      "1601767"
    ],
    "sourceTitles": [
      "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서",
      "전기전자공학부 / 인공지능반도체공학 강의시간표 및 강의계획서"
    ],
    "term": "2026학년도 1학기",
    "sourceUrl": "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    "courses": [
      {
        "title": "다학년 연구프로젝트 1",
        "code": "ACE9501",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 1,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "다학년 연구프로젝트 3",
        "code": "ACE9503",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 1,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "객체지향프로그래밍",
        "code": "FVE3010",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "알파프로젝트 1",
        "code": "FVE9001",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 1,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "알파프로젝트 2",
        "code": "FVE9002",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 1,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "알파프로젝트 3",
        "code": "FVE9003",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 1,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "전공이해 및 실습 1",
        "code": "EEC1100",
        "requirementType": "전공필수",
        "grade": "1",
        "credits": 1,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "컴퓨터프로그래밍파이썬",
        "code": "EEC1102",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "객체지향프로그래밍기초",
        "code": "EEC1104",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "일반수학 1",
        "code": "MTH1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "물리학1",
        "code": "PHY1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "물리학실험1",
        "code": "PHY1903",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 1,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "공업수학 1",
        "code": "ACE2901",
        "requirementType": "전공기초",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "기초실험 1",
        "code": "EEC2100",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 1,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "기초실험 2",
        "code": "EEC2101",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 1,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "회로이론 1",
        "code": "EEC2102",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "전자기학 1",
        "code": "EEC2104",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "디지털논리회로",
        "code": "EEC2106",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "선형대수",
        "code": "EEC2110",
        "requirementType": "전공기초",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "회로이론 2",
        "code": "EEC2202",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "전자기학 2",
        "code": "EEC2204",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "전기전자물성",
        "code": "EEC2206",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "디지털 정보공학",
        "code": "EEC3510",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "자료구조론",
        "code": "EEC2208",
        "requirementType": "전공필수",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "전기전자회로응용실험",
        "code": "EEC3200",
        "requirementType": "전공필수",
        "grade": "3",
        "credits": 1,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "신호 및 시스템",
        "code": "EEC3202",
        "requirementType": "전공필수",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "자동제어",
        "code": "EEC3204",
        "requirementType": "전공필수",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "전기기기 및 설계",
        "code": "EEC3206",
        "requirementType": "전공필수",
        "grade": "3",
        "credits": 4,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "전력시스템공학",
        "code": "EEC3208",
        "requirementType": "전공필수",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "확률변수",
        "code": "EEC3210",
        "requirementType": "전공필수",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "전자회로 2",
        "code": "EEC3300",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "디지털시스템설계",
        "code": "EEC3302",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 4,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "반도체소자 1",
        "code": "EEC3304",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "기계학습개론",
        "code": "EEC3400",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "시스템프로그래밍",
        "code": "EEC3406",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "고급파이썬프로그래밍",
        "code": "EEC3408",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "알고리즘설계",
        "code": "EEC3414",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 4,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "전파공학",
        "code": "EEC3500",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "전자장론",
        "code": "EEC3504",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "수치해석",
        "code": "EEC3600",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "마이크로콘트롤러응용실험",
        "code": "EEC3604",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 1,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "센서공학",
        "code": "EEC3606",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "임베디드시스템 설계",
        "code": "EEC3612",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "아날로그 집적회로설계",
        "code": "EEC3308",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 4,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "디지털신호처리",
        "code": "EEC3404",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "전기전자 종합설계",
        "code": "EEC4100",
        "requirementType": "전공필수",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "전자디스플레이",
        "code": "EEC4300",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "시스템반도체설계",
        "code": "EEC4302",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "혼성신호 집적회로설계",
        "code": "EEC4304",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "반도체소자공정",
        "code": "EEC4306",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "반도체공학특론",
        "code": "EEC4308",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "광전자공학",
        "code": "EEC4314",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "디지털영상처리",
        "code": "EEC4400",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "오디오신호처리",
        "code": "EEC4404",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "멀티미디어",
        "code": "EEC4410",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "오디오 인공지능",
        "code": "EEC4416",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "디지털통신",
        "code": "EEC4500",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "인터넷프로토콜",
        "code": "EEC4504",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "모터제어",
        "code": "EEC4600",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "로봇공학",
        "code": "EEC4602",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "자율주행 자동차 공학",
        "code": "EEC4604",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "전력전자공학",
        "code": "EEC4702",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "전기응용",
        "code": "EEC4704",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      },
      {
        "title": "분산에너지시스템",
        "code": "EEC4706",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "전기전자공학부 / 전기전자공학 강의시간표 및 강의계획서"
      }
    ]
  },
  {
    "department": "이차전지융합학과",
    "departmentCodes": [
      "1602285",
      "1602375",
      "1602700"
    ],
    "sourceTitles": [
      "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서",
      "이차전지융합학과 / 특성화이차전지공학 강의시간표 및 강의계획서",
      "이차전지융합학과 / 첨단이차전지공학 강의시간표 및 강의계획서"
    ],
    "term": "2026학년도 1학기",
    "sourceUrl": "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    "courses": [
      {
        "title": "이차전지 소재양론",
        "code": "BSE2114",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "이차전지 재료과학",
        "code": "BSE2116",
        "requirementType": "전공필수",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "이차전지 제작 실습",
        "code": "BSE3003",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "이차전지 전극소재",
        "code": "BSE3101",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "이차전지 열관리 및 BMS공학",
        "code": "BSE3107",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "이차전지 산학프로젝트 1",
        "code": "BSE3110",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "이차전지 평가/분석 실습",
        "code": "BSE3113",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "이차전지 설계공학",
        "code": "BSE4007",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "이차전지 자원 순환 공학",
        "code": "BSE4009",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "이차전지 분석 및 모델링",
        "code": "BSE4112",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "이차전지 방화공학",
        "code": "SBE2000",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "이차전지 공정기술개론",
        "code": "SBE2002",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "이차전지 핵심광물과 공급망",
        "code": "SBE2007",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "폐배터리 재활용 공학",
        "code": "SBE3205",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "매트랩 기초",
        "code": "BSE1904",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "화학1",
        "code": "CHM1921",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "화학실험1",
        "code": "CHM1928",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 1,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "일반수학 1",
        "code": "MTH1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "물리학1",
        "code": "PHY1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "물리학실험1",
        "code": "PHY1903",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 1,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "공업수학 1",
        "code": "ACE2901",
        "requirementType": "전공기초",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "물리화학 1",
        "code": "BSE2100",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "유기화학 1",
        "code": "BSE2102",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 이차전지융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "이차전지 화학개론",
        "code": "SBE2010",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 첨단이차전지공학 강의시간표 및 강의계획서"
      },
      {
        "title": "이차전지 소재분석공학",
        "code": "SBE3202",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 첨단이차전지공학 강의시간표 및 강의계획서"
      },
      {
        "title": "이차전지 분석 PBL",
        "code": "SBE4203",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "이차전지융합학과 / 첨단이차전지공학 강의시간표 및 강의계획서"
      }
    ]
  },
  {
    "department": "파이낸스경영학과",
    "departmentCodes": [
      "1608093"
    ],
    "sourceTitles": [
      "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
    ],
    "term": "2026학년도 1학기",
    "sourceUrl": "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    "courses": [
      {
        "title": "경영학원론",
        "code": "CBA1902",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "회계원론",
        "code": "CBA1906",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "금융수학",
        "code": "FIN1991",
        "requirementType": "전공선택",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "재무관리",
        "code": "BUS2101",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "투자론",
        "code": "BUS3101",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "미시경제",
        "code": "GFB2105",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "비즈니스 영어1",
        "code": "GFB2107",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "비즈니스 영어2",
        "code": "GFB2108",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "금융실무영어",
        "code": "GFB3101",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "금융실무의 이해",
        "code": "GFB3103",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "금융세미나",
        "code": "GFB3104",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "금융기관경영",
        "code": "GFB3401",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "화폐금융",
        "code": "GFB3403",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "주식 및 채권분석",
        "code": "GFB3404",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "국제금융",
        "code": "GFB3405",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "재무금융 특강",
        "code": "GFB4103",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "핀테크금융",
        "code": "GFB4104",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "금융데이터로 본 금융시장의 이해",
        "code": "GFB4111",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "자산운용",
        "code": "GFB4301",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "경영학부 파이낸스경영학과 / 파이낸스경영학 강의시간표 및 강의계획서"
      }
    ]
  },
  {
    "department": "영미유럽인문융합학부",
    "departmentCodes": [
      "1604067",
      "1604088",
      "1604486"
    ],
    "sourceTitles": [
      "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서",
      "영미유럽인문융합학부 / 영미유럽인문융합학부 강의시간표 및 강의계획서",
      "영미유럽인문융합학부 / 프랑스언어문화 강의시간표 및 강의계획서"
    ],
    "term": "2026학년도 1학기",
    "sourceUrl": "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    "courses": [
      {
        "title": "영어학개론",
        "code": "ENG2201",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "영문법",
        "code": "ENG2203",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "영어독해의 이론과 실제",
        "code": "ENG2204",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "기술영어글쓰기",
        "code": "ENG2303",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "영어발음클리닉",
        "code": "ENG2304",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "표현영어글쓰기",
        "code": "ENG2401",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "영문학고전읽기",
        "code": "ENG2402",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "영문학개론",
        "code": "ENG2403",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "번역의 이론과 실제",
        "code": "ENG3009",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "영국문학개관 1",
        "code": "ENG3106",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "미국문학개관 1",
        "code": "ENG3108",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "영어문장구조의 이해",
        "code": "ENG3206",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "영어의 의미와 활용",
        "code": "ENG3207",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "영미소설",
        "code": "ENG3314",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "영미공연예술과 미디어",
        "code": "ENG3401",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "고급영어토론과프레젠테이션",
        "code": "ENG3404",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "숏폼스토리텔링",
        "code": "ENG3407",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "미국다문화의 이해",
        "code": "ENG4304",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "영미시",
        "code": "ENG4305",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "글로벌 셰익스피어",
        "code": "ENG4402",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영어영문학 강의시간표 및 강의계획서"
      },
      {
        "title": "서양문화와 예술",
        "code": "EES1001",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영미유럽인문융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "영어토론과 프레젠테이션",
        "code": "EES1002",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영미유럽인문융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "기초 프랑스어 1",
        "code": "EES1003",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영미유럽인문융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "문화연구개론",
        "code": "EES2305",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영미유럽인문융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "디지털문화연구프로젝트",
        "code": "EES4002",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영미유럽인문융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "프&#183;영 비교문화",
        "code": "EES4003",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영미유럽인문융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "문학이론과 문화비평",
        "code": "EES4120",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 영미유럽인문융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "프랑스어 듣기와 발음연습 1",
        "code": "FLL2005",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 프랑스언어문화 강의시간표 및 강의계획서"
      },
      {
        "title": "프랑스어 문법 1",
        "code": "FLL2010",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 프랑스언어문화 강의시간표 및 강의계획서"
      },
      {
        "title": "기초 프랑스어 2",
        "code": "FLL2038",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 프랑스언어문화 강의시간표 및 강의계획서"
      },
      {
        "title": "프랑스 명작산책",
        "code": "FLL3019",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 프랑스언어문화 강의시간표 및 강의계획서"
      },
      {
        "title": "DELF B1 읽기 &#183; 쓰기",
        "code": "FLL3032",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 프랑스언어문화 강의시간표 및 강의계획서"
      },
      {
        "title": "프랑스문학개관 1",
        "code": "FLL3038",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 프랑스언어문화 강의시간표 및 강의계획서"
      },
      {
        "title": "프랑스문화와 예술",
        "code": "FLL3040",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 프랑스언어문화 강의시간표 및 강의계획서"
      },
      {
        "title": "프랑스 문화권의 이해",
        "code": "FLL4026",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 프랑스언어문화 강의시간표 및 강의계획서"
      },
      {
        "title": "프랑스어 토론 1",
        "code": "FLL4027",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "영미유럽인문융합학부 / 프랑스언어문화 강의시간표 및 강의계획서"
      }
    ]
  },
  {
    "department": "문화콘텐츠문화경영학과",
    "departmentCodes": [
      "1236588"
    ],
    "sourceTitles": [
      "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
    ],
    "term": "2026학년도 1학기",
    "sourceUrl": "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    "courses": [
      {
        "title": "스토리텔링 입문",
        "code": "CCM2213",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "문화마케팅",
        "code": "CCM3212",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "시나리오의 수용과 창작",
        "code": "CCM3903",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "문화답사 기획실습",
        "code": "CCM1901",
        "requirementType": "전공선택",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "플롯유형론",
        "code": "CCM1213",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "문화정책의 이해",
        "code": "CCM2001",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "브랜드 커뮤니케이션",
        "code": "CCM2003",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "문화심리학",
        "code": "CCM2004",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "인터랙티브콘텐츠학 입문",
        "code": "CCM2217",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "테크놀로지와 문화예술",
        "code": "CCM2901",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "공연예술기획론",
        "code": "CCM4214",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "웹툰과 그래픽 노블의 분석",
        "code": "CCM3001",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "웹툰과 영상의 트랜스미디어",
        "code": "CCM3002",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "문화산업분석입문",
        "code": "CCM3004",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "기호학마케팅리서치",
        "code": "CCM3007",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "지역문화브랜딩실습",
        "code": "CCM3312",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "수사학의이해",
        "code": "CCM4311",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "신화와 문화콘텐츠",
        "code": "CCM1417",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "디지털 시대의 문화예술",
        "code": "CCM1419",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "문화브랜드마케팅방법론",
        "code": "CCM3313",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "문화콘텐츠 데이터 애널리틱스",
        "code": "CCM4001",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "문화브랜드창업실습",
        "code": "CCM4003",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "도시문화경영분석실습",
        "code": "CCM4004",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "설득커뮤니케이션",
        "code": "CCM4007",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      },
      {
        "title": "실용 스토리텔링 실습",
        "code": "CCM4902",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "문화콘텐츠문화경영학과 / 문화콘텐츠문화경영학 강의시간표 및 강의계획서"
      }
    ]
  },
  {
    "department": "의예과",
    "departmentCodes": [
      "0317077"
    ],
    "sourceTitles": [
      "의예과 / 의예 강의시간표 및 강의계획서"
    ],
    "term": "2026학년도 1학기",
    "sourceUrl": "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    "courses": [
      {
        "title": "인하와 참의사: 첫걸음1",
        "code": "PMD1101",
        "requirementType": "전공필수",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "의예과 / 의예 강의시간표 및 강의계획서"
      },
      {
        "title": "일반화학",
        "code": "PMD1002",
        "requirementType": "전공필수",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "의예과 / 의예 강의시간표 및 강의계획서"
      },
      {
        "title": "인체생물학",
        "code": "PMD1008",
        "requirementType": "전공필수",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "의예과 / 의예 강의시간표 및 강의계획서"
      },
      {
        "title": "의대생 입문",
        "code": "PMD1010",
        "requirementType": "전공필수",
        "grade": "1",
        "credits": 2,
        "sourceDepartment": "의예과 / 의예 강의시간표 및 강의계획서"
      },
      {
        "title": "세포의 구조와 기능",
        "code": "PMD2010",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "의예과 / 의예 강의시간표 및 강의계획서"
      },
      {
        "title": "의과학실험 입문",
        "code": "PMD2012",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 4,
        "sourceDepartment": "의예과 / 의예 강의시간표 및 강의계획서"
      }
    ]
  },
  {
    "department": "간호학과",
    "departmentCodes": [
      "1600079"
    ],
    "sourceTitles": [
      "간호학과 / 간호학 강의시간표 및 강의계획서"
    ],
    "term": "2026학년도 1학기",
    "sourceUrl": "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    "courses": [
      {
        "title": "간호학개론",
        "code": "NUR1015",
        "requirementType": "전공필수",
        "grade": "1",
        "credits": 1,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "건강격차와 복지사회",
        "code": "NUR1017",
        "requirementType": "전공선택",
        "grade": "1",
        "credits": 2,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "기초자연과학",
        "code": "NUR1919",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "기본간호학 1",
        "code": "NUR2010",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 2,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "기본간호학실습 1",
        "code": "NUR2012",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 1,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "미생물학",
        "code": "NUR2902",
        "requirementType": "전공기초",
        "grade": "2",
        "credits": 2,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "해부생리학2",
        "code": "NUR2903",
        "requirementType": "전공기초",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "해부생리학실습2",
        "code": "NUR2904",
        "requirementType": "전공기초",
        "grade": "2",
        "credits": 1,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "환자안전",
        "code": "NUR2024",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 2,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "아동간호학실습 1",
        "code": "NUR3003",
        "requirementType": "전공필수",
        "grade": "3",
        "credits": 1,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "성인간호학 2",
        "code": "NUR3006",
        "requirementType": "전공필수",
        "grade": "3",
        "credits": 2,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "정신간호학 2",
        "code": "NUR3014",
        "requirementType": "전공필수",
        "grade": "3",
        "credits": 2,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "성인간호학1",
        "code": "NUR3024",
        "requirementType": "전공필수",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "노인간호학실습",
        "code": "NUR3026",
        "requirementType": "전공필수",
        "grade": "3",
        "credits": 1,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "아동간호학1",
        "code": "NUR3027",
        "requirementType": "전공필수",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "성인간호학실습1",
        "code": "NUR3029",
        "requirementType": "전공필수",
        "grade": "3",
        "credits": 2,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "통합간호시뮬레이션실습1",
        "code": "NUR3030",
        "requirementType": "전공필수",
        "grade": "3",
        "credits": 1,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "중환자간호입문",
        "code": "NUR3032",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 2,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "성인간호학실습 3",
        "code": "NUR4009",
        "requirementType": "전공필수",
        "grade": "4",
        "credits": 1,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "정신간호학실습 2",
        "code": "NUR4012",
        "requirementType": "전공필수",
        "grade": "4",
        "credits": 1,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "지역사회간호학실습 1",
        "code": "NUR4014",
        "requirementType": "전공필수",
        "grade": "4",
        "credits": 1,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "간호관리학 2",
        "code": "NUR4017",
        "requirementType": "전공필수",
        "grade": "4",
        "credits": 2,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "지역사회간호학 2",
        "code": "NUR4024",
        "requirementType": "전공필수",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "여성건강간호학 1",
        "code": "NUR4027",
        "requirementType": "전공필수",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "여성건강간호학실습 1",
        "code": "NUR4029",
        "requirementType": "전공필수",
        "grade": "4",
        "credits": 1,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "간호관리학실습1",
        "code": "NUR4031",
        "requirementType": "전공필수",
        "grade": "4",
        "credits": 1,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      },
      {
        "title": "간호연구",
        "code": "NUR4902",
        "requirementType": "전공기초",
        "grade": "4",
        "credits": 2,
        "sourceDepartment": "간호학과 / 간호학 강의시간표 및 강의계획서"
      }
    ]
  },
  {
    "department": "디자인융합학과",
    "departmentCodes": [
      "1450589"
    ],
    "sourceTitles": [
      "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
    ],
    "term": "2026학년도 1학기",
    "sourceUrl": "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    "courses": [
      {
        "title": "다학년 연구프로젝트 1",
        "code": "ACE9501",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 1,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "다학년 연구프로젝트 3",
        "code": "ACE9503",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 1,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "H.O.S.T. 미디어랩 1",
        "code": "CDN1001",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 1,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "H.O.S.T. 미디어랩 3",
        "code": "CDN1003",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 1,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "캐릭터디자인",
        "code": "CDN2220",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "디자인의 원리",
        "code": "CDN1310",
        "requirementType": "전공선택",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "사진과영상",
        "code": "CDN1320",
        "requirementType": "전공선택",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "스마트Eco디자인",
        "code": "CDN2111",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "디자인세미나",
        "code": "CDN2126",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "타이포그래피",
        "code": "CDN2314",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "AR/VR 디자인",
        "code": "CDN2501",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "지역사회와디자인",
        "code": "CDN3115",
        "requirementType": "전공필수",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "엔터테인먼트영상디자인",
        "code": "CDN3253",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "라이프시스템디자인",
        "code": "CDN3311",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "아이덴티티디자인",
        "code": "CDN3318",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "디자인프로그래밍",
        "code": "CDN3322",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "UI 디자인",
        "code": "CDN3329",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "퍼블릭케이션 디자인",
        "code": "CDN3331",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "시각디자인 전시",
        "code": "CDN4348",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      },
      {
        "title": "미디어콘텐츠프로젝트",
        "code": "CDN4356",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "디자인융합학과 / 디자인융합학 강의시간표 및 강의계획서"
      }
    ]
  },
  {
    "department": "의류디자인학과",
    "departmentCodes": [
      "1454288"
    ],
    "sourceTitles": [
      "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
    ],
    "term": "2026학년도 1학기",
    "sourceUrl": "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    "courses": [
      {
        "title": "어패럴메이킹",
        "code": "FDT2104",
        "requirementType": "전공필수",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "패션과색채디자인",
        "code": "FDT2412",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "테일러링",
        "code": "FDT3104",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "패션비즈니스의이해",
        "code": "FDT1305",
        "requirementType": "전공필수",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "패션디자인론",
        "code": "FDT1404",
        "requirementType": "전공선택",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "패션드로잉",
        "code": "FDT1406",
        "requirementType": "전공선택",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "패션섬유와신소재",
        "code": "FDT2209",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "의상사회심리",
        "code": "FDT2304",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "패션리테일기획",
        "code": "FDT2308",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "기초패션디자인",
        "code": "FDT2416",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "의류생산과품질시험",
        "code": "FDT2206",
        "requirementType": "전공필수",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "패션브랜드매니지먼트",
        "code": "FDT3307",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "디지털패션마케팅",
        "code": "FDT3310",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "디자인트렌드와문화",
        "code": "FDT3409",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "패션디자인1",
        "code": "FDT3416",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "테크니컬디자인실습",
        "code": "FDT4109",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "3D어패럴캐드",
        "code": "FDT4209",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "패션액세서리디자인",
        "code": "FDT4414",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "의류디자인학 연구방법론",
        "code": "FDT4903",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      },
      {
        "title": "의류디자인학프로젝트",
        "code": "FDT4905",
        "requirementType": "전공필수",
        "grade": "4",
        "credits": 4,
        "sourceDepartment": "의류디자인학과 / 의류디자인학 강의시간표 및 강의계획서"
      }
    ]
  },
  {
    "department": "소프트웨어융합공학과",
    "departmentCodes": [
      "1238590"
    ],
    "sourceTitles": [
      "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
    ],
    "term": "2026학년도 1학기",
    "sourceUrl": "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    "courses": [
      {
        "title": "창의적공학설계",
        "code": "ITC1120",
        "requirementType": "전공선택",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "프로그래밍 기초",
        "code": "ITC1207",
        "requirementType": "전공선택",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "컴퓨터공학기초",
        "code": "ITC1208",
        "requirementType": "전공선택",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "일반수학 1",
        "code": "MTH1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "객체지향프로그래밍 2",
        "code": "ITC1206",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "이산수학",
        "code": "ITC1912",
        "requirementType": "전공기초",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "인터넷프로그래밍",
        "code": "ITC2203",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "C언어응용",
        "code": "ITC2212",
        "requirementType": "전공선택",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "데이터베이스",
        "code": "ITC3409",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "통계학",
        "code": "ITC2904",
        "requirementType": "전공기초",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "IoT프로그래밍",
        "code": "ITC3211",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "오퍼레이팅시스템",
        "code": "ITC3402",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "HCI",
        "code": "ITC4605",
        "requirementType": "전공필수",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "인공지능",
        "code": "ITC4611",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "데이터마이닝",
        "code": "ITC4619",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "SW융합프로젝트1",
        "code": "ITC9005",
        "requirementType": "전공선택",
        "grade": "3",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "클라이언트프로그래밍",
        "code": "ITC4056",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "AI임베디드컴퓨팅",
        "code": "ITC4616",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "기계학습",
        "code": "ITC4618",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      },
      {
        "title": "SW융합프로젝트3",
        "code": "ITC9003",
        "requirementType": "전공선택",
        "grade": "4",
        "credits": 3,
        "sourceDepartment": "소프트웨어융합공학과 / 소프트웨어융합공학 강의시간표 및 강의계획서"
      }
    ]
  },
  {
    "department": "자유전공융합학부",
    "departmentCodes": [
      "1613354"
    ],
    "sourceTitles": [
      "자유전공융합학부 / 자유전공융합학부 강의시간표 및 강의계획서"
    ],
    "term": "2026학년도 1학기",
    "sourceUrl": "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    "courses": [
      {
        "title": "화학1",
        "code": "CHM1921",
        "requirementType": "전공기초",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "자유전공융합학부 / 자유전공융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "일반화학",
        "code": "CHM1923",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "자유전공융합학부 / 자유전공융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "일반화학실험",
        "code": "CHM1927",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 1,
        "sourceDepartment": "자유전공융합학부 / 자유전공융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "화학실험1",
        "code": "CHM1928",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 1,
        "sourceDepartment": "자유전공융합학부 / 자유전공융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "전공탐색과 커리어설계",
        "code": "LCS1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "자유전공융합학부 / 자유전공융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "일반수학 1",
        "code": "MTH1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "자유전공융합학부 / 자유전공융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "물리학1",
        "code": "PHY1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "자유전공융합학부 / 자유전공융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "물리학실험1",
        "code": "PHY1903",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 1,
        "sourceDepartment": "자유전공융합학부 / 자유전공융합학부 강의시간표 및 강의계획서"
      }
    ]
  },
  {
    "department": "공학융합학부",
    "departmentCodes": [
      "1614096"
    ],
    "sourceTitles": [
      "공학융합학부 / 공학융합학부 강의시간표 및 강의계획서"
    ],
    "term": "2026학년도 1학기",
    "sourceUrl": "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    "courses": [
      {
        "title": "화학1",
        "code": "CHM1921",
        "requirementType": "전공기초",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "공학융합학부 / 공학융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "일반화학",
        "code": "CHM1923",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "공학융합학부 / 공학융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "컴퓨터프로그래밍",
        "code": "ECS1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "공학융합학부 / 공학융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "전공탐색과 커리어설계",
        "code": "LCS1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "공학융합학부 / 공학융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "일반수학 1",
        "code": "MTH1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "공학융합학부 / 공학융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "물리학1",
        "code": "PHY1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "공학융합학부 / 공학융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "물리학실험1",
        "code": "PHY1903",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 1,
        "sourceDepartment": "공학융합학부 / 공학융합학부 강의시간표 및 강의계획서"
      }
    ]
  },
  {
    "department": "자연과학융합학부",
    "departmentCodes": [
      "1615102"
    ],
    "sourceTitles": [
      "자연과학융합학부 / 자연과학융합학부 강의시간표 및 강의계획서"
    ],
    "term": "2026학년도 1학기",
    "sourceUrl": "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    "courses": [
      {
        "title": "일반수학연습 1",
        "code": "MTH1903",
        "requirementType": "전공기초",
        "grade": "전체",
        "credits": 1,
        "sourceDepartment": "자연과학융합학부 / 자연과학융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "계산수학",
        "code": "MTH1931",
        "requirementType": "전공기초",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "자연과학융합학부 / 자연과학융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "생명과학개론",
        "code": "BIO1903",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "자연과학융합학부 / 자연과학융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "화학1",
        "code": "CHM1921",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "자연과학융합학부 / 자연과학융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "화학실험1",
        "code": "CHM1928",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 1,
        "sourceDepartment": "자연과학융합학부 / 자연과학융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "전공탐색과 커리어설계",
        "code": "LCS1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "자연과학융합학부 / 자연과학융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "일반수학 1",
        "code": "MTH1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "자연과학융합학부 / 자연과학융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "해양학1",
        "code": "OCN1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "자연과학융합학부 / 자연과학융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "해양학실험 1",
        "code": "OCN1911",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 1,
        "sourceDepartment": "자연과학융합학부 / 자연과학융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "물리학1",
        "code": "PHY1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "자연과학융합학부 / 자연과학융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "물리학실험1",
        "code": "PHY1903",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 1,
        "sourceDepartment": "자연과학융합학부 / 자연과학융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "기초통계1",
        "code": "STS1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "자연과학융합학부 / 자연과학융합학부 강의시간표 및 강의계획서"
      },
      {
        "title": "기초통계실습1",
        "code": "STS1903",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 1,
        "sourceDepartment": "자연과학융합학부 / 자연과학융합학부 강의시간표 및 강의계획서"
      }
    ]
  },
  {
    "department": "경영융합학부",
    "departmentCodes": [
      "1616110"
    ],
    "sourceTitles": [
      "경영융합학부 / 경영융합학부 강의시간표 및 강의계획서"
    ],
    "term": "2026학년도 1학기",
    "sourceUrl": "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    "courses": [
      {
        "title": "전공탐색과 커리어설계",
        "code": "LCS1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "경영융합학부 / 경영융합학부 강의시간표 및 강의계획서"
      }
    ]
  },
  {
    "department": "사회과학융합학부",
    "departmentCodes": [
      "1617262"
    ],
    "sourceTitles": [
      "사회과학융합학부 / 사회과학융합학부 강의시간표 및 강의계획서"
    ],
    "term": "2026학년도 1학기",
    "sourceUrl": "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    "courses": [
      {
        "title": "전공탐색과 커리어설계",
        "code": "LCS1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "사회과학융합학부 / 사회과학융합학부 강의시간표 및 강의계획서"
      }
    ]
  },
  {
    "department": "인문융합학부",
    "departmentCodes": [
      "1618265"
    ],
    "sourceTitles": [
      "인문융합학부 / 인문융합학부 강의시간표 및 강의계획서"
    ],
    "term": "2026학년도 1학기",
    "sourceUrl": "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    "courses": [
      {
        "title": "전공탐색과 커리어설계",
        "code": "LCS1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "인문융합학부 / 인문융합학부 강의시간표 및 강의계획서"
      }
    ]
  },
  {
    "department": "첨단바이오의약학과",
    "departmentCodes": [
      "1603353"
    ],
    "sourceTitles": [
      "첨단바이오의약학과 / 첨단바이오의약학 강의시간표 및 강의계획서"
    ],
    "term": "2026학년도 1학기",
    "sourceUrl": "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    "courses": [
      {
        "title": "정보사회와컴퓨터",
        "code": "ACE1901",
        "requirementType": "전공기초",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "첨단바이오의약학과 / 첨단바이오의약학 강의시간표 및 강의계획서"
      },
      {
        "title": "바이오의약품인허가개론",
        "code": "BTM3202",
        "requirementType": "전공필수",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "첨단바이오의약학과 / 첨단바이오의약학 강의시간표 및 강의계획서"
      },
      {
        "title": "바이오공정",
        "code": "BTM3204",
        "requirementType": "전공선택",
        "grade": "전체",
        "credits": 3,
        "sourceDepartment": "첨단바이오의약학과 / 첨단바이오의약학 강의시간표 및 강의계획서"
      },
      {
        "title": "생명과학개론",
        "code": "BIO1903",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "첨단바이오의약학과 / 첨단바이오의약학 강의시간표 및 강의계획서"
      },
      {
        "title": "생명과학실험 1",
        "code": "BIO1904",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 1,
        "sourceDepartment": "첨단바이오의약학과 / 첨단바이오의약학 강의시간표 및 강의계획서"
      },
      {
        "title": "일반화학",
        "code": "CHM1923",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "첨단바이오의약학과 / 첨단바이오의약학 강의시간표 및 강의계획서"
      },
      {
        "title": "일반화학실험",
        "code": "CHM1927",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 1,
        "sourceDepartment": "첨단바이오의약학과 / 첨단바이오의약학 강의시간표 및 강의계획서"
      },
      {
        "title": "일반수학 1",
        "code": "MTH1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "첨단바이오의약학과 / 첨단바이오의약학 강의시간표 및 강의계획서"
      },
      {
        "title": "세포생물학",
        "code": "BIO2108",
        "requirementType": "전공필수",
        "grade": "2",
        "credits": 3,
        "sourceDepartment": "첨단바이오의약학과 / 첨단바이오의약학 강의시간표 및 강의계획서"
      }
    ]
  },
  {
    "department": "바이오식품공학과",
    "departmentCodes": [
      "1683817"
    ],
    "sourceTitles": [
      "바이오식품공학과 / 바이오식품공학 강의시간표 및 강의계획서"
    ],
    "term": "2026학년도 1학기",
    "sourceUrl": "https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx",
    "courses": [
      {
        "title": "화학실험1",
        "code": "CHM1928",
        "requirementType": "전공기초",
        "grade": "전체",
        "credits": 1,
        "sourceDepartment": "바이오식품공학과 / 바이오식품공학 강의시간표 및 강의계획서"
      },
      {
        "title": "화학1",
        "code": "CHM1921",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "바이오식품공학과 / 바이오식품공학 강의시간표 및 강의계획서"
      },
      {
        "title": "식품공학개론",
        "code": "FST1101",
        "requirementType": "전공선택",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "바이오식품공학과 / 바이오식품공학 강의시간표 및 강의계획서"
      },
      {
        "title": "일반수학 1",
        "code": "MTH1901",
        "requirementType": "전공기초",
        "grade": "1",
        "credits": 3,
        "sourceDepartment": "바이오식품공학과 / 바이오식품공학 강의시간표 및 강의계획서"
      }
    ]
  }
];

export function findInhaOfficialSugangDepartment(department: string) {
  const normalizedDepartment = normalizeDepartmentName(department);
  return inhaOfficialSugangDepartments.find(
    (item) => normalizeDepartmentName(item.department) === normalizedDepartment,
  );
}

export function summarizeInhaOfficialSugangCoverage(
  admissionDepartments: string[],
  minimumCourseSignals = inhaOfficialSugangMinimumCourseSignals,
) {
  const matchedDepartments = admissionDepartments
    .map((department) => ({
      department,
      schedule: findInhaOfficialSugangDepartment(department),
    }))
    .filter(({ schedule }) => Boolean(schedule));

  const courseBackedDepartments = matchedDepartments.filter(
    ({ schedule }) => (schedule?.courses.length ?? 0) >= minimumCourseSignals,
  );

  const partialDepartments = matchedDepartments.filter(({ schedule }) => {
    const courseCount = schedule?.courses.length ?? 0;
    return courseCount > 0 && courseCount < minimumCourseSignals;
  });

  return {
    officialDepartmentCount: inhaOfficialSugangDepartments.length,
    matchedAdmissionDepartmentCount: matchedDepartments.length,
    courseBackedAdmissionDepartmentCount: courseBackedDepartments.length,
    partialAdmissionDepartmentCount: partialDepartments.length,
    courseBackedAdmissionDepartments: courseBackedDepartments.map(
      ({ department }) => department,
    ),
    partialAdmissionDepartments: partialDepartments.map(({ department }) => department),
    missingAdmissionDepartments: admissionDepartments.filter(
      (department) => !findInhaOfficialSugangDepartment(department),
    ),
  };
}

function normalizeDepartmentName(department: string) {
  return department.replace(/\s+/g, "").trim();
}
