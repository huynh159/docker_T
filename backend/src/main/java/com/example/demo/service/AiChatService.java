package com.example.demo.service;

import com.example.demo.entity.ChatMessage;
import com.example.demo.entity.Conversation;
import com.example.demo.entity.User;
import com.example.demo.repository.ChatMessageRepository;
import com.example.demo.repository.ConversationRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiChatService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${gemini.api-key}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Gọi Google Gemini API trực tiếp qua REST (không cần GCP project hay ADC)
     * Thử model được cấu hình (gemini-2.5-flash), nếu Google báo deprecated/unavailable thì tự động fallback.
     */
    private String callGeminiApi(String userMessage) {
        List<String> modelsToTry = new java.util.ArrayList<>();
        if (geminiModel != null && !geminiModel.isBlank()) {
            modelsToTry.add(geminiModel.trim());
        }
        for (String fallback : List.of("gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash")) {
            if (!modelsToTry.contains(fallback)) {
                modelsToTry.add(fallback);
            }
        }

        Exception lastException = null;
        for (String model : modelsToTry) {
            try {
                return executeGeminiRequest(model, userMessage);
            } catch (Exception e) {
                lastException = e;
                System.err.println("Gemini model [" + model + "] failed: " + e.getMessage() + ". Trying next model...");
            }
        }
        if (lastException instanceof RuntimeException re) {
            throw re;
        }
        throw new RuntimeException("All Gemini models failed", lastException);
    }

    private String executeGeminiRequest(String model, String userMessage) {
        String url = String.format(
            "https://generativelanguage.googleapis.com/v1/models/%s:generateContent?key=%s",
            model, geminiApiKey
        );

        Map<String, Object> part = Map.of("text", userMessage);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> requestBody = Map.of("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

        Map<String, Object> body = response.getBody();
        if (body != null && body.containsKey("candidates")) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
            if (!candidates.isEmpty()) {
                Map<String, Object> candidateContent = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) candidateContent.get("parts");
                if (!parts.isEmpty()) {
                    return (String) parts.get(0).get("text");
                }
            }
        }
        return "Gemini AI không trả về kết quả.";
    }

    public Map<String, Object> chatWithAi(Long userId, Long conversationId, String userMessage) {
        // 1. Tìm hoặc tạo Conversation mới
        Conversation conversation;
        if (conversationId == null) {
            User user = userRepository.findById(userId).orElseGet(() -> {
                User defaultUser = new User();
                defaultUser.setUsername("admin");
                defaultUser.setPassword("123456");
                defaultUser.setRole("ROLE_ADMIN");
                return userRepository.save(defaultUser);
            });
            conversation = new Conversation();
            conversation.setUser(user);
            conversation.setTitle(userMessage.substring(0, Math.min(userMessage.length(), 25))); 
            conversation = conversationRepository.save(conversation);
        } else {
            conversation = conversationRepository.findById(conversationId).orElseThrow(() -> new RuntimeException("Conversation not found"));
        }

        // 2. Lưu tin nhắn của User vào DB
        ChatMessage userChat = new ChatMessage();
        userChat.setConversation(conversation);
        userChat.setSenderRole("USER");
        userChat.setContent(userMessage);
        chatMessageRepository.save(userChat);

        // 3. GỌI GEMINI AI qua REST API
        String aiResponse;
        try {
            aiResponse = callGeminiApi(userMessage);
        } catch (Exception e) {
            e.printStackTrace();
            aiResponse = "⚠️ Lỗi kết nối Gemini AI: " + e.getMessage()
                       + "\n\nVui lòng kiểm tra API key trong application.properties.";
        }

        // 4. Lưu tin nhắn AI vào DB
        ChatMessage aiChat = new ChatMessage();
        aiChat.setConversation(conversation);
        aiChat.setSenderRole("AI");
        aiChat.setContent(aiResponse);
        chatMessageRepository.save(aiChat);

        Map<String, Object> result = new HashMap<>();
        result.put("conversationId", conversation.getId());
        result.put("reply", aiResponse);
        return result;
    }
}
