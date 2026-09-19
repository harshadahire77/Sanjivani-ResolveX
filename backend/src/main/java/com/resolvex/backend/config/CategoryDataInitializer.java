package com.resolvex.backend.config;

import com.resolvex.backend.model.ComplaintCategory;
import com.resolvex.backend.repository.ComplaintCategoryRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class CategoryDataInitializer {

    @Bean
    CommandLineRunner initializeComplaintCategories(
            ComplaintCategoryRepository categoryRepository
    ) {

        return args -> {

            List<CategorySeed> defaultCategories =
                    List.of(

                            new CategorySeed(
                                    "IT / Network",
                                    "Wi-Fi, internet, computer systems and network issues."
                            ),

                            new CategorySeed(
                                    "Electrical",
                                    "Lights, fans, switches and other electrical problems."
                            ),

                            new CategorySeed(
                                    "Plumbing",
                                    "Pipes, taps, leakage and washroom plumbing problems."
                            ),

                            new CategorySeed(
                                    "Cleanliness",
                                    "Cleaning, waste disposal and hygiene related issues."
                            ),

                            new CategorySeed(
                                    "Hostel",
                                    "Hostel rooms, facilities and accommodation related complaints."
                            ),

                            new CategorySeed(
                                    "Classroom",
                                    "Classroom furniture, equipment and facility issues."
                            ),

                            new CategorySeed(
                                    "Infrastructure",
                                    "Building, road, furniture and campus infrastructure problems."
                            ),

                            new CategorySeed(
                                    "Water Supply",
                                    "Drinking water and campus water supply problems."
                            ),

                            new CategorySeed(
                                    "Security",
                                    "Campus security, access and safety related issues."
                            ),

                            new CategorySeed(
                                    "Other",
                                    "Complaints that do not belong to another available category."
                            )
                    );

            for (
                    CategorySeed seed :
                    defaultCategories
            ) {

                if (
                        !categoryRepository
                                .existsByNameIgnoreCase(
                                        seed.name()
                                )
                ) {

                    ComplaintCategory category =
                            new ComplaintCategory();

                    category.setName(
                            seed.name()
                    );

                    category.setDescription(
                            seed.description()
                    );

                    category.setActive(
                            true
                    );

                    categoryRepository.save(
                            category
                    );
                }
            }
        };
    }

    private record CategorySeed(
            String name,
            String description
    ) {
    }
}