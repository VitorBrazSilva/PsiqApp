create table patient (
    id uuid primary key,
    name varchar(255) not null,
    search_name varchar(255) not null,
    cpf varchar(11) not null unique,
    birth_date date not null,
    phone varchar(14) not null,
    email varchar(255) not null,
    initial_complaint text null,
    clinical_revision bigint not null default 0,
    request_sequence bigint not null default 0,
    created_at timestamptz not null
);

create index idx_patient_search_name_id on patient (search_name, id);

create table appointment (
    id uuid primary key,
    patient_id uuid not null references patient(id) on delete restrict,
    scheduled_at timestamptz not null,
    status varchar(16) not null check (status in ('AGENDADA', 'REALIZADA', 'CANCELADA', 'FALTA')),
    notes text null,
    created_at timestamptz not null,
    status_changed_at timestamptz null
);

create index idx_appointment_patient_scheduled_id on appointment (patient_id, scheduled_at, id);
create index idx_appointment_scheduled_id on appointment (scheduled_at, id);

create table idempotency_record (
    id uuid primary key,
    scope_operation varchar(64) not null,
    patient_id uuid null references patient(id) on delete restrict,
    key uuid not null,
    payload_hash bytea not null,
    resource_type varchar(32) not null,
    resource_id uuid not null,
    original_status smallint not null,
    created_at timestamptz not null
);

create unique index uk_idempotency_record_scope
    on idempotency_record (scope_operation, coalesce(patient_id, '00000000-0000-0000-0000-000000000000'::uuid), key);
