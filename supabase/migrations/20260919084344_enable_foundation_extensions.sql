-- ThiKorben shared database foundation extensions

create schema if not exists extensions;
create schema if not exists gis;

-- Typo/fuzzy search
create extension if not exists pg_trgm
with schema extensions;

-- AI embeddings / semantic product search
create extension if not exists vector
with schema extensions;

-- Geospatial queries for workers, jobs, distance and nearby search
create extension if not exists postgis
with schema gis;