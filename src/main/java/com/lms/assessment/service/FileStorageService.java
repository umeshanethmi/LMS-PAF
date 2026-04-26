package com.lms.assessment.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeFile(MultipartFile file);

    /**
     * Store a file inside the given subdirectory under the root upload directory.
     * The returned path is relative to the root (e.g. "tickets/uuid.png").
     */
    String storeFile(MultipartFile file, String subdirectory);

    Resource loadFileAsResource(String fileName);

    void deleteFile(String fileName);
}
