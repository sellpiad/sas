package com.sas.server.service.member;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.sas.server.dao.CustomUserDetails;
import com.sas.server.entity.MemberEntity;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LoginService implements UserDetailsService {

    private final MemberService memberService;
  
    @Override
    public CustomUserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        MemberEntity member = memberService.findById(username);

        if(member == null)
            throw new UsernameNotFoundException("해당하는 사용자가 존재하지 않습니다.");


        CustomUserDetails details = CustomUserDetails.builder()
                .username(member.id)
                .password(member.password)
                .build();

        return details;

    }

}
