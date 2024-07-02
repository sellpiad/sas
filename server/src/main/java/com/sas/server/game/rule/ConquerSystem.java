package com.sas.server.game.rule;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ConquerSystem {

        public void notifyConquest(String sessionId, String cubeId, int totalCube, long seconds,
                        Runnable afterConquered) {

                /*
                 * scheduler.schedule(() -> {
                 * 
                 * UserEntity user = userSerivce.findBySessionId(sessionId);
                 * 
                 * Set<String> conqueredCubes = user.conqueredCubes;
                 * 
                 * String cubePos = cubeService.getCubeNickname(cubeId);
                 * Set<String> clickable = cubeService.getClickableCubes(cubeId);
                 * 
                 * conqueredCubes.add(cubePos);
                 * 
                 * messageTemplate.convertAndSendToUser(user.sessionId,
                 * "/queue/cube/conqueredCubes", conqueredCubes,
                 * msgBroker.createHeaders(user.sessionId));
                 * messageTemplate.convertAndSendToUser(user.sessionId, "/queue/cube/clickable",
                 * clickable,
                 * msgBroker.createHeaders(user.sessionId));
                 * 
                 * if (conqueredCubes.size() == totalCube) {
                 * 
                 * user =
                 * user.toBuilder().state("CONQUEROR").conqueredTime(LocalDateTime.now()).build(
                 * );
                 * 
                 * userSerivce.save(user);
                 * rankerService.save(user);
                 * 
                 * RankerDTO conqueror = RankerDTO.builder()
                 * .nickname(user.nickname)
                 * .life(user.life)
                 * .conqueredTime(user.conqueredTime)
                 * .build();
                 * 
                 * messageTemplate.convertAndSendToUser(user.sessionId, "/queue/game/complete",
                 * conqueror,
                 * msgBroker.createHeaders(user.sessionId));
                 * afterConquered.run();
                 * 
                 * } else {
                 * playerService.update(
                 * user.toBuilder().life(user.life +
                 * 1).movable(true).conqueredCubes(conqueredCubes).build());
                 * 
                 * messageTemplate.convertAndSendToUser(user.sessionId, "/queue/player/movable",
                 * true,
                 * msgBroker.createHeaders(user.sessionId));
                 * }
                 * 
                 * }, seconds, TimeUnit.SECONDS);
                 */

        }
}
