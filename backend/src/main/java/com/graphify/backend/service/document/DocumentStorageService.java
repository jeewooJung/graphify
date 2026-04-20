package com.graphify.backend.service.document;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class DocumentStorageService {

    @Value("${graphify.storage.root}")
    private String root;

    public String store(Long projectId, MultipartFile file) throws IOException {
        String sanitizedFilename = sanitize(file.getOriginalFilename());
        Path storagePath = Paths.get(root, "documents", String.valueOf(projectId), UUID.randomUUID() + "-" + sanitizedFilename);
        Files.createDirectories(storagePath.getParent());
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, storagePath, StandardCopyOption.REPLACE_EXISTING);
        }
        return storagePath.toString().replace('\\', '/');
    }

    public InputStream read(String storagePath) throws IOException {
        return Files.newInputStream(Paths.get(storagePath));
    }

    public void delete(String storagePath) throws IOException {
        if (storagePath == null || storagePath.isBlank()) {
            return;
        }

        try {
            Files.delete(Paths.get(storagePath));
        } catch (NoSuchFileException ignored) {
            // Best-effort cleanup.
        }
    }

    private String sanitize(String originalFilename) {
        String filename = originalFilename == null || originalFilename.isBlank() ? "upload.bin" : originalFilename;
        filename = filename.replace('\\', '/');
        int lastSeparator = filename.lastIndexOf('/');
        if (lastSeparator >= 0) {
            filename = filename.substring(lastSeparator + 1);
        }

        StringBuilder sanitized = new StringBuilder();
        for (char character : filename.toCharArray()) {
            if (Character.isLetterOrDigit(character) || character == '.' || character == '-' || character == '_') {
                sanitized.append(character);
            } else if (!Character.isISOControl(character)) {
                sanitized.append('_');
            }
        }

        String value = sanitized.toString().replaceAll("_+", "_");
        return value.isBlank() ? "upload.bin" : value;
    }
}
