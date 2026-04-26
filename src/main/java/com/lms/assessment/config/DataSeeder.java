package com.lms.assessment.config;

import com.lms.assessment.model.campus.CampusResource;
import com.lms.assessment.repository.campus.CampusResourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final CampusResourceRepository repo;

    public DataSeeder(CampusResourceRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            List<CampusResource> toSave = new ArrayList<>();
            LocalDateTime now = LocalDateTime.now();

            for (char block : new char[]{'A', 'B'}) {
                for (int floor = 1; floor <= 7; floor++) {
                    for (int room = 1; room <= 6; room++) {
                        String code = String.valueOf(block) + floor + "0" + room;
                        if (repo.existsByCode(code)) continue;
                        boolean isHall = room <= 2;
                        CampusResource.ResourceType type = isHall ? CampusResource.ResourceType.HALL : CampusResource.ResourceType.LAB;
                        toSave.add(CampusResource.builder()
                                .code(code)
                                .name(isHall ? "Lecture Hall " + code : "Lab " + code)
                                .type(type)
                                .capacity(isHall ? 60 : 25)
                                .floor(floor)
                                .description((isHall ? "Lecture hall" : "Lab") + " in Main Building Block " + block + ", Floor " + floor)
                                .active(true).createdAt(now).updatedAt(now).build());
                    }
                }
            }

            for (char block : new char[]{'F', 'G'}) {
                for (int floor = 1; floor <= 14; floor++) {
                    for (int room = 1; room <= 8; room++) {
                        String code = String.valueOf(block) + floor + "0" + room;
                        if (repo.existsByCode(code)) continue;
                        boolean isHall = room <= 3;
                        CampusResource.ResourceType type = isHall ? CampusResource.ResourceType.HALL : CampusResource.ResourceType.LAB;
                        toSave.add(CampusResource.builder()
                                .code(code)
                                .name(isHall ? "Lecture Hall " + code : "Lab " + code)
                                .type(type)
                                .capacity(isHall ? 80 : 30)
                                .floor(floor)
                                .description((isHall ? "Lecture hall" : "Lab") + " in New Building Block " + block + ", Floor " + floor)
                                .active(true).createdAt(now).updatedAt(now).build());
                    }
                }
            }

            // Equipment — bookable items that aren't tied to a specific room.
            String[][] equipment = {
                {"EQ-PROJ-01", "Portable Projector 01", "Full-HD short-throw projector with HDMI + USB-C inputs."},
                {"EQ-CAM-01",  "Video Camera Kit 01",   "DSLR + tripod + lavalier mic, suitable for lecture recording."},
                {"EQ-MIC-01",  "Wireless Microphone Set", "Two-channel wireless mic kit with receiver and stand."},
                {"EQ-LAPTOP-01", "Loaner Laptop 01",    "Windows 11 laptop pre-installed with VS Code, IntelliJ and Docker."},
                {"EQ-VR-01",   "VR Headset Set",        "Meta Quest 3 + controllers + charging dock for AR/VR labs."},
            };
            for (String[] e : equipment) {
                String code = e[0];
                if (repo.existsByCode(code)) continue;
                toSave.add(CampusResource.builder()
                        .code(code)
                        .name(e[1])
                        .type(CampusResource.ResourceType.EQUIPMENT)
                        .capacity(1)
                        .description(e[2])
                        .active(true).createdAt(now).updatedAt(now).build());
            }

            if (!toSave.isEmpty()) {
                repo.saveAll(toSave);
                long halls = toSave.stream().filter(r -> r.getType() == CampusResource.ResourceType.HALL).count();
                long labs = toSave.stream().filter(r -> r.getType() == CampusResource.ResourceType.LAB).count();
                long equipmentCount = toSave.stream().filter(r -> r.getType() == CampusResource.ResourceType.EQUIPMENT).count();
                log.info("DataSeeder: inserted {} resources ({} halls, {} labs, {} equipment)",
                        toSave.size(), halls, labs, equipmentCount);
            } else {
                log.info("DataSeeder: all campus resources already present - skipping.");
            }
        } catch (Exception ex) {
            // Do not fail application startup for transient database/network issues.
            log.warn("DataSeeder skipped due to database connectivity issue: {}", ex.getMessage());
        }
    }
}