create table challenges (
    id uuid default gen_random_uuid() primary key,
    slug text unique not null,
    title text not null,
    description text not null,
    difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
    category text not null check (category in ('strategy', 'execution', 'communication', 'analytics')),
    version integer not null default 1,
    time_estimate_minutes integer not null,
    scenario_brief text not null,
    context_materials jsonb not null default '[]',
    submission_fields jsonb not null,
    rubric jsonb not null,
    expert_solution jsonb not null,
    steps jsonb not null default '[]',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table submissions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id),
    challenge_id uuid not null references challenges(id),
    challenge_version integer not null,
    field_responses jsonb not null,
    status text not null default 'pending' check (status in ('pending', 'reviewing', 'reviewed', 'failed')),
    created_at timestamptz default now()
);

create table reviews (
    id uuid default gen_random_uuid() primary key,
    submission_id uuid not null references submissions(id) on delete cascade,
    overall_score integer not null check (overall_score between 1 and 10),
    dimensions jsonb not null,
    summary text not null,
    comparison_to_expert text not null,
    created_at timestamptz default now()
);

create table drafts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id),
    challenge_id uuid not null references challenges(id),
    field_responses jsonb not null default '{}',
    current_step integer not null default 0,
    updated_at timestamptz default now(),
    unique(user_id, challenge_id)
);

alter table challenges enable row level security;
alter table submissions enable row level security;
alter table reviews enable row level security;
alter table drafts enable row level security;

create policy "Challenges are public" on challenges
    for select using (true);

create policy "Users read own submissions" on submissions
    for select using (auth.uid() = user_id);

create policy "Users insert own submissions" on submissions
    for insert with check (auth.uid() = user_id);

create policy "Users read own reviews" on reviews
    for select using (
        submission_id in (select id from submissions where user_id = auth.uid())
    );

create policy "Users manage own drafts" on drafts
    for all using (auth.uid() = user_id);
