package com.psiqapp;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.Test;

class ArquiteturaTest {
    private static final ArchRule DOMINIO = noClasses().that().resideInAPackage("..dominio..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "..adaptador..", "..aplicacao..", "..configuracao..", "org.springframework..",
                    "jakarta.persistence..", "org.hibernate..", "org.postgresql..", "com.openai..")
            .allowEmptyShould(true);

    @Test
    void camadasInternasNaoDependemDeFrameworksOuAdaptadores() {
        var classes = new ClassFileImporter().withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                .importPackages("com.psiqapp");
        // O bootstrap ainda nao possui modelos ou casos de uso; a regra permanece ativa para as proximas tasks.
        DOMINIO.check(classes);
        noClasses().that().resideInAPackage("..aplicacao..")
                .should().dependOnClassesThat().resideInAnyPackage(
                        "..adaptador..", "..configuracao..", "org.springframework..",
                        "jakarta.persistence..", "org.hibernate..", "org.postgresql..", "com.openai..")
                .allowEmptyShould(true).check(classes);
    }

    @Test
    void regraRejeitaDependenciaProibidaEmExemploDeTeste() {
        var exemplo = new ClassFileImporter().importPackages("com.psiqapp.arquitetura.exemplo");
        assertThatThrownBy(() -> DOMINIO.check(exemplo)).isInstanceOf(AssertionError.class)
                .hasMessageContaining("DependenciaProibida");
    }
}
