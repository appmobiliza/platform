/**
 * Serviço de notícias da UFAL.
 *
 * Busca notícias do portal de notícias da UFAL (noticias.ufal.br)
 * usando a JSON API REST nativa do Plone CMS.
 *
 * @see https://noticias.ufal.br/@search
 */

export interface UfalNews {
	title: string
	url: string
	imageUrl: string | null
}

export interface FetchUfalNewsOptions {
	/** Tags para filtrar (ex.: ["acessibilidade", "inclusao"]) */
	tags?: string[]
	/** Quantidade máxima de notícias (default: 10) */
	limit?: number
}

const DEFAULT_TAGS = ["acessibilidade", "inclusão", "surdo", "PcD", "política de acessibilidade", "NAC"];

export async function fetchUfalNews(
	options: FetchUfalNewsOptions = {},
): Promise<UfalNews[]> {
	const { tags = DEFAULT_TAGS, limit = 10 } = options;

	const params = new URLSearchParams({
		sort_on: "Date",
		sort_order: "reverse",
		b_size: String(limit),
		metadata_fields: "image_scales",
	});

	for (const tag of tags) {
		params.append("Subject", tag);
	}

	const url = `https://noticias.ufal.br/@search?${params}`;
	const res = await fetch(url, { headers: { Accept: "application/json" } });

	if (!res.ok) {
		throw new Error(`Falha ao buscar notícias UFAL: ${res.status} ${res.statusText}`);
	}

	const data = await res.json() as {
		items: Array<{
			"@id": string;
			title: string;
			image_scales?: {
				image?: Array<{
					scales: Record<string, { download: string; width: number; height: number }>;
				}>;
			};
		}>;
	};

	return data.items.map((item): UfalNews => {
		const scales = item.image_scales?.image?.[0]?.scales ?? {};

		// Preferência: preview (400px) > mini (200px) > teaser (600px) > qualquer um
		const thumb =
			scales["preview"] ?? scales["mini"] ?? scales["teaser"] ?? Object.values(scales)[0];

		return {
			title: item.title,
			url: item["@id"],
			imageUrl: thumb ? `${item["@id"]}/${thumb.download}` : null,
		};
	});
}
