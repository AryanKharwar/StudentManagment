package com.example.crudoperation.config;

import com.example.crudoperation.repository.AdminRepo;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
public class SecurityConfig {

    // BCrypt turns a password into a one-way hash (it cannot be reversed).
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Tells Spring Security HOW to find an admin: look up the Admin ID in the admin table.
    // Having this bean is also what removes the "Using generated security password" message,
    // because Spring Boot only creates its temporary default user when no user source exists.
    @Bean
    public UserDetailsService userDetailsService(AdminRepo adminRepo) {
        return username -> adminRepo.findByUsername(username)
                .filter(admin -> admin.getPassword() != null)
                .map(admin -> User.withUsername(admin.getUsername())
                        .password(admin.getPassword())      // the stored BCrypt hash
                        .roles("ADMIN")
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found"));
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // CSRF protection: every POST must carry a secret token that only pages from this
        // site can read. The token is kept in the XSRF-TOKEN cookie; csrf.js sends it back.
        CookieCsrfTokenRepository csrfRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        CsrfTokenRequestAttributeHandler csrfHandler = new CsrfTokenRequestAttributeHandler();

        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfRepository)
                        .csrfTokenRequestHandler(csrfHandler))
                .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)

                .authorizeHttpRequests(auth -> auth
                        // PUBLIC: home, register, login, student search (read-only), styles, scripts
                        .requestMatchers("/", "/index.html",
                                "/admin-register.html", "/adimin-login.html",
                                "/searchstudent.html", "/searchstudent",
                                "/registeradmin", "/adminlogin",
                                "/*.css", "/csrf.js", "/favicon.ico", "/error").permitAll()
                        // EVERYTHING ELSE (dashboard, add/update/delete/view-all) needs a logged-in admin
                        .anyRequest().hasRole("ADMIN"))

                // Server-side session login. The login page's JavaScript posts
                // username + password to /adminlogin and reads the plain-text reply.
                .formLogin(form -> form
                        .loginPage("/adimin-login.html")       // not-logged-in visitors are sent here
                        .loginProcessingUrl("/adminlogin")
                        .successHandler((request, response, authentication) ->
                                writeText(response, HttpServletResponse.SC_OK, "Login successful"))
                        .failureHandler((request, response, exception) -> {
                            if (exception instanceof InternalAuthenticationServiceException) {
                                // e.g. database not reachable - not the user's fault
                                writeText(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                                        "Server problem while logging in. Please try again.");
                            } else {
                                writeText(response, HttpServletResponse.SC_UNAUTHORIZED,
                                        "Invalid Admin ID or Password");
                            }
                        })
                        .permitAll())

                .logout(logout -> logout
                        .logoutUrl("/adminlogout")             // POST
                        .deleteCookies("JSESSIONID")
                        .logoutSuccessHandler((request, response, authentication) ->
                                writeText(response, HttpServletResponse.SC_OK, "Logged out")))

                // If a POST is rejected (missing/old CSRF token), show a short message, not an HTML page
                .exceptionHandling(ex -> ex.accessDeniedHandler((request, response, accessDeniedException) ->
                        writeText(response, HttpServletResponse.SC_FORBIDDEN,
                                "Request blocked. Please refresh the page and try again.")));

        return http.build();
    }

    private static void writeText(HttpServletResponse response, int status, String text) throws IOException {
        response.setStatus(status);
        response.setContentType("text/plain;charset=UTF-8");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(text);
    }

    // Spring creates the CSRF token lazily. This small filter forces it to be created on every
    // request so the XSRF-TOKEN cookie is always available to csrf.js.
    private static class CsrfCookieFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                        FilterChain filterChain) throws ServletException, IOException {
            CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            if (csrfToken != null) {
                csrfToken.getToken();
            }
            filterChain.doFilter(request, response);
        }
    }
}
