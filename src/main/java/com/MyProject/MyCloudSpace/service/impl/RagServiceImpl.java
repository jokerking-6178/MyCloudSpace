package com.MyProject.MyCloudSpace.service.impl;


import com.MyProject.MyCloudSpace.Entity.FileEntity;
import com.MyProject.MyCloudSpace.io.RagChatRequest;
import com.MyProject.MyCloudSpace.io.RagChatResponse;
import com.MyProject.MyCloudSpace.io.RagIngestionResponse;
import com.MyProject.MyCloudSpace.repository.FileRepository;
import com.MyProject.MyCloudSpace.service.RagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RagServiceImpl implements RagService {

    private final FileRepository fileRepository;
    private final S3Service s3Service;
    private final VectorStore vectorStore;
    private final ChatClient chatClient;
    private final TokenTextSplitter tokenTextSplitter;
    private final ConversationStore conversationStore;


    public RagIngestionResponse ingestFile(Long fileId, String userId) {
        log.info("Ingestion requested: fileId={} userId={}", fileId, userId);

        FileEntity fileEntity = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found with id: " + fileId));
        if (!fileEntity.getUploadedBy().getId().equals(userId)) {
            throw new IllegalArgumentException("permission to ingest this file is Denied.");
        }

        log.info("Downloading from S3: {}", fileEntity.getS3Key());
        byte[] fileBytes = s3Service.downloadFile(fileEntity.getS3Key());

        Resource resource = new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return fileEntity.getFileName();
            }
        };
        List<Document> rawDocs = new TikaDocumentReader(resource).get();
        log.info("Tika parsed {} document from '{}'",
                rawDocs.size(), fileEntity.getFileName());

        List<Document> taggedDocs = rawDocs.stream().map(doc -> {
            Map<String, Object> meta = new HashMap<>(doc.getMetadata());
            meta.put("userId", userId);
            meta.put("fileId", String.valueOf(fileId));
            meta.put("fileName", fileEntity.getFileName());
            return new Document(doc.getText(), meta);
        }).toList();

        List<Document> chunks = tokenTextSplitter.apply(taggedDocs);
        log.info("Split into {} chunks", chunks.size());

        vectorStore.add(chunks);
        log.info("Stored {} vectors for fileId={} userId={}", chunks.size(), fileId, userId);

        return RagIngestionResponse.success(
                fileEntity.getFileName(),
                fileId,
                chunks.size());
    }

    public RagChatResponse chat(RagChatRequest request) {
        String userId   = request.getUserId();
        String question = request.getQuestion();
        int    topK     = request.getTopK() != null ? request.getTopK() : 5;

        FilterExpressionBuilder b = new FilterExpressionBuilder();
        FilterExpressionBuilder.Op filter = b.eq("userId", userId);

        if (request.getFileId() != null) {
            filter = b.and(filter, b.eq("fileId", String.valueOf(request.getFileId())));
        }

        List<Document> relevant = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(question)
                        .topK(topK)
                        .filterExpression(filter.build())
                        .build());

        log.info("Retrieved {} chunks for userId={}", relevant.size(), userId);

        if (relevant.isEmpty()) {
            String noCtx = "Similarity search found N0 similarity between your question and documents Information." +
                    "Kindly Only ask relevant Question related to Docs.";
            return RagChatResponse.builder()
                    .answer(noCtx)
                    .sources(List.of())
                    .build();
        }

        String context = buildContext(relevant);
        List<Message> history = conversationStore.getHistory(userId);
        conversationStore.addUserMessage(userId, question);

        String userPrompt = """
                Context from your documents:
                %s
 
                Question: %s
                """.formatted(context, question);

        String answer = chatClient.prompt()
                .system("""
                        You are a helpful assistant answering questions about the user's
                        uploaded documents. Base your answers strictly on the provided context.
                        If the context does not contain enough information, say so clearly.
                        Be concise and cite the relevant part of the document when possible.
                        """)
                .messages(history)
                .user(userPrompt)
                .call()
                .content();

        conversationStore.addAssistantMessage(userId, answer);

        List<RagChatResponse.SourceChunk> sources = relevant.stream()
                .map(doc -> RagChatResponse.SourceChunk.builder()
                        .content(doc.getText())
                        .fileName((String) doc.getMetadata().getOrDefault("fileName", "unknown"))
                        .fileId(doc.getMetadata().getOrDefault("fileId", "").toString())
                        .build())
                .toList();

        return RagChatResponse.builder()
                .answer(answer)
                .sources(sources)
                .build();
    }

    public void clearConversation(String userId) {
        conversationStore.clearHistory(userId);
        log.info("Cleared conversation history for userId={}", userId);
    }

    private String buildContext(List<Document> docs) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < docs.size(); i++) {
            sb.append("--- Chunk ").append(i + 1).append(" ---\n");
            sb.append(docs.get(i).getText()).append("\n\n");
        }
        return sb.toString().trim();
    }
}
