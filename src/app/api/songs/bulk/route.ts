import { fetchStarterPackHits } from "@/lib/musicbrainz";
import { getStarterPack } from "@/lib/musicbrainz-starter-packs";

export const maxDuration = 120;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const packId = searchParams.get("pack")?.trim();

  if (!packId) {
    return Response.json({ error: "pack パラメータが必要です" }, { status: 400 });
  }

  if (!getStarterPack(packId)) {
    return Response.json({ error: "不明なパックです" }, { status: 404 });
  }

  try {
    const results = await fetchStarterPackHits(packId, getStarterPack);
    return Response.json({
      results,
      total: results.length,
      packId,
    });
  } catch {
    return Response.json(
      {
        error:
          "一括取得に失敗しました。時間をおいて再度お試しください（MusicBrainz のレート制限の可能性があります）。",
      },
      { status: 502 },
    );
  }
}
