package com.psiqapp.adapter.out.persistence;

import com.psiqapp.config.GoogleAgendaPropriedades;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

@Component
public class CifraTokenGoogleAgenda {
    private final GoogleAgendaPropriedades propriedades;
    private final SecureRandom random = new SecureRandom();
    public CifraTokenGoogleAgenda(GoogleAgendaPropriedades propriedades) { this.propriedades = propriedades; }
    public Dados cifrar(String token) {
        try {
            byte[] iv = new byte[12]; random.nextBytes(iv);
            Cipher cifra = Cipher.getInstance("AES/GCM/NoPadding");
            cifra.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(propriedades.chaveDecodificada(), "AES"), new GCMParameterSpec(128, iv));
            return new Dados(Base64.getEncoder().encodeToString(iv), Base64.getEncoder().encodeToString(cifra.doFinal(token.getBytes(java.nio.charset.StandardCharsets.UTF_8))));
        } catch (Exception excecao) { throw new IllegalStateException("Falha protegida ao cifrar credencial Google."); }
    }
    public String decifrar(Dados dados) {
        try {
            Cipher cifra = Cipher.getInstance("AES/GCM/NoPadding");
            cifra.init(Cipher.DECRYPT_MODE, new SecretKeySpec(propriedades.chaveDecodificada(), "AES"),
                    new GCMParameterSpec(128, Base64.getDecoder().decode(dados.iv())));
            return new String(cifra.doFinal(Base64.getDecoder().decode(dados.valor())), java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception excecao) { throw new IllegalStateException("Credencial Google protegida indisponível."); }
    }
    public record Dados(String iv, String valor) {}
}
