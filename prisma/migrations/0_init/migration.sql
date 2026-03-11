-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "danger_type_category" AS ENUM ('dishonor', 'scandal', 'stress', 'wounds');

-- CreateEnum
CREATE TYPE "devotion_category" AS ENUM ('duty', 'desire');

-- CreateEnum
CREATE TYPE "document_category" AS ENUM ('Règles', 'Directives MJ', 'Campagne', 'Lore');

-- CreateEnum
CREATE TYPE "levels_category" AS ENUM ('Casual', 'Veteran', 'Esoteric');

-- CreateEnum
CREATE TYPE "mood_category" AS ENUM ('neutral', 'happy', 'sad', 'angry', 'scared', 'surprised', 'determined', 'hurt', 'mocking', 'focus');

-- CreateEnum
CREATE TYPE "pronouns_category" AS ENUM ('He/him', 'She/her', 'They/them');

-- CreateEnum
CREATE TYPE "species_category" AS ENUM ('Human', 'Dragon');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "password_hash" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_session" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_user_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_player" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_session_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "session_player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_session_id" UUID NOT NULL,
    "is_gm_message" BOOLEAN NOT NULL DEFAULT false,
    "author_user_id" UUID,
    "content" TEXT NOT NULL,
    "caption" TEXT,
    "selected_mood" "mood_category",
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_session_id" UUID NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "category" "document_category" NOT NULL,
    "title" VARCHAR NOT NULL,
    "file_type" VARCHAR NOT NULL DEFAULT 'PDF',
    "file_url" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "game_session_id" UUID NOT NULL,
    "species" "species_category" NOT NULL,
    "name" VARCHAR NOT NULL,
    "pronouns" "pronouns_category" NOT NULL,
    "appearance" TEXT,
    "position" VARCHAR NOT NULL,
    "nationality" VARCHAR,
    "service_record" VARCHAR,
    "station" VARCHAR,
    "temperament" VARCHAR,
    "distinctions" TEXT,
    "attr_body" INTEGER NOT NULL DEFAULT 0,
    "attr_cunning" INTEGER NOT NULL DEFAULT 0,
    "attr_manners" INTEGER NOT NULL DEFAULT 0,
    "attr_steel" INTEGER NOT NULL DEFAULT 0,
    "burden_duty" INTEGER NOT NULL DEFAULT 0,
    "burden_desire" INTEGER NOT NULL DEFAULT 0,
    "connections" TEXT,
    "bonds" TEXT,
    "traits" TEXT,
    "abilities" TEXT,
    "equipment" TEXT,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "description" TEXT,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_resources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "character_id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "character_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas_of_expertise" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "level" "levels_category" NOT NULL,

    CONSTRAINT "areas_of_expertise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_areas_of_expertise" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "character_id" UUID NOT NULL,
    "area_of_expertise_id" UUID NOT NULL,

    CONSTRAINT "character_areas_of_expertise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_dangers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "character_id" UUID NOT NULL,
    "danger_type" "danger_type_category" NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "track_size" INTEGER NOT NULL DEFAULT 3,
    "track_counter" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "character_dangers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devotions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "devotion_type" "devotion_category" NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "rank" INTEGER NOT NULL,
    "track_counter" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "devotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_devotions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "character_id" UUID NOT NULL,
    "devotion_id" UUID NOT NULL,
    "is_denied" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "character_devotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_skills" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "character_id" UUID NOT NULL,
    "attribute_name" VARCHAR NOT NULL,
    "skill_name" VARCHAR NOT NULL,
    "level" VARCHAR,

    CONSTRAINT "character_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avatars_mood" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "character_id" UUID NOT NULL,
    "mood_label" "mood_category",
    "image_url" VARCHAR,

    CONSTRAINT "avatars_mood_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_player_game_session_id_user_id_idx" ON "session_player"("game_session_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "character_resources_character_id_resource_id_idx" ON "character_resources"("character_id", "resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "character_areas_of_expertise_character_id_area_of_expertise_idx" ON "character_areas_of_expertise"("character_id", "area_of_expertise_id");

-- CreateIndex
CREATE UNIQUE INDEX "character_dangers_character_id_danger_type_idx" ON "character_dangers"("character_id", "danger_type");

-- CreateIndex
CREATE UNIQUE INDEX "character_devotions_character_id_devotion_id_idx" ON "character_devotions"("character_id", "devotion_id");

-- CreateIndex
CREATE UNIQUE INDEX "character_skills_character_id_skill_name_idx" ON "character_skills"("character_id", "skill_name");

-- AddForeignKey
ALTER TABLE "game_session" ADD CONSTRAINT "game_session_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "session_player" ADD CONSTRAINT "session_player_game_session_id_fkey" FOREIGN KEY ("game_session_id") REFERENCES "game_session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "session_player" ADD CONSTRAINT "session_player_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_game_session_id_fkey" FOREIGN KEY ("game_session_id") REFERENCES "game_session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "library_documents" ADD CONSTRAINT "library_documents_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "library_documents" ADD CONSTRAINT "library_documents_game_session_id_fkey" FOREIGN KEY ("game_session_id") REFERENCES "game_session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_game_session_id_fkey" FOREIGN KEY ("game_session_id") REFERENCES "game_session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "character_resources" ADD CONSTRAINT "character_resources_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "character_resources" ADD CONSTRAINT "character_resources_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "character_areas_of_expertise" ADD CONSTRAINT "character_areas_of_expertise_area_of_expertise_id_fkey" FOREIGN KEY ("area_of_expertise_id") REFERENCES "areas_of_expertise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "character_areas_of_expertise" ADD CONSTRAINT "character_areas_of_expertise_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "character_dangers" ADD CONSTRAINT "character_dangers_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "character_devotions" ADD CONSTRAINT "character_devotions_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "character_devotions" ADD CONSTRAINT "character_devotions_devotion_id_fkey" FOREIGN KEY ("devotion_id") REFERENCES "devotions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "character_skills" ADD CONSTRAINT "character_skills_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "avatars_mood" ADD CONSTRAINT "avatars_mood_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

