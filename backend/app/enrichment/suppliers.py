"""No-API-key-required supplier search links, used as reorder shortcuts and as a
fallback when no datasheet-lookup API key is configured."""
from urllib.parse import quote_plus


def supplier_links(query: str) -> dict[str, str]:
    q = quote_plus(query)
    return {
        "Mouser": f"https://www.mouser.com/c/?q={q}",
        "DigiKey": f"https://www.digikey.com/en/products/result?keywords={q}",
        "LCSC": f"https://www.lcsc.com/search?q={q}",
        "Octopart": f"https://octopart.com/search?q={q}",
    }
