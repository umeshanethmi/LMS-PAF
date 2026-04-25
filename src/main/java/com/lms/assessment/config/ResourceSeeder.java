package com.lms.assessment.config;

import com.lms.assessment.model.Resource;
import com.lms.assessment.model.enums.ResourceStatus;
import com.lms.assessment.model.enums.ResourceType;
import com.lms.assessment.repository.resource.ResourceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalTime;
import java.util.List;

@Configuration
@Slf4j
public class ResourceSeeder {

    @Bean
    CommandLineRunner seedResources(ResourceRepository repository) {
        return args -> {
            if (repository.count() > 0) {
                log.info("Resource collection already populated ({} docs); skipping seed.",
                        repository.count());
                return;
            }

            List<Resource> seed = List.of(
                    Resource.builder()
                            .name("Lecture Hall A")
                            .type(ResourceType.LECTURE_HALL)
                            .capacity(250)
                            .location("New Building, Level 3")
                            .description("Tiered lecture hall with overhead projector and PA system.")
                            .status(ResourceStatus.ACTIVE)
                            .availabilityStart(LocalTime.of(8, 0))
                            .availabilityEnd(LocalTime.of(18, 0))
                            .availableDays("MON,TUE,WED,THU,FRI")
                            .build(),
                    Resource.builder()
                            .name("Lecture Hall B")
                            .type(ResourceType.LECTURE_HALL)
                            .capacity(180)
                            .location("Main Building, Level 2")
                            .description("Standard lecture hall with projector and whiteboard.")
                            .status(ResourceStatus.ACTIVE)
                            .availabilityStart(LocalTime.of(8, 0))
                            .availabilityEnd(LocalTime.of(20, 0))
                            .availableDays("MON,TUE,WED,THU,FRI,SAT")
                            .build(),
                    Resource.builder()
                            .name("Software Engineering Lab")
                            .type(ResourceType.LAB)
                            .capacity(40)
                            .location("IT Wing, Level 1")
                            .description("40 workstations preinstalled with IDEs and developer tooling.")
                            .status(ResourceStatus.ACTIVE)
                            .availabilityStart(LocalTime.of(8, 0))
                            .availabilityEnd(LocalTime.of(17, 0))
                            .availableDays("MON,TUE,WED,THU,FRI")
                            .build(),
                    Resource.builder()
                            .name("Networking Lab")
                            .type(ResourceType.LAB)
                            .capacity(30)
                            .location("IT Wing, Level 2")
                            .description("Cisco-equipped networking lab with managed switches and routers.")
                            .status(ResourceStatus.ACTIVE)
                            .availabilityStart(LocalTime.of(9, 0))
                            .availabilityEnd(LocalTime.of(17, 0))
                            .availableDays("MON,WED,FRI")
                            .build(),
                    Resource.builder()
                            .name("Faculty Meeting Room")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(12)
                            .location("Admin Block, Level 4")
                            .description("Conference room with video-conferencing setup.")
                            .status(ResourceStatus.ACTIVE)
                            .availabilityStart(LocalTime.of(8, 0))
                            .availabilityEnd(LocalTime.of(18, 0))
                            .availableDays("MON,TUE,WED,THU,FRI")
                            .build(),
                    Resource.builder()
                            .name("4K Projector Unit")
                            .type(ResourceType.EQUIPMENT)
                            .location("AV Storage, Main Building")
                            .description("Portable 4K projector with HDMI/USB-C inputs and tripod stand.")
                            .status(ResourceStatus.ACTIVE)
                            .availabilityStart(LocalTime.of(8, 0))
                            .availabilityEnd(LocalTime.of(20, 0))
                            .availableDays("MON,TUE,WED,THU,FRI,SAT,SUN")
                            .build(),
                    Resource.builder()
                            .name("DSLR Camera Kit")
                            .type(ResourceType.EQUIPMENT)
                            .location("AV Storage, Main Building")
                            .description("Canon DSLR with two lenses, external flash, and tripod.")
                            .status(ResourceStatus.OUT_OF_SERVICE)
                            .availabilityStart(LocalTime.of(9, 0))
                            .availabilityEnd(LocalTime.of(17, 0))
                            .availableDays("MON,TUE,WED,THU,FRI")
                            .build()
            );

            repository.saveAll(seed);
            log.info("Seeded {} resources into the catalogue.", seed.size());
        };
    }
}
