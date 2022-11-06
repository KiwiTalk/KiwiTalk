# KiwiTalk database
키위톡에서 사용하는 채팅, 채팅방 정보와 채팅방 설정 데이터베이스 구현체. SQLite를 사용합니다.

## Migrations
데이터베이스에 변경사항이 있을경우 `migrations` 폴더안에 `{year}{month}{day}{time_hour}{time_minute}_db.sql` 형식 이름으로 파일을 만들고 변경사항을 추가한 뒤 `src/lib.rs` 파일 맨위 `MIGRATIONS` 목록 가장 아래에 파일 이름을 추가해주세요.

> 한 PR에서 여러 변경사항이 있을경우 새 마이그레이션을 작성하지 말고 기존 마이그레이션 sql과 코드를 수정하시고 날짜를 바꿔주세요.