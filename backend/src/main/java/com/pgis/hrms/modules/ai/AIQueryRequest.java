package com.pgis.hrms.modules.ai;

import java.util.List;
import java.util.Map;

public class AIQueryRequest {
    private String query;
    private List<Map<String, Object>> conversationHistory;

    public AIQueryRequest() {
    }

    public AIQueryRequest(String query, List<Map<String, Object>> conversationHistory) {
        this.query = query;
        this.conversationHistory = conversationHistory;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public List<Map<String, Object>> getConversationHistory() {
        return conversationHistory;
    }

    public void setConversationHistory(List<Map<String, Object>> conversationHistory) {
        this.conversationHistory = conversationHistory;
    }
}
