package com.psiqapp;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.Test;

class ArquiteturaTest {
    private static final ArchRule DOMINIO = noClasses().that().resideInAnyPackage("..domain..", "..dominio..", "com.psiqapp.domain..", "com.psiqapp.dominio..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "..adapter..", "..adaptador..", "..application..", "..config..", "org.springframework..",
                    "jakarta.persistence..", "org.hibernate..", "org.postgresql..", "com.openai..", "com.google..")
            .allowEmptyShould(true);

    @Test
    void camadasInternasNaoDependemDeFrameworksOuAdapters() {
        var classes = new ClassFileImporter().withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                .importPackages("com.psiqapp");
        DOMINIO.check(classes);
        noClasses().that().resideInAPackage("..application..")
                .should().dependOnClassesThat().resideInAnyPackage(
                        "..adapter..", "..config..", "org.springframework..",
                        "jakarta.persistence..", "org.hibernate..", "org.postgresql..", "com.openai..", "com.google..")
                .allowEmptyShould(true).check(classes);
        noClasses().that().resideInAPackage("..domain..")
                .should().dependOnClassesThat().resideInAnyPackage("..application..", "..adapter..", "..config..")
                .allowEmptyShould(true).check(classes);
    }

    @Test
    void regraRejeitaDependenciaProibidaEmExemploDeTeste() {
        var exemplo = new ClassFileImporter().importPackages("com.psiqapp.arquitetura.exemplo");
        var regraFixture = noClasses().that().haveSimpleName("DependenciaProibida")
                .should().dependOnClassesThat().haveSimpleName("AdapterDeExemplo");
        assertThatThrownBy(() -> regraFixture.check(exemplo)).isInstanceOf(AssertionError.class)
                .hasMessageContaining("DependenciaProibida");
    }
}
