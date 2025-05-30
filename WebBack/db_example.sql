PGDMP  +                    }           clustree    17.2    17.2 >               0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            	           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            
           1262    24863    clustree    DATABASE     {   CREATE DATABASE clustree WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'French_France.1252';
    DROP DATABASE clustree;
                     postgres    false                        2615    2200    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
                     pg_database_owner    false                       0    0    SCHEMA public    COMMENT     6   COMMENT ON SCHEMA public IS 'standard public schema';
                        pg_database_owner    false    4            �            1259    24950    cluster_groups    TABLE     g   CREATE TABLE public.cluster_groups (
    cluster_id integer NOT NULL,
    group_id integer NOT NULL
);
 "   DROP TABLE public.cluster_groups;
       public         heap r       postgres    false    4            �            1259    24913    cluster_skills    TABLE     g   CREATE TABLE public.cluster_skills (
    cluster_id integer NOT NULL,
    skill_id integer NOT NULL
);
 "   DROP TABLE public.cluster_skills;
       public         heap r       postgres    false    4            �            1259    24891    clusters    TABLE     �   CREATE TABLE public.clusters (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    owner_id integer NOT NULL,
    max_affinity integer,
    group_size integer
);
    DROP TABLE public.clusters;
       public         heap r       postgres    false    4            �            1259    24890    clusters_id_seq    SEQUENCE     �   CREATE SEQUENCE public.clusters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.clusters_id_seq;
       public               postgres    false    222    4                       0    0    clusters_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.clusters_id_seq OWNED BY public.clusters.id;
          public               postgres    false    221            �            1259    24929    groups    TABLE     b   CREATE TABLE public.groups (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);
    DROP TABLE public.groups;
       public         heap r       postgres    false    4            �            1259    24928    groups_id_seq    SEQUENCE     �   CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.groups_id_seq;
       public               postgres    false    227    4                       0    0    groups_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;
          public               postgres    false    226            �            1259    24865    roles    TABLE     f   CREATE TABLE public.roles (
    id integer NOT NULL,
    role_name character varying(255) NOT NULL
);
    DROP TABLE public.roles;
       public         heap r       postgres    false    4            �            1259    24864    roles_id_seq    SEQUENCE     �   CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.roles_id_seq;
       public               postgres    false    4    218                       0    0    roles_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;
          public               postgres    false    217            �            1259    24905    skills    TABLE     b   CREATE TABLE public.skills (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);
    DROP TABLE public.skills;
       public         heap r       postgres    false    4            �            1259    24904    skills_id_seq    SEQUENCE     �   CREATE SEQUENCE public.skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.skills_id_seq;
       public               postgres    false    224    4                       0    0    skills_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.skills_id_seq OWNED BY public.skills.id;
          public               postgres    false    223            �            1259    24935    user_groups    TABLE     a   CREATE TABLE public.user_groups (
    user_id integer NOT NULL,
    group_id integer NOT NULL
);
    DROP TABLE public.user_groups;
       public         heap r       postgres    false    4            �            1259    24874    users    TABLE     6  CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    family_name character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    register_date date DEFAULT CURRENT_DATE NOT NULL,
    role_id integer
);
    DROP TABLE public.users;
       public         heap r       postgres    false    4            �            1259    24873    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    220    4                       0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    219            D           2604    24894    clusters id    DEFAULT     j   ALTER TABLE ONLY public.clusters ALTER COLUMN id SET DEFAULT nextval('public.clusters_id_seq'::regclass);
 :   ALTER TABLE public.clusters ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    222    221    222            F           2604    24932 	   groups id    DEFAULT     f   ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);
 8   ALTER TABLE public.groups ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    227    226    227            A           2604    24868    roles id    DEFAULT     d   ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);
 7   ALTER TABLE public.roles ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    218    217    218            E           2604    24908 	   skills id    DEFAULT     f   ALTER TABLE ONLY public.skills ALTER COLUMN id SET DEFAULT nextval('public.skills_id_seq'::regclass);
 8   ALTER TABLE public.skills ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    223    224    224            B           2604    24877    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    220    219    220                      0    24950    cluster_groups 
   TABLE DATA                 public               postgres    false    229   VD                  0    24913    cluster_skills 
   TABLE DATA                 public               postgres    false    225   pD       �          0    24891    clusters 
   TABLE DATA                 public               postgres    false    222   �D                 0    24929    groups 
   TABLE DATA                 public               postgres    false    227   �D       �          0    24865    roles 
   TABLE DATA                 public               postgres    false    218   �D       �          0    24905    skills 
   TABLE DATA                 public               postgres    false    224   !E                 0    24935    user_groups 
   TABLE DATA                 public               postgres    false    228   ;E       �          0    24874    users 
   TABLE DATA                 public               postgres    false    220   UE                  0    0    clusters_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.clusters_id_seq', 1, false);
          public               postgres    false    221                       0    0    groups_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.groups_id_seq', 1, false);
          public               postgres    false    226                       0    0    roles_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.roles_id_seq', 3, true);
          public               postgres    false    217                       0    0    skills_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.skills_id_seq', 1, false);
          public               postgres    false    223                       0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 1, false);
          public               postgres    false    219            ^           2606    24954 "   cluster_groups cluster_groups_pkey 
   CONSTRAINT     r   ALTER TABLE ONLY public.cluster_groups
    ADD CONSTRAINT cluster_groups_pkey PRIMARY KEY (cluster_id, group_id);
 L   ALTER TABLE ONLY public.cluster_groups DROP CONSTRAINT cluster_groups_pkey;
       public                 postgres    false    229    229            X           2606    24917 "   cluster_skills cluster_skills_pkey 
   CONSTRAINT     r   ALTER TABLE ONLY public.cluster_skills
    ADD CONSTRAINT cluster_skills_pkey PRIMARY KEY (cluster_id, skill_id);
 L   ALTER TABLE ONLY public.cluster_skills DROP CONSTRAINT cluster_skills_pkey;
       public                 postgres    false    225    225            P           2606    24898    clusters clusters_name_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.clusters
    ADD CONSTRAINT clusters_name_key UNIQUE (name);
 D   ALTER TABLE ONLY public.clusters DROP CONSTRAINT clusters_name_key;
       public                 postgres    false    222            R           2606    24896    clusters clusters_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.clusters
    ADD CONSTRAINT clusters_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.clusters DROP CONSTRAINT clusters_pkey;
       public                 postgres    false    222            Z           2606    24934    groups groups_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.groups DROP CONSTRAINT groups_pkey;
       public                 postgres    false    227            H           2606    24870    roles roles_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_pkey;
       public                 postgres    false    218            J           2606    24872    roles roles_role_name_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);
 C   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_role_name_key;
       public                 postgres    false    218            T           2606    24912    skills skills_name_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_name_key UNIQUE (name);
 @   ALTER TABLE ONLY public.skills DROP CONSTRAINT skills_name_key;
       public                 postgres    false    224            V           2606    24910    skills skills_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.skills DROP CONSTRAINT skills_pkey;
       public                 postgres    false    224            \           2606    24939    user_groups user_groups_pkey 
   CONSTRAINT     i   ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT user_groups_pkey PRIMARY KEY (user_id, group_id);
 F   ALTER TABLE ONLY public.user_groups DROP CONSTRAINT user_groups_pkey;
       public                 postgres    false    228    228            L           2606    24884    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public                 postgres    false    220            N           2606    24882    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    220            e           2606    24955 -   cluster_groups cluster_groups_cluster_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cluster_groups
    ADD CONSTRAINT cluster_groups_cluster_id_fkey FOREIGN KEY (cluster_id) REFERENCES public.clusters(id) ON DELETE CASCADE;
 W   ALTER TABLE ONLY public.cluster_groups DROP CONSTRAINT cluster_groups_cluster_id_fkey;
       public               postgres    false    4690    229    222            f           2606    24960 +   cluster_groups cluster_groups_group_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cluster_groups
    ADD CONSTRAINT cluster_groups_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;
 U   ALTER TABLE ONLY public.cluster_groups DROP CONSTRAINT cluster_groups_group_id_fkey;
       public               postgres    false    229    227    4698            a           2606    24918 -   cluster_skills cluster_skills_cluster_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cluster_skills
    ADD CONSTRAINT cluster_skills_cluster_id_fkey FOREIGN KEY (cluster_id) REFERENCES public.clusters(id) ON DELETE CASCADE;
 W   ALTER TABLE ONLY public.cluster_skills DROP CONSTRAINT cluster_skills_cluster_id_fkey;
       public               postgres    false    222    225    4690            b           2606    24923 +   cluster_skills cluster_skills_skill_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cluster_skills
    ADD CONSTRAINT cluster_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;
 U   ALTER TABLE ONLY public.cluster_skills DROP CONSTRAINT cluster_skills_skill_id_fkey;
       public               postgres    false    224    225    4694            `           2606    24899    clusters clusters_owner_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.clusters
    ADD CONSTRAINT clusters_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE SET NULL;
 I   ALTER TABLE ONLY public.clusters DROP CONSTRAINT clusters_owner_id_fkey;
       public               postgres    false    222    4686    220            c           2606    24945 %   user_groups user_groups_group_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT user_groups_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;
 O   ALTER TABLE ONLY public.user_groups DROP CONSTRAINT user_groups_group_id_fkey;
       public               postgres    false    227    228    4698            d           2606    24940 $   user_groups user_groups_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT user_groups_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.user_groups DROP CONSTRAINT user_groups_user_id_fkey;
       public               postgres    false    220    4686    228            _           2606    24885    users users_role_id_fkey    FK CONSTRAINT     w   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_role_id_fkey;
       public               postgres    false    220    4680    218               
   x���              
   x���          �   
   x���             
   x���          �   S   x���v
Q���W((M��L�+��I-Vs�	uV�0�QPOL���S״��$����$519#��(��@��%�)�y% �\\ TY*�      �   
   x���             
   x���          �   
   x���         