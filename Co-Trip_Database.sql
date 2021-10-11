--
-- PostgreSQL database dump
--

-- Dumped from database version 13.3
-- Dumped by pg_dump version 13.3

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
-- Name: admincred; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admincred (
    id bigint NOT NULL,
    country character varying(30) NOT NULL,
    username character varying(30) NOT NULL,
    password character varying(30) NOT NULL
);


ALTER TABLE public.admincred OWNER TO postgres;

--
-- Name: admincred_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admincred_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.admincred_id_seq OWNER TO postgres;

--
-- Name: admincred_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admincred_id_seq OWNED BY public.admincred.id;


--
-- Name: country; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.country (
    id bigint NOT NULL,
    name character varying(30) NOT NULL,
    pop double precision NOT NULL,
    c_vacc double precision NOT NULL
);


ALTER TABLE public.country OWNER TO postgres;

--
-- Name: country_status; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.country_status AS
 SELECT country.id,
    country.name,
    country.pop,
    country.c_vacc,
    round((((country.c_vacc / country.pop) * (100)::double precision))::numeric, 2) AS percentage,
        CASE
            WHEN (((country.c_vacc / country.pop) * (100)::double precision) < (80)::double precision) THEN '0'::text
            WHEN (((country.c_vacc / country.pop) * (100)::double precision) >= (80)::double precision) THEN '1'::text
            ELSE NULL::text
        END AS c_status
   FROM public.country;


ALTER TABLE public.country_status OWNER TO postgres;

--
-- Name: country_cred; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.country_cred AS
 SELECT country_status.id,
    country_status.name,
    country_status.pop,
    country_status.c_vacc,
    country_status.percentage,
    country_status.c_status,
    admincred.username,
    admincred.password
   FROM (public.country_status
     JOIN public.admincred ON (((country_status.name)::text = (admincred.country)::text)));


ALTER TABLE public.country_cred OWNER TO postgres;

--
-- Name: country_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.country_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.country_id_seq OWNER TO postgres;

--
-- Name: country_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.country_id_seq OWNED BY public.country.id;


--
-- Name: credential; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credential (
    id bigint NOT NULL,
    username character varying(20) NOT NULL,
    password character varying(20)
);


ALTER TABLE public.credential OWNER TO postgres;

--
-- Name: credential_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.credential_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.credential_id_seq OWNER TO postgres;

--
-- Name: credential_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.credential_id_seq OWNED BY public.credential.id;


--
-- Name: masteradmin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.masteradmin (
    id bigint NOT NULL,
    username character varying(30) NOT NULL,
    password character varying(30) NOT NULL
);


ALTER TABLE public.masteradmin OWNER TO postgres;

--
-- Name: masteradmin_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.masteradmin_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.masteradmin_id_seq OWNER TO postgres;

--
-- Name: masteradmin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.masteradmin_id_seq OWNED BY public.masteradmin.id;


--
-- Name: tourist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tourist (
    id bigint NOT NULL,
    name character varying(50),
    pass_num bigint,
    origin character varying(30),
    destination character varying(30),
    gender character varying(20) NOT NULL,
    vacc integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.tourist OWNER TO postgres;

--
-- Name: tourist_cred; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.tourist_cred AS
 SELECT tourist.id,
    tourist.name,
    tourist.pass_num,
    tourist.origin,
    tourist.destination,
    tourist.gender,
    tourist.vacc,
    credential.username,
    credential.password
   FROM (public.tourist
     JOIN public.credential USING (id));


ALTER TABLE public.tourist_cred OWNER TO postgres;

--
-- Name: tourist_status; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.tourist_status AS
 SELECT tourist_cred.id,
    tourist_cred.name,
    tourist_cred.pass_num,
    tourist_cred.origin,
    tourist_cred.destination,
    tourist_cred.gender,
    tourist_cred.vacc,
    tourist_cred.username,
    tourist_cred.password,
        CASE
            WHEN (tourist_cred.vacc = 0) THEN 0
            WHEN (tourist_cred.vacc = 1) THEN 0
            WHEN (tourist_cred.vacc = 2) THEN 1
            ELSE NULL::integer
        END AS status
   FROM public.tourist_cred;


ALTER TABLE public.tourist_status OWNER TO postgres;

--
-- Name: tourist_approval; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.tourist_approval AS
 SELECT tourist_status.id,
    tourist_status.name,
    tourist_status.pass_num,
    tourist_status.origin,
    tourist_status.destination,
    tourist_status.gender,
    tourist_status.vacc,
    tourist_status.username,
    tourist_status.password,
    tourist_status.status,
    country_status.c_status
   FROM (public.tourist_status
     LEFT JOIN public.country_status ON (((tourist_status.destination)::text = (country_status.name)::text)));


ALTER TABLE public.tourist_approval OWNER TO postgres;

--
-- Name: tourist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tourist_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tourist_id_seq OWNER TO postgres;

--
-- Name: tourist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tourist_id_seq OWNED BY public.tourist.id;


--
-- Name: admincred id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admincred ALTER COLUMN id SET DEFAULT nextval('public.admincred_id_seq'::regclass);


--
-- Name: country id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.country ALTER COLUMN id SET DEFAULT nextval('public.country_id_seq'::regclass);


--
-- Name: credential id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential ALTER COLUMN id SET DEFAULT nextval('public.credential_id_seq'::regclass);


--
-- Name: masteradmin id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.masteradmin ALTER COLUMN id SET DEFAULT nextval('public.masteradmin_id_seq'::regclass);


--
-- Name: tourist id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tourist ALTER COLUMN id SET DEFAULT nextval('public.tourist_id_seq'::regclass);


--
-- Data for Name: admincred; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admincred (id, country, username, password) FROM stdin;
17	South Korea	skorea44	saranghae
18	Indonesia	Ina1313	tanahair
20	China	chn342	thedragon
21	Japan	risingsun	banzai
\.


--
-- Data for Name: country; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.country (id, name, pop, c_vacc) FROM stdin;
5	Indonesia	270000000	100000000
8	South Korea	51000000	45000000
7	India	1300000000	500000000
9	Japan	120000000	100000000
\.


--
-- Data for Name: credential; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credential (id, username, password) FROM stdin;
1	iu1234	1234
3	kju324	rocketman
2	yusufagung29	1234
4	nobeeta12	doraemon
\.


--
-- Data for Name: masteradmin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.masteradmin (id, username, password) FROM stdin;
1	masteradmin	incontrol
\.


--
-- Data for Name: tourist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tourist (id, name, pass_num, origin, destination, gender, vacc) FROM stdin;
1	Lee Ji Eun	1243213453	South Korea	Indonesia	female	0
3	Kim Jong Un	1236665555	South Korea	Indonesia	male	2
2	Yusuf Agung Nugroho	1906381685	Indonesia	India	male	0
4	Nobi Nobita	1123232345	Japan	\N	male	0
\.


--
-- Name: admincred_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admincred_id_seq', 22, true);


--
-- Name: country_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.country_id_seq', 9, true);


--
-- Name: credential_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.credential_id_seq', 4, true);


--
-- Name: masteradmin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.masteradmin_id_seq', 1, true);


--
-- Name: tourist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tourist_id_seq', 4, true);


--
-- Name: admincred admincred_usernaname_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admincred
    ADD CONSTRAINT admincred_usernaname_key UNIQUE (username);


--
-- Name: credential credential_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential
    ADD CONSTRAINT credential_username_key UNIQUE (username);


--
-- PostgreSQL database dump complete
--

