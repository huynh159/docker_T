--
-- PostgreSQL database dump
--

\restrict PrcUoJkc9un2PIQ5nQOnatopkITJfoaspsaKzP9lb8AThz4qBtQJVRf00QwxcHc

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: todos; Type: TABLE; Schema: public; Owner: todo_user
--

CREATE TABLE public.todos (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    completed boolean DEFAULT false NOT NULL
);


ALTER TABLE public.todos OWNER TO todo_user;

--
-- Name: todos_id_seq; Type: SEQUENCE; Schema: public; Owner: todo_user
--

CREATE SEQUENCE public.todos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.todos_id_seq OWNER TO todo_user;

--
-- Name: todos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: todo_user
--

ALTER SEQUENCE public.todos_id_seq OWNED BY public.todos.id;


--
-- Name: todos id; Type: DEFAULT; Schema: public; Owner: todo_user
--

ALTER TABLE ONLY public.todos ALTER COLUMN id SET DEFAULT nextval('public.todos_id_seq'::regclass);


--
-- Data for Name: todos; Type: TABLE DATA; Schema: public; Owner: todo_user
--

COPY public.todos (id, title, completed) FROM stdin;
1	Hoc Docker	f
5	Học react	f
2	Học Spring Boot	t
6	học java	f
\.


--
-- Name: todos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: todo_user
--

SELECT pg_catalog.setval('public.todos_id_seq', 6, true);


--
-- Name: todos todos_pkey; Type: CONSTRAINT; Schema: public; Owner: todo_user
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT todos_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict PrcUoJkc9un2PIQ5nQOnatopkITJfoaspsaKzP9lb8AThz4qBtQJVRf00QwxcHc

