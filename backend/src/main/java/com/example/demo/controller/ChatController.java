package com.example.demo.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.AiChatService;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private AiChatService aiChatService;

    // Dùng cho request body
    public static class ChatRequest {
        public Long conversationId;
        public String message;
    }

    @PostMapping("/ask")
    public ResponseEntity<?> askAi(@RequestBody ChatRequest request){
        if (request == null || request.message == null || request.message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Nội dung tin nhắn không được để trống"));
        }

        // Tạm thời gán userId = 1L (User default: admin) để phục vụ test tính năng chat
        Long userId = 1L;

        try {
            var response = aiChatService.chatWithAi(userId, request.conversationId, request.message.trim());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Lỗi xử lý AI: " + e.getMessage()));
        }
    }

}
