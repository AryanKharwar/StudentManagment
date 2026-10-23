package com.example.crudoperation.repository;

import com.example.crudoperation.modal.student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface studentrepo extends JpaRepository<student, Integer> {
}
