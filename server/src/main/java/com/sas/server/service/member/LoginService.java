package com.sas.server.service.member;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.sas.server.dao.CustomUserDetails;
import com.sas.server.entity.MemberEntity;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LoginService implements UserDetailsService {

    private final MemberService memberService;
    private final HttpSession session;
  
    @Override
    public CustomUserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        MemberEntity member = memberService.findById(username);

        if(member == null)
            throw new UsernameNotFoundException("해당하는 사용자가 존재하지 않습니다.");

        List<GrantedAuthority> authorities = new ArrayList<>();
        
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

        CustomUserDetails details = CustomUserDetails.builder()
                .username(member.id)
                .password(member.password)
                .sessionId(session.getId())
                .authorities(authorities)
                .build();

        return details;

    }

}
