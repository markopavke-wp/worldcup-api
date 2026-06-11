-- Nullable tačan rezultat; ishod je uvek obavezan
ALTER TABLE "predictions" ALTER COLUMN "home_score_pred" DROP NOT NULL;
ALTER TABLE "predictions" ALTER COLUMN "away_score_pred" DROP NOT NULL;

UPDATE "predictions"
SET "home_score_pred" = NULL, "away_score_pred" = NULL
WHERE "is_outcome_only" = true;

ALTER TABLE "predictions" DROP COLUMN "is_outcome_only";
