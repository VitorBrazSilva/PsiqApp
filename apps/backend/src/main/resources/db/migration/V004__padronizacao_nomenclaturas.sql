-- Migração não destrutiva do estado V003 para o vocabulário canônico.
-- V001-V003 permanecem imutáveis para preservar o histórico Flyway.

alter table patient rename to paciente;
alter table appointment rename to consulta;
alter table clinical_record rename to registro_clinico;
alter table analysis_generation rename to geracao_analise;
alter table clinical_analysis rename to analise_clinica;
alter table analysis_evidence rename to evidencia_analise;
alter table analysis_attempt rename to tentativa_geracao_analise;
alter table idempotency_record rename to idempotencia;

alter table paciente rename column name to nome;
alter table paciente rename column search_name to nome_busca;
alter table paciente rename column birth_date to data_nascimento;
alter table paciente rename column phone to telefone;
alter table paciente rename column initial_complaint to queixa_inicial;
alter table paciente rename column clinical_revision to revisao_clinica;
alter table paciente rename column request_sequence to sequencia_requisicao;
alter table paciente rename column created_at to criado_em;

alter table consulta rename column patient_id to paciente_id;
alter table consulta rename column scheduled_at to agendada_para;
alter table consulta rename column notes to observacoes;
alter table consulta rename column created_at to criada_em;
alter table consulta rename column status_changed_at to status_alterado_em;

alter table idempotencia rename column scope_operation to operacao_escopo;
alter table idempotencia rename column patient_id to paciente_id;
alter table idempotencia rename column payload_hash to hash_payload;
alter table idempotencia rename column resource_type to tipo_recurso;
alter table idempotencia rename column resource_id to recurso_id;
alter table idempotencia rename column original_status to status_original;
alter table idempotencia rename column created_at to criada_em;

alter table registro_clinico rename column patient_id to paciente_id;
alter table registro_clinico rename column type to tipo;
alter table registro_clinico rename column original_id to parecer_original_id;
alter table registro_clinico rename column appointment_id to consulta_id;
alter table registro_clinico rename column clinical_datetime to data_hora_clinica;
alter table registro_clinico rename column created_at to criado_em;
alter table registro_clinico rename column text to texto;
alter table registro_clinico rename column mood to humor;
alter table registro_clinico rename column medications to medicamentos;

alter table geracao_analise rename column patient_id to paciente_id;
alter table geracao_analise rename column trigger to gatilho;
alter table geracao_analise rename column trigger_record_id to registro_disparador_id;
alter table geracao_analise rename column snapshot_revision to revisao_snapshot;
alter table geracao_analise rename column request_sequence to sequencia_requisicao;
alter table geracao_analise rename column requested_at to solicitada_em;
alter table geracao_analise rename column state to estado;
alter table geracao_analise rename column total_records to total_registros;
alter table geracao_analise rename column original_records to total_pareceres;
alter table geracao_analise rename column complement_records to total_complementos;
alter table geracao_analise rename column last_clinical_record_id to ultimo_registro_clinico_id;
alter table geracao_analise rename column attempt_count to contagem_tentativas;
alter table geracao_analise rename column next_attempt_at to proxima_tentativa_em;
alter table geracao_analise rename column lease_token to token_reserva;
alter table geracao_analise rename column lease_expires_at to reserva_expira_em;
alter table geracao_analise rename column completed_at to concluida_em;
alter table geracao_analise rename column failure_code to codigo_falha;
alter table geracao_analise rename column mode to modo;

alter table analise_clinica rename column generation_id to geracao_id;
alter table analise_clinica rename column patient_id to paciente_id;
alter table analise_clinica rename column generated_at to gerada_em;
alter table analise_clinica rename column mode to modo;
alter table analise_clinica rename column validated_payload to conteudo_validado;
alter table analise_clinica rename column safety_rules_version to versao_regras_seguranca;
alter table analise_clinica rename column created_at to criada_em;

alter table evidencia_analise rename column analysis_id to analise_id;
alter table evidencia_analise rename column patient_id to paciente_id;
alter table evidencia_analise rename column section to secao;
alter table evidencia_analise rename column item_index to indice_item;
alter table evidencia_analise rename column record_id to registro_id;
alter table evidencia_analise rename column field to campo;
alter table evidencia_analise rename column quote to citacao;
alter table evidencia_analise rename column created_at to criada_em;

alter table tentativa_geracao_analise rename column generation_id to geracao_id;
alter table tentativa_geracao_analise rename column attempt_number to numero_tentativa;
alter table tentativa_geracao_analise rename column started_at to iniciada_em;
alter table tentativa_geracao_analise rename column finished_at to finalizada_em;
alter table tentativa_geracao_analise rename column outcome to resultado;
alter table tentativa_geracao_analise rename column error_code to codigo_erro;
alter table tentativa_geracao_analise rename column duration_ms to duracao_ms;
alter table tentativa_geracao_analise rename column provider_request_id to requisicao_provedor_id;
alter table tentativa_geracao_analise rename column input_tokens to tokens_entrada;
alter table tentativa_geracao_analise rename column output_tokens to tokens_saida;

-- O estado canônico mais longo exige ampliar a coluna histórica antes do update.
alter table geracao_analise alter column estado type varchar(32);

-- Remove os checks antigos antes da conversão dos valores persistidos.
alter table registro_clinico drop constraint if exists ck_clinical_record_original_reference;
alter table registro_clinico drop constraint if exists clinical_record_type_check;
alter table geracao_analise drop constraint if exists analysis_generation_trigger_check;
alter table geracao_analise drop constraint if exists analysis_generation_state_check;
alter table geracao_analise drop constraint if exists analysis_generation_mode_check;
alter table analise_clinica drop constraint if exists clinical_analysis_mode_check;
alter table evidencia_analise drop constraint if exists analysis_evidence_section_check;
alter table evidencia_analise drop constraint if exists analysis_evidence_field_check;

-- A conversão dos valores históricos é parte da migração e não altera o
-- comportamento append-only após a migração. O trigger é reativado logo após
-- os updates canônicos.
alter table registro_clinico disable trigger trg_clinical_record_append_only_update;
alter table analise_clinica disable trigger trg_clinical_analysis_append_only_update;

update registro_clinico set tipo = 'PARECER' where tipo = 'ORIGINAL';
update registro_clinico set tipo = 'COMPLEMENTO' where tipo = 'COMPLEMENT';
update geracao_analise set gatilho = 'AUTOMATICA' where gatilho = 'AUTO';
update geracao_analise set estado = 'ENFILEIRADA' where estado = 'QUEUED';
update geracao_analise set estado = 'EM_EXECUCAO' where estado = 'RUNNING';
update geracao_analise set estado = 'AGUARDANDO_RETENTATIVA' where estado = 'RETRY_WAIT';
update geracao_analise set estado = 'CONCLUIDA' where estado = 'COMPLETED';
update geracao_analise set estado = 'FALHA' where estado = 'FAILED';
update geracao_analise set modo = 'RESUMO' where modo = 'SUMMARY_ONLY';
update analise_clinica set modo = 'RESUMO' where modo = 'SUMMARY_ONLY';
update evidencia_analise set secao = 'LINHA_DO_TEMPO' where secao = 'TIMELINE';
update evidencia_analise set secao = 'PADROES' where secao = 'PATTERNS';
update evidencia_analise set secao = 'PONTOS_DE_ATENCAO' where secao = 'ATTENTION_POINTS';

alter table registro_clinico enable trigger trg_clinical_record_append_only_update;
alter table analise_clinica enable trigger trg_clinical_analysis_append_only_update;

-- A função histórica continua anexada ao trigger após o rename da tabela;
-- sua implementação precisa acompanhar os nomes e valores canônicos.
create or replace function validate_clinical_record_original()
returns trigger
language plpgsql
as $$
declare
    tipo_parecer varchar(16);
begin
    if new.tipo = 'COMPLEMENTO' then
        select tipo into tipo_parecer
          from registro_clinico
         where id = new.parecer_original_id
           and paciente_id = new.paciente_id;

        if tipo_parecer is distinct from 'PARECER' then
            raise exception 'complemento must reference parecer';
        end if;
    end if;
    return new;
end;
$$;

alter table registro_clinico add constraint ck_registro_clinico_tipo check (tipo in ('PARECER', 'COMPLEMENTO'));
alter table registro_clinico add constraint ck_registro_clinico_referencia check ((tipo = 'PARECER' and parecer_original_id is null) or (tipo = 'COMPLEMENTO' and parecer_original_id is not null));
alter table geracao_analise add constraint ck_geracao_analise_gatilho check (gatilho in ('AUTOMATICA', 'MANUAL'));
alter table geracao_analise add constraint ck_geracao_analise_estado check (estado in ('ENFILEIRADA', 'EM_EXECUCAO', 'AGUARDANDO_RETENTATIVA', 'CONCLUIDA', 'FALHA'));
alter table geracao_analise add constraint ck_geracao_analise_modo check (modo in ('RESUMO', 'LONGITUDINAL'));
alter table analise_clinica add constraint ck_analise_clinica_modo check (modo in ('RESUMO', 'LONGITUDINAL'));
alter table evidencia_analise add constraint ck_evidencia_analise_secao check (secao in ('LINHA_DO_TEMPO', 'PADROES', 'PONTOS_DE_ATENCAO'));
alter table evidencia_analise add constraint ck_evidencia_analise_campo check (campo in ('TEXTO', 'HUMOR', 'MEDICAMENTOS'));

-- Conversão determinística do envelope histórico, sem descartar itens desconhecidos.
update analise_clinica
set conteudo_validado = jsonb_build_object(
    'linhaDoTempo', coalesce(conteudo_validado->'linhaDoTempo', conteudo_validado->'timeline', '[]'::jsonb),
    'padroes', coalesce(conteudo_validado->'padroes', conteudo_validado->'patterns', '[]'::jsonb),
    'pontosDeAtencao', coalesce(conteudo_validado->'pontosDeAtencao', conteudo_validado->'attentionPoints', '[]'::jsonb),
    'limitacoes', coalesce(conteudo_validado->'limitacoes', conteudo_validado->'limitations', '[]'::jsonb)
)
where conteudo_validado ? 'timeline'
   or conteudo_validado ? 'patterns'
   or conteudo_validado ? 'attentionPoints'
   or conteudo_validado ? 'limitations';

-- Os objetos de evidência são normalizados preservando UUID, campo e citação.
update analise_clinica a
set conteudo_validado = jsonb_set(a.conteudo_validado, '{linhaDoTempo}', coalesce((select jsonb_agg(
    jsonb_build_object(
        'texto', coalesce(item->'texto', item->'text', to_jsonb(''::text)),
        'natureza', coalesce(item->'natureza', item->'kind', item->'type', to_jsonb('RELATO'::text)),
        'evidencias', coalesce((select jsonb_agg(jsonb_build_object(
            'apelidoRegistro', coalesce(ev->'apelidoRegistro', ev->'recordAlias', 'null'::jsonb),
            'registroId', coalesce(ev->'registroId', ev->'recordId'),
            'campo', coalesce(ev->'campo', ev->'field'),
            'citacao', coalesce(ev->'citacao', ev->'quote', to_jsonb(''::text)))
        ) from jsonb_array_elements(coalesce(item->'evidencias', item->'evidence', '[]'::jsonb)) ev), '[]'::jsonb)
    )
  ) from jsonb_array_elements(a.conteudo_validado->'linhaDoTempo') item), '[]'::jsonb));

-- Renomeia objetos auxiliares criados nas migrations históricas.
alter index idx_patient_search_name_id rename to idx_paciente_nome_busca_id;
alter index idx_appointment_patient_scheduled_id rename to idx_consulta_paciente_agendada_id;
alter index idx_appointment_scheduled_id rename to idx_consulta_agendada_id;
alter index uk_idempotency_record_scope rename to uk_idempotencia_escopo;
alter index idx_clinical_record_patient_clinical_created_id rename to idx_registro_clinico_paciente_data_id;
alter index idx_clinical_record_patient_revision rename to idx_registro_clinico_paciente_revisao;
alter index idx_analysis_generation_state_next_requested_id rename to idx_geracao_analise_estado_proxima_id;
alter index idx_analysis_generation_patient_state rename to idx_geracao_analise_paciente_estado;
alter index idx_analysis_generation_patient_snapshot_request rename to idx_geracao_analise_paciente_snapshot_sequencia;
alter index idx_clinical_analysis_patient_current rename to idx_analise_clinica_paciente_atual;
alter index idx_analysis_evidence_analysis rename to idx_evidencia_analise_analise;
alter index idx_analysis_evidence_record rename to idx_evidencia_analise_registro;
