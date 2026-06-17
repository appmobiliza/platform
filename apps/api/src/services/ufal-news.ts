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

const DEFAULT_TAGS = ["acessibilidade", "inclusÃo", "surdo", "PcD", "política de acessibilidade", "NAC"];

/**
 * Busca notícias do portal da UFAL.
 *
 * Faz uma requisição GET para o endpoint `@search` do Plone, que retorna
 * JSON com os campos solicitados via `metadata_fields`. A resposta inclui
 * `image_scales` com URLs de thumbnails.
 */
export async function fetchUfalNews(
	options: FetchUfalNewsOptions = {},
): Promise<UfalNews[]> {
	const { tags = DEFAULT_TAGS, limit = 10 } = options;

	const params = new URLSearchParams({
		portal_type: "Noticia",
		sort_on: "Date",
		sort_order: "reverse",
		b_size: String(limit),
		metadata_fields: "image_scales",
	});

	for (const tag of tags) {
		params.append("Subject:list", tag);
	}

	const url = `https://noticias.ufal.br/@search?${params}`;

	const res = await fetch(url, {
		headers: { Accept: "application/json" },
	});

	if (!res.ok) {
		throw new Error(`Falha ao buscar notícias UFAL: ${res.status} ${res.statusText}`);
	}

	const data = await res.json() as {
		items: Array<{
			"@id": string;
			title: string;
			image_scales?: {
				image?: Array<{
					download: string;
					width: number;
					height: number;
				}>;
			};
		}>;
	};

	return data.items.map((item): UfalNews => {
		const scales = item.image_scales?.image ?? [];
		// Pega a primeira thumbnail com largura <= 400px (ideal para mobile),
		// ou a primeira disponível se nenhuma for pequena.
		const thumb = scales.find((s) => s.width <= 400) ?? scales[0];

		return {
			title: item.title,
			url: item["@id"],
			imageUrl: thumb
				? `${item["@id"]}/${thumb.download}`
				: null,
		};
	});
}
