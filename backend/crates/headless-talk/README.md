# Headless Talk Client
Headless Talk Client

## Database
채팅, 채팅방 정보, 유저 정보 저장. SQLite를 사용합니다.

### Migrations
데이터베이스에 변경사항이 있을경우 `migrations` 폴더안에 `v{version}_db.sql` 형식의 파일에 변경사항을 적용하세요. 파일을 생성했을시 `src/lib.rs` 파일 맨위 `MIGRATIONS` 목록 가장 아래에 파일 이름도 추가해주세요.
