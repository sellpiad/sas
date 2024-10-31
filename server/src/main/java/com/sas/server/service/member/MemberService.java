package com.sas.server.service.member;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sas.server.controller.dto.admin.MemberData;
import com.sas.server.custom.exception.UserAlreadyExistsException;
import com.sas.server.custom.util.Role;
import com.sas.server.repository.entity.CustomUserDetails;
import com.sas.server.repository.entity.MemberEntity;
import com.sas.server.repository.jpa.MemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberService {

    private final MemberRepository memberRepo;
    private final SessionRegistry sessionRegistry;
    private final PasswordEncoder passwordEncoder;

    public void save(String id, String password, Role type) {

        if (memberRepo.findById(id).isPresent())
            throw new UserAlreadyExistsException("이미 사용 중인 아이디입니다.");

        memberRepo.save(MemberEntity.builder()
                .type(type)
                .id(id)
                .password(passwordEncoder.encode(password))
                .build());

    }

    public List<MemberData> findAll() {

        Map<String, MemberData> memberList = new HashMap<>();
        List<MemberEntity> entityList = memberRepo.findAll();

        List<CustomUserDetails> connectedList = sessionRegistry.getAllPrincipals().stream()
                .filter(principal -> principal instanceof CustomUserDetails)
                .map(principal -> (CustomUserDetails) principal)
                .collect(Collectors.toList());

        for (MemberEntity member : entityList) {

            memberList.put(member.id, MemberData.builder()
                    .memberNumber(member.memberNumber)
                    .username(member.id)
                    .build());

        }

        for (CustomUserDetails user : connectedList) {

            MemberData member = memberList.get(user.getUsername());

            if (member != null) {
                memberList.put(member.getUsername(), member.toBuilder()
                        .isConnected(true)
                        .build());
            }
        }

        return new ArrayList<>(memberList.values());
    }

    public MemberEntity findById(String id) {
        return memberRepo.findById(id).orElse(null);
    }

    public void deleteById(String id) {
        memberRepo.deleteById(id);
    }

    public String getUserAuth(CustomUserDetails user) {

        List<GrantedAuthority> authorities = user.getAuthorities();

        for (GrantedAuthority auth : authorities) {
            if (auth.getAuthority().equals("ROLE_ADMIN"))
                return "ADMIN";
            if (auth.getAuthority().equals("ROLE_MANAGER"))
                return "MANAGER";
            if (auth.getAuthority().equals("ROLE_USER"))
                return "USER";
        }

        return null;
    }

}
