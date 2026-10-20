import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * A search field with the button inside it.
 *
 * A plain GET form rather than a fetch: the results are a URL you can share,
 * the back button works, and it needs no JavaScript. The button is a real
 * submit button inside the form, so pressing Enter in the field does the same
 * thing without a key handler.
 */
export function SearchField({
  // Where the form submits. The page reads the term back from the query.
  action,
  // The term currently in the query, so the box is not empty on load.
  value = "",
  // Anything else that must survive the search, as a hidden field.
  hidden = {},
  placeholder = "Search",
  label = "Search",
  className,
}) {
  return (
    <form
      action={action}
      method="get"
      role="search"
      className={cn("relative", className)}
    >
      {Object.entries(hidden).map(([name, fieldValue]) => (
        <input key={name} type="hidden" name={name} value={fieldValue} />
      ))}

      <Input
        type="search"
        name="search"
        defaultValue={value}
        placeholder={placeholder}
        aria-label={label}
        // Room for the button sitting on the right.
        className="pr-10"
      />

      <Button
        type="submit"
        size="icon-sm"
        variant="ghost"
        aria-label={label}
        className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        <Search aria-hidden />
      </Button>
    </form>
  )
}
