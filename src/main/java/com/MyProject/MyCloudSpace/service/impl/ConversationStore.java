package com.MyProject.MyCloudSpace.service.impl;

import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ConversationStore {

    private final Map<String, List<Message>> store = new ConcurrentHashMap<>();

    public void addUserMessage(String userId, String text) {
        getHistory(userId).add(new UserMessage(text));
    }

    public void addAssistantMessage(String userId, String text) {
        getHistory(userId).add(new AssistantMessage(text));
    }

    public List<Message> getHistory(String userId) {
        return store.computeIfAbsent(userId, k -> new ArrayList<>());
    }

    public void clearHistory(String userId) {
        store.remove(userId);
    }

    public int activeSessionCount() {
        return store.size();
    }
}
