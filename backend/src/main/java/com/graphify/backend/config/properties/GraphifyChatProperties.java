package com.graphify.backend.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "graphify.chat")
public class GraphifyChatProperties {
    private int maxContextChars = 100000;
    private int maxDocumentsPerAnswer = 20;

    public int getMaxContextChars() {
        return maxContextChars;
    }

    public void setMaxContextChars(int maxContextChars) {
        this.maxContextChars = maxContextChars;
    }

    public int getMaxDocumentsPerAnswer() {
        return maxDocumentsPerAnswer;
    }

    public void setMaxDocumentsPerAnswer(int maxDocumentsPerAnswer) {
        this.maxDocumentsPerAnswer = maxDocumentsPerAnswer;
    }
}
