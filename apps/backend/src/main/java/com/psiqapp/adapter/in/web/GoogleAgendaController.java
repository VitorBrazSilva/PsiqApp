package com.psiqapp.adapter.in.web;

import com.psiqapp.application.usecase.ConcluirConexaoGoogleAgendaUseCase;
import com.psiqapp.application.usecase.DesconectarGoogleAgendaUseCase;
import com.psiqapp.application.usecase.IniciarConexaoGoogleAgendaUseCase;
import com.psiqapp.application.usecase.ObterEstadoGoogleAgendaUseCase;
import com.psiqapp.config.GoogleAgendaPropriedades;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.security.SecureRandom;
import java.util.Base64;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.util.WebUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
@RequestMapping("/api/v1/integracoes/google-agenda")
public class GoogleAgendaController {
    static final String COOKIE_SESSAO = "PSIQAPP_GOOGLE_OAUTH";
    private final ObterEstadoGoogleAgendaUseCase estado;
    private final IniciarConexaoGoogleAgendaUseCase inicio;
    private final ConcluirConexaoGoogleAgendaUseCase conclusao;
    private final DesconectarGoogleAgendaUseCase desconexao;
    private final GoogleAgendaPropriedades propriedades;
    private final SecureRandom random = new SecureRandom();

    public GoogleAgendaController(ObterEstadoGoogleAgendaUseCase estado, IniciarConexaoGoogleAgendaUseCase inicio,
            ConcluirConexaoGoogleAgendaUseCase conclusao, DesconectarGoogleAgendaUseCase desconexao,
            GoogleAgendaPropriedades propriedades) {
        this.estado = estado; this.inicio = inicio; this.conclusao = conclusao; this.desconexao = desconexao; this.propriedades = propriedades;
    }

    @GetMapping
    public ResponseEntity<?> estado() { return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(estado.executar()); }

    @GetMapping("/conectar")
    public void conectar(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String sessao = cookie(request);
        if (sessao == null) {
            byte[] bytes = new byte[32]; random.nextBytes(bytes);
            sessao = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
            response.addHeader(HttpHeaders.SET_COOKIE, cookieHeader(sessao));
        }
        try {
            URI destino = inicio.executar(sessao);
            response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
            response.sendRedirect(destino.toASCIIString());
        } catch (RuntimeException excecao) {
            response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
            response.sendRedirect(resultado("indisponivel"));
        }
    }

    @GetMapping("/callback")
    public void callback(HttpServletRequest request, HttpServletResponse response,
            @RequestParam(required = false) String state, @RequestParam(required = false) String code,
            @RequestParam(required = false) String error) throws IOException {
        String sessao = cookie(request);
        boolean sucesso = sessao != null && conclusao.executar(sessao, state, error == null ? code : null);
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        response.setHeader("Referrer-Policy", "no-referrer");
        response.addHeader(HttpHeaders.SET_COOKIE, cookieExpirado());
        response.sendRedirect(resultado(sucesso ? "conectada" : "erro"));
    }

    @DeleteMapping("/conexao")
    public ResponseEntity<Void> desconectar() {
        desconexao.executar();
        return ResponseEntity.noContent().cacheControl(CacheControl.noStore()).build();
    }

    private String cookie(HttpServletRequest request) {
        var cookie = WebUtils.getCookie(request, COOKIE_SESSAO);
        return cookie == null ? null : cookie.getValue();
    }
    private String cookieHeader(String valor) {
        return COOKIE_SESSAO + "=" + valor + "; Path=/api/v1/integracoes/google-agenda; Max-Age=600; HttpOnly; SameSite=Lax"
                + (loopback(propriedades.redirectUri()) ? "" : "; Secure");
    }
    private String cookieExpirado() {
        return COOKIE_SESSAO + "=; Path=/api/v1/integracoes/google-agenda; Max-Age=0; HttpOnly; SameSite=Lax"
                + (loopback(propriedades.redirectUri()) ? "" : "; Secure");
    }
    private String resultado(String status) { return URI.create(propriedades.frontendUri()).toASCIIString() + "?googleAgenda=" + status; }
    private boolean loopback(String uri) {
        try { var host = URI.create(uri).getHost(); return "localhost".equalsIgnoreCase(host) || "127.0.0.1".equals(host) || "::1".equals(host); }
        catch (RuntimeException excecao) { return false; }
    }
}
