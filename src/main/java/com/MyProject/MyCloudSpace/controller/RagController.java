package com.MyProject.MyCloudSpace.controller;

import com.MyProject.MyCloudSpace.io.RagChatRequest;
import com.MyProject.MyCloudSpace.io.RagChatResponse;
import com.MyProject.MyCloudSpace.io.RagIngestionResponse;
import com.MyProject.MyCloudSpace.service.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rag")
@RequiredArgsConstructor
public class RagController {

    private final RagService ragService;

    @PostMapping("/ingest/{fileId}")
    public ResponseEntity<RagIngestionResponse> ingestFile(
            @PathVariable Long fileId,
            @RequestParam String userId) {
        try {
            RagIngestionResponse response = ragService.ingestFile(fileId, userId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(RagIngestionResponse.failure("Rag not properly able to ingest the file" + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(RagIngestionResponse.failure("Ingestion failed due to some technical reasons " + e.getMessage()));
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<RagChatResponse> chat(@RequestBody RagChatRequest request) {
        try {
            RagChatResponse response = ragService.chat(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(RagChatResponse.error("Question mostly not from provided docs " + e.getMessage()));
        }
    }

    @DeleteMapping("/conversation/{userId}")
    public ResponseEntity<String> clearConversation(@PathVariable String userId) {
        ragService.clearConversation(userId);
        return ResponseEntity.ok("Conversation history cleared for user: " + userId);
    }
}
