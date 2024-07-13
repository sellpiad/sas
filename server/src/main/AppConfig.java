import org.springframework.context.annotation.Configuration;
import org.springframework.retry.annotation.EnableRetry;

import com.votewar.server.game.rule.MovementSystem;

@Configuration
public class AppConfig {

    private final MovementSystem movementSystem;

    public AppConfig(MovementSystem movementSystem) {
        this.movementSystem = movementSystem;
    }

    @Bean
    @Scope("prototype")
    public AISlime aiSlime(String sessionId) {
        return new AISlime(sessionId, movementSystem);
    }
}
