alter table analysis_generation add constraint uk_analysis_generation_patient_id_id unique (patient_id, id);

create table clinical_analysis (
    id uuid primary key,
    generation_id uuid not null unique references analysis_generation(id) on delete restrict,
    patient_id uuid not null references patient(id) on delete restrict,
    generated_at timestamptz not null,
    mode varchar(32) not null check (mode in ('SUMMARY_ONLY', 'LONGITUDINAL')),
    validated_payload jsonb not null,
    safety_rules_version varchar(64) not null,
    created_at timestamptz not null default now(),
    constraint uk_clinical_analysis_patient_id_id unique (patient_id, id),
    constraint fk_clinical_analysis_patient_generation foreign key (patient_id, generation_id)
        references analysis_generation(patient_id, id) on delete restrict
);

create table analysis_evidence (
    id uuid primary key,
    analysis_id uuid not null references clinical_analysis(id) on delete restrict,
    patient_id uuid not null references patient(id) on delete restrict,
    section varchar(32) not null check (section in ('TIMELINE', 'PATTERNS', 'ATTENTION_POINTS')),
    item_index integer not null check (item_index >= 0),
    record_id uuid not null,
    field varchar(16) not null check (field in ('TEXT', 'MOOD', 'MEDICATIONS')),
    quote text not null,
    created_at timestamptz not null,
    constraint fk_analysis_evidence_patient_analysis foreign key (patient_id, analysis_id)
        references clinical_analysis(patient_id, id) on delete restrict,
    constraint fk_analysis_evidence_patient_record foreign key (patient_id, record_id)
        references clinical_record(patient_id, id) on delete restrict
);

create table analysis_attempt (
    id uuid primary key,
    generation_id uuid not null references analysis_generation(id) on delete restrict,
    attempt_number integer not null check (attempt_number > 0),
    started_at timestamptz not null,
    finished_at timestamptz null,
    outcome varchar(32) null,
    error_code varchar(64) null,
    duration_ms bigint null,
    provider_request_id varchar(128) null,
    input_tokens integer null,
    output_tokens integer null,
    constraint uk_analysis_attempt_generation_number unique (generation_id, attempt_number)
);

create index idx_clinical_analysis_patient_current
    on clinical_analysis (patient_id, generated_at desc, id desc);
create index idx_analysis_evidence_analysis on analysis_evidence (analysis_id);
create index idx_analysis_evidence_record on analysis_evidence (record_id);

create function reject_clinical_analysis_mutation()
returns trigger
language plpgsql
as $$
begin
    raise exception 'clinical_analysis is append-only';
end;
$$;

create trigger trg_clinical_analysis_append_only_update
before update on clinical_analysis
for each row execute function reject_clinical_analysis_mutation();

create trigger trg_clinical_analysis_append_only_delete
before delete on clinical_analysis
for each row execute function reject_clinical_analysis_mutation();

create function reject_analysis_evidence_mutation()
returns trigger
language plpgsql
as $$
begin
    raise exception 'analysis_evidence is append-only';
end;
$$;

create trigger trg_analysis_evidence_append_only_update
before update on analysis_evidence
for each row execute function reject_analysis_evidence_mutation();

create trigger trg_analysis_evidence_append_only_delete
before delete on analysis_evidence
for each row execute function reject_analysis_evidence_mutation();
