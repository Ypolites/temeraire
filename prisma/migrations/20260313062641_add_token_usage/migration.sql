-- CreateTable
CREATE TABLE "token_usage" (
    "id" SERIAL NOT NULL,
    "session_id" UUID NOT NULL,
    "author" VARCHAR NOT NULL DEFAULT 'gm',
    "input_tokens" INTEGER NOT NULL,
    "output_tokens" INTEGER NOT NULL,
    "cache_creation_tokens" INTEGER NOT NULL DEFAULT 0,
    "cache_read_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_billed_tokens" INTEGER NOT NULL,
    "summary_triggered" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_usage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "token_usage" ADD CONSTRAINT "token_usage_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "game_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
