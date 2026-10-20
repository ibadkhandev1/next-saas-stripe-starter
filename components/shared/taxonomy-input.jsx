"use client"

import { Plus, X } from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SUGGESTIONS_MAX_VISIBLE } from "@/config/constants"
import { fuzzyFilter } from "@/lib/fuzzy"
import { cn } from "@/lib/utils"

const KEY_ARROW_DOWN = "ArrowDown"
const KEY_ARROW_UP = "ArrowUp"
const KEY_ENTER = "Enter"
const KEY_ESCAPE = "Escape"
const KEY_COMMA = ","
const KEY_BACKSPACE = "Backspace"

// The suggestion list is portalled to the body, so it needs to clear whatever
// sits above it — the cards it is used in clip their own overflow.
const DROPDOWN_Z_INDEX = 50

// How far below the input the list sits, in pixels.
const DROPDOWN_GAP = 4

// The list never grows past this, and flips above the input when there is not
// room below.
const DROPDOWN_MAX_HEIGHT = 256
const DROPDOWN_VIEWPORT_MARGIN = 8

/**
 * A text field that suggests from a known vocabulary and allows inventing a new
 * entry.
 *
 * Written against plain React rather than a combobox primitive so the keyboard
 * contract — arrows to move, Enter to accept, comma to commit, Escape to close —
 * is visible in this file instead of spread across a library. It follows the
 * WAI-ARIA combobox pattern: the input keeps focus and `aria-activedescendant`
 * points at the highlighted option.
 */
export function TaxonomyInput({
  id,
  label,
  hint,
  error,
  options = [],
  // A category is one string; tags are a list.
  value,
  onChange,
  multiple = false,
  // Stops more being added. A single input ignores this — it simply replaces.
  maxItems = Number.POSITIVE_INFINITY,
  // Trims, de-duplicates by lower case, and caps length before accepting.
  maxLength = 100,
  minLength = 1,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  // Where the suggestion list goes. It is portalled to the body, so it needs
  // coordinates of its own rather than relying on the flow.
  const [position, setPosition] = useState(null)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const listboxId = useId()

  // Memoised so the array identity is stable between renders: the suggestion
  // list below is keyed off it, and a fresh array each pass would re-filter and
  // reset the highlight on every keystroke.
  const selected = useMemo(
    () => (multiple ? (value ?? []) : value ? [value] : []),
    [multiple, value]
  )

  const suggestions = useMemo(() => {
    const taken = new Set(selected.map((item) => item.toLowerCase()))
    const available = options.filter(
      (option) => !taken.has(option.toLowerCase())
    )
    return fuzzyFilter(available, query).slice(0, SUGGESTIONS_MAX_VISIBLE)
  }, [options, query, selected])

  // The row for typing something that does not exist yet, shown only when the
  // text is usable and is not already a suggestion.
  const trimmedQuery = query.trim()
  const canCreate =
    trimmedQuery.length >= minLength &&
    trimmedQuery.length <= maxLength &&
    !options.some(
      (option) => option.toLowerCase() === trimmedQuery.toLowerCase()
    )

  const rows = useMemo(() => {
    const list = suggestions.map((name) => ({ kind: "existing", name }))
    if (canCreate) list.push({ kind: "create", name: trimmedQuery })
    return list
  }, [suggestions, canCreate, trimmedQuery])

  // A popup that cannot be reached is a popup nobody asked for.
  const isOpen = open && rows.length > 0

  function commit(name) {
    const clean = name.trim().slice(0, maxLength)
    if (!clean || clean.length < minLength) return false

    if (multiple) {
      if ((value ?? []).length >= maxItems) return false
      const alreadyThere = (value ?? []).some(
        (item) => item.toLowerCase() === clean.toLowerCase()
      )
      if (alreadyThere) return false
      onChange([...(value ?? []), clean])
      // The chips already show what was added, and the box stays open so the
      // next tag can go straight in.
      setQuery("")
    } else {
      onChange(clean)
      // With no chips to show it, the committed value has to stay in the input —
      // clearing the box would leave it looking like nothing had been chosen.
      setQuery(clean)
      setOpen(false)
    }

    setActiveIndex(0)
    return true
  }

  function remove(name) {
    if (!multiple) {
      onChange("")
      setQuery("")
      return
    }
    onChange((value ?? []).filter((item) => item.toLowerCase() !== name.toLowerCase()))
  }

  function handleKeyDown(event) {
    if (!isOpen) {
      // Enter with nothing highlighted still commits a new entry.
      if (event.key === KEY_ENTER && canCreate) {
        event.preventDefault()
        commit(trimmedQuery)
      }
      if (event.key === KEY_ARROW_DOWN) setOpen(true)
      return
    }

    switch (event.key) {
      case KEY_ARROW_DOWN:
        event.preventDefault()
        setActiveIndex((index) => (index + 1) % rows.length)
        break
      case KEY_ARROW_UP:
        event.preventDefault()
        setActiveIndex((index) => (index - 1 + rows.length) % rows.length)
        break
      case KEY_ENTER: {
        event.preventDefault()
        const row = rows[activeIndex]
        if (row) commit(row.name)
        break
      }
      case KEY_ESCAPE:
        event.preventDefault()
        setOpen(false)
        break
      case KEY_COMMA:
        // Comma is the separator people type out of habit from a plain input.
        if (canCreate) {
          event.preventDefault()
          commit(trimmedQuery)
        }
        break
      case KEY_BACKSPACE:
        // Backspace on an empty box takes the last chip back, the way chip
        // inputs behave everywhere else.
        if (multiple && query === "" && selected.length > 0) {
          remove(selected[selected.length - 1])
        }
        break
      default:
        break
    }
  }

  // Clicking away closes the list. Without this the dropdown survives a click
  // on the page behind it. The list is portalled, so it is checked separately.
  useEffect(() => {
    if (!isOpen) return

    function onPointerDown(event) {
      const inField = containerRef.current?.contains(event.target)
      const inList = listRef.current?.contains(event.target)
      if (!inField && !inList) setOpen(false)
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [isOpen])

  // The list is portalled and positioned against the viewport, so it has to be
  // moved whenever the page scrolls or the window resizes.
  useEffect(() => {
    // The stale position is left in place on close: the list only renders while
    // open, and opening re-measures it.
    if (!isOpen) return

    function measure() {
      const rect = inputRef.current?.getBoundingClientRect()
      if (!rect) return

      const spaceBelow = window.innerHeight - rect.bottom - DROPDOWN_VIEWPORT_MARGIN
      const flip = spaceBelow < DROPDOWN_MAX_HEIGHT && rect.top > spaceBelow
      const maxHeight = Math.min(
        DROPDOWN_MAX_HEIGHT,
        flip
          ? rect.top - DROPDOWN_VIEWPORT_MARGIN - DROPDOWN_GAP
          : spaceBelow
      )

      setPosition({
        top: flip ? rect.top - maxHeight - DROPDOWN_GAP : rect.bottom + DROPDOWN_GAP,
        left: rect.left,
        width: rect.width,
        maxHeight: Math.max(maxHeight, 0),
      })
    }

    measure()
    window.addEventListener("scroll", measure, true)
    window.addEventListener("resize", measure)
    return () => {
      window.removeEventListener("scroll", measure, true)
      window.removeEventListener("resize", measure)
    }
  }, [isOpen])

  const isAtLimit = multiple && (value ?? []).length >= maxItems

  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      <Label htmlFor={id}>{label}</Label>

      {multiple && selected.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <li key={item}>
              <Badge variant="secondary" className="gap-1 pr-1">
                {item}
                <button
                  type="button"
                  onClick={() => remove(item)}
                  aria-label={`Remove ${item}`}
                  className="cursor-pointer rounded-full p-0.5 hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <X className="size-3" aria-hidden />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <Input
          id={id}
          ref={inputRef}
          value={query}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            isOpen && rows[activeIndex]
              ? `${listboxId}-${activeIndex}`
              : undefined
          }
          aria-invalid={Boolean(error)}
          autoComplete="off"
          placeholder={
            isAtLimit ? "Limit reached" : multiple ? "Type and press comma" : "Type a category"
          }
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
            setActiveIndex(0)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(isAtLimit && "opacity-60")}
        />

        {isOpen &&
          position &&
          createPortal(
            <ul
              id={listboxId}
              ref={listRef}
              role="listbox"
              style={{
                position: "fixed",
                top: position.top,
                left: position.left,
                width: position.width,
                maxHeight: position.maxHeight,
                zIndex: DROPDOWN_Z_INDEX,
              }}
              className="overflow-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
            >
              {rows.map((row, index) => (
                <li
                  key={`${row.kind}-${row.name}`}
                  id={`${listboxId}-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => {
                    // mousedown, not click: blur would close the list first.
                    event.preventDefault()
                    commit(row.name)
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                    index === activeIndex && "bg-accent text-accent-foreground"
                  )}
                >
                  {row.kind === "create" && (
                    <Plus className="size-3.5 shrink-0" aria-hidden />
                  )}
                  <span className="truncate">{row.name}</span>
                  {row.kind === "create" && (
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      new
                    </span>
                  )}
                </li>
              ))}
            </ul>,
            document.body
          )}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-sm text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}