package com.MyProject.MyCloudSpace.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Value("${rag.chunk-size:800}")
    private int chunkSize;

    @Value("${rag.min-chunk-size-chars:350}")
    private int minChunkSizeChars;

    @Value("${rag.min-chunk-length-to-embed:5}")
    private int minChunkLengthToEmbed;

    @Value("${rag.max-chunks:10000}")
    private int maxChunks;

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder.build();
    }

    @Bean
    public TokenTextSplitter tokenTextSplitter() {
        return new TokenTextSplitter(chunkSize, minChunkSizeChars, minChunkLengthToEmbed, maxChunks, true);
    }
}
