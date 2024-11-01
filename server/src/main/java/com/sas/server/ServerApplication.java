package com.sas.server;

import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.redis.connection.DefaultStringRedisConnection;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.sas.server.custom.dataType.MessageType;
import com.sas.server.logic.MessagePublisher;
import com.sas.server.logic.TimebombSystem;
import com.sas.server.service.admin.LogService;
import com.sas.server.service.ai.AIService;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.member.MemberService;
import com.sas.server.service.player.PlayerService;
import com.sas.server.service.player.PlaylogService;
import com.sas.server.service.ranker.RankerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@SpringBootApplication
@EnableScheduling
@EnableJpaRepositories(basePackages = "com.sas.server.repository.jpa")
@EnableRedisRepositories(basePackages = "com.sas.server.repository.redis")
@EnableRetry
@Slf4j
@RequiredArgsConstructor
public class ServerApplication {

	private final ScheduledExecutorService scheduler;

	private final CubeService cubeService;
	private final MemberService memberService;
	private final PlayerService playerService;
	private final RankerService rankerService;
	private final PlaylogService playlogService;
	private final LogService logService;
	private final AIService aiService;

	private final StringRedisTemplate redisTemplate;

	private final MessagePublisher messagePublisher;

	private final TimebombSystem timebombSystem;

	@Value("${server.account.admin.id}")
	private String adminId;

	@Value("${server.account.admin.pwd}")
	private String adminPwd;

	@Value("${app.version}")
	private String version;

	public static void main(String[] args) {
		SpringApplication.run(ServerApplication.class, args);
	}

	@EventListener
	public void onApplicationEvent(ApplicationReadyEvent event) {

		log.info("1. Application initialized!");

		clear();
		setting();

		log.info("4. 슬라임으로 살아남기(v{}) start!", version);

	}

	private void clear() {

		log.info("2. Clear previous game info.");

		RedisConnection connection = redisTemplate.getConnectionFactory().getConnection();
		RedisSerializer redisSerializer = redisTemplate.getKeySerializer();
		DefaultStringRedisConnection defaultStringRedisConnection = new DefaultStringRedisConnection(connection,
				redisSerializer);
		defaultStringRedisConnection.flushAll();
	}

	private void setting() {

		log.info("3. Game Setting Progress.");

		// 게임 맵 생성
		cubeService.createCubeSet(20);

		// 플레이어 관련 변동이 일어날 때 알림 받는 리스트.
		playerService.registerSub(rankerService); // 랭킹 업데이트.
		playerService.registerSub(messagePublisher); // 메세지 전송.
		playerService.registerSub(playlogService); // 플레이 로그 기록.
		playerService.registerSub(logService); // 일반 로그 기록.
		playerService.registerSub(timebombSystem); // 시한폭탄 관련 로직 등록.
		playerService.registerSub(aiService); // AI 관련 로직 등록.

		// 시한폭탄 관련 변동이 일어날 때 알림 받는 리스트.
		timebombSystem.registerSub(playerService);

		// 큐브 관련 이벤트 일어날 때 알림 받는 리스트.
		cubeService.registerSub(messagePublisher);

		// 게임 대기큐 실행
		int max = cubeService.findAll().size();
		scheduler.scheduleWithFixedDelay(() -> {

			Boolean isScanning = playerService.scanQueue(max);

			messagePublisher.queuePublish("admin", MessageType.QUEUE_SCANNING_PLAYER_STATE, isScanning);

		}, 0, 1000, TimeUnit.MILLISECONDS);

	}

}
