--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: categories; Type: TABLE; Schema: public; Owner: family_buget
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.categories OWNER TO family_buget;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: family_buget
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO family_buget;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: family_buget
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: family_buget
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    user_id integer,
    "position" text NOT NULL,
    organization text NOT NULL,
    salary integer NOT NULL,
    start_date date NOT NULL
);


ALTER TABLE public.jobs OWNER TO family_buget;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: family_buget
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.jobs_id_seq OWNER TO family_buget;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: family_buget
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: family_buget
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    category_id integer,
    price integer NOT NULL
);


ALTER TABLE public.products OWNER TO family_buget;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: family_buget
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO family_buget;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: family_buget
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: family_buget
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    user_id integer,
    product_id integer,
    quantity integer NOT NULL,
    purchase_date date NOT NULL
);


ALTER TABLE public.transactions OWNER TO family_buget;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: family_buget
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transactions_id_seq OWNER TO family_buget;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: family_buget
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: family_buget
--

CREATE TABLE public.users (
    id integer NOT NULL,
    full_name text NOT NULL,
    birth_date date NOT NULL
);


ALTER TABLE public.users OWNER TO family_buget;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: family_buget
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO family_buget;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: family_buget
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: categories unique_category_name; Type: CONSTRAINT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT unique_category_name UNIQUE (name);


--
-- Name: users unique_full_name; Type: CONSTRAINT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_full_name UNIQUE (full_name);


--
-- Name: jobs unique_job_user; Type: CONSTRAINT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT unique_job_user UNIQUE (user_id);


--
-- Name: products unique_product_name; Type: CONSTRAINT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT unique_product_name UNIQUE (name);


--
-- Name: transactions unique_transaction; Type: CONSTRAINT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT unique_transaction UNIQUE (user_id, product_id, purchase_date);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: family_buget
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

