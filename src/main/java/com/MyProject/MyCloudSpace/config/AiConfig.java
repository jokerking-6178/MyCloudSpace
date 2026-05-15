package com.MyProject.MyCloudSpace.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Value("${rag.chunk-size:1000}")
    private int chunkSize;

    @Value("${rag.chunk-overlap:200}")
    private int chunkOverlap;

    @Value("${spring.ai.vectorstore.pgvector.dimensions:768}")
    private int dimensions;

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder.build();
    }

    @Bean
    public TokenTextSplitter tokenTextSplitter() {
        return new TokenTextSplitter(chunkSize, chunkOverlap, 5, 10000, true);
    }
}
