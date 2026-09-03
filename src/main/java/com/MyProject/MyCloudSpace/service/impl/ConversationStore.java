package com.MyProject.MyCloudSpace.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class ConversationStore {

    @Value("${rag.conversation.max-messages:20}")
    private int maxMessages;

    @Value("${rag.conversation.ttl-minutes:120}")
    private long ttlMinutes;

    private record Conversation(List<Message> messages, Instant lastUsed) {
    }

    private final Map<String, Conversation> store = new ConcurrentHashMap<>();

    public void addUserMessage(String userId, String text) {
        append(userId, new UserMessage(text));
    }

    public void addAssistantMessage(String userId, String text) {
        append(userId, new AssistantMessage(text));
    }

    private synchronized void append(String userId, Message message) {
        Conversation existing = store.get(userId);
        List<Message> messages = existing == null ? new ArrayList<>() : new ArrayList<>(existing.messages());
        messages.add(message);
        while (messages.size() > maxMessages) {
            messages.remove(0);
        }
        store.put(userId, new Conversation(messages, Instant.now()));
    }

    public synchronized List<Message> getHistory(String userId) {
        Conversation conversation = store.get(userId);
        return conversation == null ? List.of() : Collections.unmodifiableList(new ArrayList<>(conversation.messages()));
    }

    public void clearHistory(String userId) {
        store.remove(userId);
    }

    @Scheduled(fixedRate = 900_000)
    public void evictIdleConversations() {
        Instant cutoff = Instant.now().minus(Duration.ofMinutes(ttlMinutes));
        int before = store.size();
        store.entrySet().removeIf(entry -> entry.getValue().lastUsed().isBefore(cutoff));
        int evicted = before - store.size();
        if (evicted > 0) {
            log.info("Evicted {} idle conversation(s)", evicted);
        }
    }
}
