UPDATE "Novel" AS novel
SET "updatedAt" = latest."latestChapterUpdate"
FROM (
  SELECT
    "novelId",
    MAX(GREATEST("publishedAt", "updatedAt")) AS "latestChapterUpdate"
  FROM "Chapter"
  GROUP BY "novelId"
) AS latest
WHERE novel.id = latest."novelId"
  AND novel."updatedAt" < latest."latestChapterUpdate";
