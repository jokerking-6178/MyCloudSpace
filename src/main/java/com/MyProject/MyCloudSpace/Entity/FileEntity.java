package com.MyProject.MyCloudSpace.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "files")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"uploadedBy", "sharedWith"}) // Exclude bidirectional relationships
@EqualsAndHashCode(exclude = {"uploadedBy", "sharedWith"})
public class FileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false, unique = true)
    private String s3Key;

    @Column(nullable = false)
    private String contentType;

    @Column(nullable = false)
    private Long fileSize;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_user_id", nullable = false)
    private UserEntity uploadedBy;

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    private LocalDateTime lastModified;

    private String description;

    private String tags;

    @Column(nullable = false)
    private Boolean isPublic = true;

    @ManyToMany(mappedBy = "sharedFiles")
    private List<UserEntity> sharedWith = new ArrayList<>();
}
