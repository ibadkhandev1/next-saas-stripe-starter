import {
  FileText,
  LayoutGrid,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react"

import type { NavIcon } from "@/config/nav"

export const navIcons: Record<NavIcon, LucideIcon> = {
  dashboard: LayoutGrid,
  posts: FileText,
  trash: Trash2,
  profile: UserRound,
  shield: ShieldCheck,
  users: Users,
}