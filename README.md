# 슬라임으로 살아남기
![](https://img.shields.io/badge/redis-%23DD0031.svg?&style=for-the-badge&logo=redis&logoColor=white)
![](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![](https://img.shields.io/badge/Spring-6DB33F?style=for-the-badge&logo=spring&logoColor=white)

슬라임으로 살아남기

![slime](https://github.com/sellpiad/sas-server/assets/17512385/beb491f3-c5de-4ee0-b635-a14833ca195a)

## 프로젝트 설명
**슬라임으로 살아남기**는 JAVA와 SPRING, 그리고 REDIS 등을 활용해 만든 웹게임입니다.

## 기능
- 플레이어 슬라임 추가
- 인공지능 슬라임 자동 생성 및 플레이

### 실행 환경
- JAVA 21
- Redis
- Springboot 3.0
- NodeJS 20.11.0
- Javascript
- React

### 설치

1. **클론** 레포지토리:

    ```bash
    git clone https://github.com/your-username/slime-survival-server.git
    cd slime-survival-server
    ```

2. **의존성 설치**:

    Maven을 사용하여 의존성을 설치합니다.

    ```bash
    mvn clean install
    ```

3. **Redis 설정**:

    Redis 서버가 로컬에서 실행 중이어야 합니다. 기본 설정은 `localhost:6379`입니다. 필요에 따라 `application.properties` 파일에서 Redis 설정을 변경할 수 있습니다.

    ```properties
    spring.redis.host=localhost
    spring.redis.port=6379
    ```
4. **클라이언트 설정**

   ```
   cd client
   npm i
   ```




