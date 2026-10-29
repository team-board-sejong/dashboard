# 부서 대시보드

구글 캘린더 일정·마감 D-day·할 일·날씨·뉴스를 한 화면에 보여 주는 대시보드입니다.

- 화면: `index.html` (GitHub Pages로 공개)
- 일정: 접속한 사람이 구글로 로그인하면, 그 사람 권한으로 구글 캘린더 API에서 직접 읽습니다. 저장소에는 일정이 저장되지 않습니다.
- 뉴스: `.github/workflows/news.yml`이 30분마다 `scripts/fetch-news.mjs`를 실행해 `news.json`을 갱신합니다.
- 날씨: open-meteo에서 직접 받습니다.

## 바꿀 곳
- `index.html` 위쪽 `AUTH` — 구글 OAuth 클라이언트 ID, 부서 캘린더 ID
- `index.html`의 `CONFIG` — 지역, 마감 단어, 근무시간 화면 끄기 등
- `scripts/fetch-news.mjs`의 `FEEDS` — 뉴스 검색어
