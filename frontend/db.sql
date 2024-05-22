create table users (
    id serial primary key,
    login text unique not null,
    password text not null,
    role text default 'user'
);
create table tests (id serial primary key, title text, time integer);
create table questions (
    id serial,
    id_test integer,
    title text,
    type text,
    body text,
    res text,
    foreign key (id_test) references tests (id) on delete cascade
);
create table store (
    id serial primary key,
    id_user integer,
    id_test integer,
    buffer text,
    response text,
    time_start timestamp,
    time_finish timestamp,
    foreign key (id_test) references tests (id) on delete cascade,
    foreign key (id_user) references users (id) on delete cascade
);


select * from store 
select title from tests where id = 6