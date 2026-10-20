import { SearchField } from "@/components/shared/search-field"

/**
 * The search box for the dashboard's lists.
 *
 * A thin wrapper rather than a copy: the field itself is shared with the
 * public archive, so both look and behave the same way.
 */
export function ListSearch({
  action,
  value = "",
  hidden = {},
  placeholder = "Search",
  label = "Search",
}) {
  return (
    <SearchField
      action={action}
      value={value}
      hidden={hidden}
      placeholder={placeholder}
      label={label}
    />
  )
}
