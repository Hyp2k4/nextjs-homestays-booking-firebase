"use client"

import { 
  Home,
  MapPin,
  Calendar,
  Users,
  Star,
  Heart,
  Share2,
  Search,
  Filter,
  Grid,
  List,
  Phone,
  Mail,
  Wifi,
  Car,
  Coffee,
  Waves,
  Shield,
  Award,
  Crown,
  Gift,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  X,
  Check,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Menu,
  User,
  Settings,
  LogOut,
  Camera,
  Upload,
  Download,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Bookmark,
  MessageCircle,
  Bell,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Zap,
  Flame,
  Percent,
  DollarSign,
  CreditCard,
  Banknote,
  type LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

// Icon size variants
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl"

const iconSizes: Record<IconSize, string> = {
  xs: "h-3 w-3",
  sm: "h-4 w-4", 
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8"
}

// Base icon component with consistent sizing and styling
export const Icon = ({ 
  icon: IconComponent, 
  size = "md", 
  className,
  ...props 
}: {
  icon: LucideIcon
  size?: IconSize
  className?: string
} & React.ComponentProps<LucideIcon>) => {
  return (
    <IconComponent 
      className={cn(iconSizes[size], className)} 
      {...props} 
    />
  )
}

// Semantic icon components for common use cases
export const NavigationIcons = {
  Home: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Home} {...props} />,
  Search: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Search} {...props} />,
  Menu: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Menu} {...props} />,
  User: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={User} {...props} />,
  Settings: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Settings} {...props} />,
  LogOut: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={LogOut} {...props} />
}

export const PropertyIcons = {
  Location: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={MapPin} {...props} />,
  Calendar: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Calendar} {...props} />,
  Guests: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Users} {...props} />,
  Rating: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Star} {...props} />,
  Wishlist: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Heart} {...props} />,
  Share: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Share2} {...props} />,
  View: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Eye} {...props} />
}

export const AmenityIcons = {
  Wifi: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Wifi} {...props} />,
  Parking: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Car} {...props} />,
  Breakfast: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Coffee} {...props} />,
  Pool: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Waves} {...props} />,
  Security: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Shield} {...props} />
}

export const ActionIcons = {
  Filter: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Filter} {...props} />,
  Grid: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Grid} {...props} />,
  List: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={List} {...props} />,
  Edit: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Edit} {...props} />,
  Delete: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Trash2} {...props} />,
  Copy: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Copy} {...props} />,
  Upload: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Upload} {...props} />,
  Download: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Download} {...props} />
}

export const StatusIcons = {
  Success: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={CheckCircle} {...props} />,
  Error: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={XCircle} {...props} />,
  Warning: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={AlertCircle} {...props} />,
  Info: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Info} {...props} />,
  Loading: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Clock} {...props} />
}

export const NavigationArrows = {
  Left: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={ChevronLeft} {...props} />,
  Right: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={ChevronRight} {...props} />,
  Up: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={ChevronUp} {...props} />,
  Down: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={ChevronDown} {...props} />
}

export const PromotionIcons = {
  Gift: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Gift} {...props} />,
  Flash: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Zap} {...props} />,
  Hot: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Flame} {...props} />,
  Percent: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Percent} {...props} />,
  Crown: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Crown} {...props} />
}

export const ContactIcons = {
  Phone: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Phone} {...props} />,
  Email: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Mail} {...props} />,
  Message: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={MessageCircle} {...props} />,
  Notification: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Bell} {...props} />
}

export const PaymentIcons = {
  Card: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={CreditCard} {...props} />,
  Cash: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={Banknote} {...props} />,
  Dollar: (props: { size?: IconSize; className?: string }) => 
    <Icon icon={DollarSign} {...props} />
}

// Icon with tooltip component
export const IconWithTooltip = ({ 
  icon: IconComponent,
  tooltip,
  size = "md",
  className,
  ...props
}: {
  icon: LucideIcon
  tooltip: string
  size?: IconSize
  className?: string
} & React.ComponentProps<LucideIcon>) => {
  return (
    <div className="relative group">
      <Icon 
        icon={IconComponent} 
        size={size} 
        className={cn("cursor-help", className)} 
        {...props} 
      />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {tooltip}
      </div>
    </div>
  )
}

// Animated icon component
export const AnimatedIcon = ({ 
  icon: IconComponent,
  animation = "pulse",
  size = "md",
  className,
  ...props
}: {
  icon: LucideIcon
  animation?: "pulse" | "bounce" | "spin" | "ping"
  size?: IconSize
  className?: string
} & React.ComponentProps<LucideIcon>) => {
  const animationClasses = {
    pulse: "animate-pulse",
    bounce: "animate-bounce", 
    spin: "animate-spin",
    ping: "animate-ping"
  }

  return (
    <Icon 
      icon={IconComponent} 
      size={size} 
      className={cn(animationClasses[animation], className)} 
      {...props} 
    />
  )
}

// Icon button component
export const IconButton = ({ 
  icon: IconComponent,
  size = "md",
  variant = "ghost",
  className,
  children,
  ...props
}: {
  icon: LucideIcon
  size?: IconSize
  variant?: "ghost" | "outline" | "default"
  className?: string
  children?: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const variantClasses = {
    ghost: "hover:bg-muted",
    outline: "border border-border hover:bg-muted",
    default: "bg-primary text-primary-foreground hover:bg-primary/90"
  }

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md p-2 transition-colors",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <Icon icon={IconComponent} size={size} />
      {children}
    </button>
  )
}
