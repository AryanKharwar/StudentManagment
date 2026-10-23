package com.example.crudoperation.Controller;

import com.example.crudoperation.modal.Admin;
import com.example.crudoperation.repository.AdminRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

// Login and logout are handled by Spring Security (see config/SecurityConfig.java).
// This controller only handles admin registration.
@RestController
public class AdminController {

    private AdminRepo adminRepo;
    private PasswordEncoder passwordEncoder;

    // Set ADMIN_REGISTRATION_OPEN=false (environment variable) to close public registration
    // once your admin account(s) exist. Default is true.
    @Value("${app.admin.registration-open:true}")
    private boolean registrationOpen;

    public AdminController(AdminRepo adminRepo, PasswordEncoder passwordEncoder) {
        this.adminRepo = adminRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/registeradmin")
    public ResponseEntity<String> registerAdmin(@RequestParam String adminId,
                                                @RequestParam String password,
                                                @RequestParam(required = false) String phone) {

        if (!registrationOpen) {
            return reply(HttpStatus.FORBIDDEN, "Admin registration is closed");
        }

        adminId = adminId == null ? "" : adminId.trim();
        if (adminId.isEmpty()) {
            return reply(HttpStatus.BAD_REQUEST, "Please enter Admin ID");
        }
        if (adminId.length() > 50) {
            return reply(HttpStatus.BAD_REQUEST, "Admin ID must be at most 50 characters");
        }

        // Same minimum length rule as the registration page (8 characters).
        // BCrypt only supports up to 72 bytes, so we also set a maximum.
        if (password == null || password.length() < 8) {
            return reply(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            return reply(HttpStatus.BAD_REQUEST, "Password is too long (maximum 72 characters)");
        }

        // Phone is optional. If given, it must be exactly 10 digits.
        phone = phone == null ? "" : phone.trim();
        if (!phone.isEmpty() && !phone.matches("\\d{10}")) {
            return reply(HttpStatus.BAD_REQUEST, "Phone number must be 10 digits");
        }

        if (adminRepo.existsByUsername(adminId)) {
            return reply(HttpStatus.CONFLICT, "Admin ID already exists");
        }

        Admin admin = new Admin();
        admin.setPhone(phone.isEmpty() ? null : phone);
        admin.setUsername(adminId);
        // Only the BCrypt hash is stored, never the real password
        admin.setPassword(passwordEncoder.encode(password));
        // 'verified' used to mean "phone verified by OTP". OTP is removed, so it stays false.
        // (The column is kept so your existing database table still matches.)
        admin.setVerified(false);

        adminRepo.save(admin);

        return reply(HttpStatus.OK, "Admin registered successfully");
    }

    private ResponseEntity<String> reply(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(message);
    }
}
