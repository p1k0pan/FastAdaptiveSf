CREATE TABLE IF NOT EXISTS users(
user_name text primary key,
password varchar (50) not null,
histories text[]
);

INSERT into users(user_name, password) values ('user1', 'u1_1234')
