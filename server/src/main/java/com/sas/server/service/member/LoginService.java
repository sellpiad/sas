package com.sas.server.service.member;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.sas.server.dao.CustomUserDetails;
import com.sas.server.entity.MemberEntity;
import com.sas.server.util.Role;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginService implements UserDetailsService {

    private final MemberService memberService;
    private final HttpSession session;

    @Override
    public CustomUserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        MemberEntity member = memberService.findById(username);

        if (member == null)
            throw new UsernameNotFoundException("해당하는 사용자가 존재하지 않습니다.");

        CustomUserDetails details = CustomUserDetails.builder()
                .username(member.id)
                .password(member.password)
                .sessionId(session.getId())
                .authorities(createAuthorities(member.type.getRoles()))
                .build();

        return details;

    }

    private List<GrantedAuthority> createAuthorities(String roles) {
        List<GrantedAuthority> authorities = new ArrayList<>();

        for (String role : roles.split(",")) {
            authorities.add(new SimpleGrantedAuthority(role));
        }

        return authorities;
    }

}
