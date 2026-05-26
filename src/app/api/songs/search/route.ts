import {
  MUSICBRAINZ_MAX_LIMIT,
  searchMusicBrainzRecordings,
  searchMusicBrainzRecordingsDeep,
} from "@/lib/musicbrainz";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const deep = searchParams.get("deep") === "1";
  const maxResults = Math.min(
    300,
    Math.max(1, Number(searchParams.get("max")) || (deep ? 200 : 100)),
  );

  if (query.length < 2) {
    return Response.json({ results: [], hasMore: false });
  }

  try {
    if (deep && offset === 0) {
      const results = await searchMusicBrainzRecordingsDeep(query, {
        maxResults,
      });
      return Response.json({ results, hasMore: false, total: results.length });
    }

    const limit = Math.min(MUSICBRAINZ_MAX_LIMIT, maxResults);
    const results = await searchMusicBrainzRecordings(query, { limit, offset });
    const hasMore = results.length >= limit;

    return Response.json({ results, hasMore, total: results.length });
  } catch {
    return Response.json(
      { error: "曲の検索に失敗しました。しばらくしてから再度お試しください。" },
      { status: 502 },
    );
  }
}
