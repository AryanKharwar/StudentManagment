package com.example.crudoperation.repository;

import com.example.crudoperation.modal.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepo extends JpaRepository<Admin,Integer> {
    boolean existsByUsername(String username);
    Optional<Admin> findByUsername(String username);
}
