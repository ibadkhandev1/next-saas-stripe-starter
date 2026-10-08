import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

// Takes any object with a name and an optional image, so it works for the
// signed-in user and for the admin's list of authors alike.
export function UserAvatar({
  user,
  className,
  fallbackClassName,
}: {
  user: { name: string; image: string | null } | undefined
  className?: string
  fallbackClassName?: string
}) {
  return (
    <Avatar className={className}>
      {user?.image && <AvatarImage src={user.image} alt="" />}
      <AvatarFallback className={cn(fallbackClassName)}>
        {user ? getInitials(user.name) : "?"}
      </AvatarFallback>
    </Avatar>
  )
}
