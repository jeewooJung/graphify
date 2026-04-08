package com.graphify.backend.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.graphify.backend.entity.User;
import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {
    private final Long id;
    private final String username;
    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(User user) {
        // Access Lombok-generated getters (or use reflection as fallback)
        this.id = getId(user);
        this.username = getUsername(user);
        this.email = getEmail(user);
        this.password = getPassword(user);
        this.authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + getRole(user).toString())
        );
    }

    private Long getId(User user) {
        try {
            return (Long) user.getClass().getMethod("getId").invoke(user);
        } catch (Exception e) {
            // Fallback: access field directly using reflection
            try {
                java.lang.reflect.Field field = user.getClass().getDeclaredField("id");
                field.setAccessible(true);
                return (Long) field.get(user);
            } catch (Exception ex) {
                throw new RuntimeException("Cannot get id from User", ex);
            }
        }
    }

    private String getUsername(User user) {
        try {
            return (String) user.getClass().getMethod("getUsername").invoke(user);
        } catch (Exception e) {
            try {
                java.lang.reflect.Field field = user.getClass().getDeclaredField("username");
                field.setAccessible(true);
                return (String) field.get(user);
            } catch (Exception ex) {
                throw new RuntimeException("Cannot get username from User", ex);
            }
        }
    }

    private String getEmail(User user) {
        try {
            return (String) user.getClass().getMethod("getEmail").invoke(user);
        } catch (Exception e) {
            try {
                java.lang.reflect.Field field = user.getClass().getDeclaredField("email");
                field.setAccessible(true);
                return (String) field.get(user);
            } catch (Exception ex) {
                throw new RuntimeException("Cannot get email from User", ex);
            }
        }
    }

    private String getPassword(User user) {
        try {
            return (String) user.getClass().getMethod("getPasswordHash").invoke(user);
        } catch (Exception e) {
            try {
                java.lang.reflect.Field field = user.getClass().getDeclaredField("passwordHash");
                field.setAccessible(true);
                return (String) field.get(user);
            } catch (Exception ex) {
                throw new RuntimeException("Cannot get passwordHash from User", ex);
            }
        }
    }

    private Object getRole(User user) {
        try {
            return user.getClass().getMethod("getRole").invoke(user);
        } catch (Exception e) {
            try {
                java.lang.reflect.Field field = user.getClass().getDeclaredField("role");
                field.setAccessible(true);
                return field.get(user);
            } catch (Exception ex) {
                throw new RuntimeException("Cannot get role from User", ex);
            }
        }
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
