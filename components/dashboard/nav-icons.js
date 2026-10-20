import {
  FileClock,
  FileText,
  LayoutGrid,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from "lucide-react"

// Keyed by the `icon` field on each entry in config/nav.js. The allowed keys are
// listed in NAV_ICONS (config/constants.js) so an entry cannot name a glyph that
// does not exist here and render as a blank space.
export const navIcons = {
  dashboard: LayoutGrid,
  posts: FileText,
  drafts: FileClock,
  trash: Trash2,
  profile: UserRound,
  shield: ShieldCheck,
  users: Users,
}