package com.MyProject.MyCloudSpace.controller;

import com.MyProject.MyCloudSpace.io.RagChatRequest;
import com.MyProject.MyCloudSpace.io.RagChatResponse;
import com.MyProject.MyCloudSpace.io.RagIngestionResponse;
import com.MyProject.MyCloudSpace.security.AppUserPrincipal;
import com.MyProject.MyCloudSpace.service.RagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rag")
@RequiredArgsConstructor
public class RagController {

    private final RagService ragService;

    @PostMapping("/ingest/{fileId}")
    public RagIngestionResponse ingestFile(@AuthenticationPrincipal AppUserPrincipal principal,
                                           @PathVariable Long fileId) {
        return ragService.ingestFile(fileId, principal.getId());
    }

    @GetMapping("/ingested")
    public List<Long> ingestedFiles(@AuthenticationPrincipal AppUserPrincipal principal) {
        return ragService.getIngestedFileIds(principal.getId());
    }

    @PostMapping("/chat")
    public RagChatResponse chat(@AuthenticationPrincipal AppUserPrincipal principal,
                                @Valid @RequestBody RagChatRequest request) {
        return ragService.chat(request, principal.getId());
    }

    @DeleteMapping("/conversation")
    public Map<String, String> clearConversation(@AuthenticationPrincipal AppUserPrincipal principal) {
        ragService.clearConversation(principal.getId());
        return Map.of("message", "Conversation history cleared");
    }
}
