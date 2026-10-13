// Out-of-range or malformed pages (?page=abc, ?page=99) fall back to a valid one.
export function paginate(items, rawPage, pageSize) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const requested = Math.floor(Number(rawPage))
  const page = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 1), pageCount)
    : 1
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageCount,
    total: items.length,
  }
}
