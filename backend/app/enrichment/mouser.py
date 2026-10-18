"""Optional datasheet/spec enrichment via the Mouser Search API.

Free API key: https://www.mouser.com/api-hub/ (Search API). Without a key,
callers should fall back to `suppliers.supplier_links`.
"""
import httpx

MOUSER_SEARCH_URL = "https://api.mouser.com/api/v1/search/keyword"


async def search_part(query: str, api_key: str) -> dict | None:
    if not api_key:
        return None

    payload = {"SearchByKeywordRequest": {"keyword": query, "records": 1}}
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(MOUSER_SEARCH_URL, params={"apiKey": api_key}, json=payload)
        if resp.status_code != 200:
            return None
        data = resp.json()

    parts = (data.get("SearchResults") or {}).get("Parts") or []
    if not parts:
        return None

    top = parts[0]
    return {
        "manufacturer": top.get("Manufacturer"),
        "mpn": top.get("ManufacturerPartNumber"),
        "description": top.get("Description"),
        "datasheet_url": top.get("DataSheetUrl"),
        "image_url": top.get("ImagePath"),
        "price": (top.get("PriceBreaks") or [{}])[0].get("Price"),
    }
