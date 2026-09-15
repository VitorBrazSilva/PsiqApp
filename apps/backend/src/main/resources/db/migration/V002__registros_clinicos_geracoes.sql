alter table appointment add constraint uk_appointment_patient_id_id unique (patient_id, id);

create table clinical_record (
    id uuid primary key,
    patient_id uuid not null references patient(id) on delete restrict,
    type varchar(16) not null check (type in ('ORIGINAL', 'COMPLEMENT')),
    original_id uuid null,
    appointment_id uuid null,
    clinical_datetime timestamptz not null,
    created_at timestamptz not null,
    text text not null,
    mood text null,
    medications text null,
    revision bigint not null,
    constraint ck_clinical_record_original_reference check (
        (type = 'ORIGINAL' and original_id is null)
        or (type = 'COMPLEMENT' and original_id is not null)
    ),
    constraint uk_clinical_record_patient_revision unique (patient_id, revision),
    constraint uk_clinical_record_patient_id_id unique (patient_id, id),
    constraint fk_clinical_record_patient_original foreign key (patient_id, original_id)
        references clinical_record(patient_id, id) on delete restrict,
    constraint fk_clinical_record_patient_appointment foreign key (patient_id, appointment_id)
        references appointment(patient_id, id) on delete restrict
);

create index idx_clinical_record_patient_clinical_created_id
    on clinical_record (patient_id, clinical_datetime desc, created_at desc, id desc);
create index idx_clinical_record_patient_revision on clinical_record (patient_id, revision);

create table analysis_generation (
    id uuid primary key,
    patient_id uuid not null references patient(id) on delete restrict,
    trigger varchar(16) not null check (trigger in ('AUTO', 'MANUAL')),
    trigger_record_id uuid null,
    snapshot_revision bigint not null,
    request_sequence bigint not null,
    requested_at timestamptz not null,
    state varchar(16) not null check (state in ('QUEUED', 'RUNNING', 'RETRY_WAIT', 'COMPLETED', 'FAILED')),
    total_records integer not null,
    original_records integer not null,
    complement_records integer not null,
    last_clinical_record_id uuid null,
    attempt_count integer not null default 0,
    next_attempt_at timestamptz null,
    lease_token uuid null,
    lease_expires_at timestamptz null,
    completed_at timestamptz null,
    failure_code varchar(64) null,
    mode varchar(32) not null check (mode in ('SUMMARY_ONLY', 'LONGITUDINAL')),
    constraint uk_analysis_generation_patient_request_sequence unique (patient_id, request_sequence),
    constraint uk_analysis_generation_auto_trigger unique (trigger_record_id),
    constraint fk_analysis_generation_trigger_record foreign key (patient_id, trigger_record_id)
        references clinical_record(patient_id, id) on delete restrict,
    constraint fk_analysis_generation_last_record foreign key (patient_id, last_clinical_record_id)
        references clinical_record(patient_id, id) on delete restrict
);

create index idx_analysis_generation_state_next_requested_id
    on analysis_generation (state, next_attempt_at, requested_at, id);
create index idx_analysis_generation_patient_state on analysis_generation (patient_id, state);
create index idx_analysis_generation_patient_snapshot_request
    on analysis_generation (patient_id, snapshot_revision, request_sequence);

create function reject_clinical_record_mutation()
returns trigger
language plpgsql
as $$
begin
    raise exception 'clinical_record is append-only';
end;
$$;

create trigger trg_clinical_record_append_only_update
before update on clinical_record
for each row execute function reject_clinical_record_mutation();

create trigger trg_clinical_record_append_only_delete
before delete on clinical_record
for each row execute function reject_clinical_record_mutation();

create function validate_clinical_record_original()
returns trigger
language plpgsql
as $$
declare
    original_type varchar(16);
begin
    if new.type = 'COMPLEMENT' then
        select type into original_type
          from clinical_record
         where id = new.original_id
           and patient_id = new.patient_id;

        if original_type is distinct from 'ORIGINAL' then
            raise exception 'complement must reference original clinical record';
        end if;
    end if;
    return new;
end;
$$;

create trigger trg_clinical_record_validate_original
before insert on clinical_record
for each row execute function validate_clinical_record_original();
