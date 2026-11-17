--
-- PostgreSQL database dump
--

\restrict Vr1fRUEvrfMmaswoaUZKESiAGY2skRVZzta9VIYWIlnsf4UDyuku9ucCcemUNWE
-- Migration 000: baseline schema of the 7 tables created before migrations existed.
-- Generated with pg_dump --schema-only --no-owner --no-privileges; the dump body is unchanged.
-- On a database that already has these tables, run only the schema_migrations block at the end.
BEGIN;
-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'WIN1252';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: consulation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.consulation_status AS ENUM (
    'pending',
    'link_generated',
    'closed',
    'cancelled'
);


--
-- Name: consultation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.consultation_status AS ENUM (
    'pending',
    'link_generated',
    'closed',
    'cancelled'
);


--
-- Name: conversation_closed_by; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.conversation_closed_by AS ENUM (
    'bot',
    'sweeper'
);


--
-- Name: conversation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.conversation_status AS ENUM (
    'active',
    'closed',
    'handed_off'
);


--
-- Name: message_direction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.message_direction AS ENUM (
    'inbound',
    'outbound'
);


--
-- Name: message_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.message_type AS ENUM (
    'text',
    'image',
    'interactive',
    'unknown'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bot_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bot_status (
    id smallint NOT NULL,
    connection_state character varying(20) NOT NULL,
    state_changed_at timestamp with time zone NOT NULL,
    last_seen_at timestamp with time zone NOT NULL,
    CONSTRAINT bot_status_id_check CHECK ((id = 1))
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id integer CONSTRAINT conservations_id_not_null NOT NULL,
    contact_id integer CONSTRAINT conservations_contact_id_not_null NOT NULL,
    status public.conversation_status DEFAULT 'active'::public.conversation_status CONSTRAINT conservations_status_not_null NOT NULL,
    current_state character varying(255) DEFAULT 'main_menu'::character varying CONSTRAINT conservations_current_status_not_null NOT NULL,
    started_at timestamp with time zone DEFAULT now() CONSTRAINT conservations_started_at_not_null NOT NULL,
    ended_at timestamp with time zone,
    selected_service_id integer,
    last_activity_at timestamp with time zone DEFAULT now() NOT NULL,
    handed_off_at timestamp with time zone,
    closed_at timestamp with time zone,
    closed_by public.conversation_closed_by,
    idle_timeout_minutes integer,
    resumed_from_id integer
);


--
-- Name: conservations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conservations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conservations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conservations_id_seq OWNED BY public.conversations.id;


--
-- Name: consultation_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consultation_requests (
    id integer CONSTRAINT consultation_request_id_not_null NOT NULL,
    conversation_id integer CONSTRAINT consultation_request_conversation_id_not_null NOT NULL,
    service_id integer,
    topic text,
    status public.consultation_status DEFAULT 'pending'::public.consultation_status CONSTRAINT consultation_request_status_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT consultation_request_created_at_not_null NOT NULL
);


--
-- Name: consultation_request_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.consultation_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: consultation_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.consultation_request_id_seq OWNED BY public.consultation_requests.id;


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contacts (
    id integer NOT NULL,
    whatsapp_number character varying(20) NOT NULL,
    display_name character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contacts_id_seq OWNED BY public.contacts.id;


--
-- Name: faqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faqs (
    id integer NOT NULL,
    service_id integer,
    question text NOT NULL,
    answer text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: faqs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.faqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: faqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.faqs_id_seq OWNED BY public.faqs.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    direction public.message_direction NOT NULL,
    message_type public.message_type DEFAULT 'text'::public.message_type NOT NULL,
    body text,
    provider_message_id character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id integer NOT NULL,
    service_key character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    summary character varying(255)
);


--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: consultation_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultation_requests ALTER COLUMN id SET DEFAULT nextval('public.consultation_request_id_seq'::regclass);


--
-- Name: contacts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts ALTER COLUMN id SET DEFAULT nextval('public.contacts_id_seq'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conservations_id_seq'::regclass);


--
-- Name: faqs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faqs ALTER COLUMN id SET DEFAULT nextval('public.faqs_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: bot_status bot_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bot_status
    ADD CONSTRAINT bot_status_pkey PRIMARY KEY (id);


--
-- Name: conversations conservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conservations_pkey PRIMARY KEY (id);


--
-- Name: consultation_requests consultation_request_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultation_requests
    ADD CONSTRAINT consultation_request_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_whatsapp_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_whatsapp_number_key UNIQUE (whatsapp_number);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: services services_service_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_service_key_key UNIQUE (service_key);


--
-- Name: conversations_one_active_per_contact; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX conversations_one_active_per_contact ON public.conversations USING btree (contact_id) WHERE (status = 'active'::public.conversation_status);


--
-- Name: conversations conservations_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conservations_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE RESTRICT;


--
-- Name: consultation_requests consultation_request_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultation_requests
    ADD CONSTRAINT consultation_request_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE RESTRICT;


--
-- Name: consultation_requests consultation_request_services_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultation_requests
    ADD CONSTRAINT consultation_request_services_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_resumed_from_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_resumed_from_id_fkey FOREIGN KEY (resumed_from_id) REFERENCES public.conversations(id);


--
-- Name: conversations conversations_selected_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_selected_service_id_fkey FOREIGN KEY (selected_service_id) REFERENCES public.services(id) ON DELETE SET NULL;


--
-- Name: faqs faqs_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE RESTRICT;

-- Records which migration files have run on this database.
CREATE TABLE public.schema_migrations (
    version text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.schema_migrations (version) VALUES ('000');

COMMIT;
--
-- PostgreSQL database dump complete
--

\unrestrict Vr1fRUEvrfMmaswoaUZKESiAGY2skRVZzta9VIYWIlnsf4UDyuku9ucCcemUNWE

