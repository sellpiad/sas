# 슬라임으로 살아남기
## Skills
### Programming
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
### Framework
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?&style=for-the-badge&logo=redis&logoColor=white)
![Spring](https://img.shields.io/badge/Spring-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)

## 실행 모습
![slime](https://github.com/sellpiad/sas-server/assets/17512385/beb491f3-c5de-4ee0-b635-a14833ca195a)

[배포 사이트](http://ec2-3-36-112-146.ap-northeast-2.compute.amazonaws.com/)

## 프로젝트 설명
**슬라임으로 살아남기**는 JAVA와 SPRING, 그리고 REDIS 등을 활용해 만든 웹게임입니다. </br>
현재 슬라임은 풀, 물, 불 속성으로 이루어져 서로 상성관계를 이루고 있으며, 같은 타일에서 마주했을 시 상성관계에 따라 불리한 측이 사망합니다.

최초 버전 제작기간 2024.05.14~2024.06.26

## 기능
- 플레이어 슬라임 추가
- 인공지능 슬라임 자동 생성 및 플레이
- 타플레이어와 온라인 플레이 가능

### 제작 및 실행 환경
- JAVA 21
- Redis
- Springboot 3.0
- NodeJS 20.11.0
- Javascript
- Typescript
- HTML
- React

### 설치 및 실행(With Docker)

1. **클론 리포지토리**

    ```bash
    git clone https://github.com/sellpiad/sas.git
    ```
2. **실행**
   ```bash
   cd sas
   docker-compose up --build
   ```
4. localhost:3000 접속 후 플레이.

### 설치(Without Docker)

1. **클론** 리포지토리:

    ```bash
    git clone https://github.com/sellpiad/sas.git
    cd sas
    ```

2. **의존성 설치**:

    Maven을 사용하여 의존성을 설치합니다.

   Windows

    ```bash
    mvnw.cmd clean install
    ```

    Linux

    ```bash
    mvnw clean install 
    ```

3. **Redis 및 mysql 설정**:

    Redis 서버가 로컬에서 실행 중이어야 합니다. 기본 설정은 `localhost:6379`입니다. 필요에 따라 `application.properties` 파일에서 Redis 설정을 변경할 수 있습니다.
    아래는 작성 예시입니다.

    ```properties
    #Spring
    spring.data.redis.host=127.0.0.1
    spring.data.redis.port=6379
    spring.cache.type=redis
    spring.data.redis.repositories.enabled=true

    #Mysql
    spring.datasource.driver-class-name= com.mysql.cj.jdbc.Driver
    spring.datasource.url=jdbc:mysql://localhost:3306/crud?serverTimezone=UTC&characterEncoding=UTF-8
    spring.datasource.username={user id}
    spring.datasource.password={user password}
    spring.jpa.hibernate.ddl-auto=update
    ```
5. **클라이언트 시작**
   
   ```
   cd client
   npm i
   npm start
   ```
6. **서버 구동**

   ```bash
   cd target
   java -jar server-0.0.1-SNAPSHOT.jar
   ```

   혹은 그냥 Run 클릭.

7. localhost:3000 접속 후 플레이.




