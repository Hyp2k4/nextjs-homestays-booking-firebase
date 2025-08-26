"use client"

import { toast } from "sonner"
import { CheckCircle, XCircle, AlertCircle, Info, Heart, Share2, Copy, Bookmark } from "lucide-react"

// Toast notification utilities with consistent styling and icons
export const toastSystem = {
  // Success notifications
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      icon: <CheckCircle className="h-4 w-4" />,
      duration: 3000,
    })
  },

  // Error notifications
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      icon: <XCircle className="h-4 w-4" />,
      duration: 5000,
    })
  },

  // Warning notifications
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      icon: <AlertCircle className="h-4 w-4" />,
      duration: 4000,
    })
  },

  // Info notifications
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      icon: <Info className="h-4 w-4" />,
      duration: 3000,
    })
  },

  // Specialized notifications for homestay app
  wishlist: {
    added: (propertyName: string) => {
      toast.success(`Đã thêm vào yêu thích`, {
        description: propertyName,
        icon: <Heart className="h-4 w-4 fill-red-500 text-red-500" />,
        duration: 2000,
      })
    },
    removed: (propertyName: string) => {
      toast.info(`Đã xóa khỏi yêu thích`, {
        description: propertyName,
        icon: <Heart className="h-4 w-4" />,
        duration: 2000,
      })
    }
  },

  share: {
    copied: (itemName?: string) => {
      toast.success(`Đã sao chép link`, {
        description: itemName ? `${itemName}` : undefined,
        icon: <Copy className="h-4 w-4" />,
        duration: 2000,
      })
    },
    shared: (platform: string, itemName?: string) => {
      toast.success(`Đã chia sẻ lên ${platform}`, {
        description: itemName,
        icon: <Share2 className="h-4 w-4" />,
        duration: 2000,
      })
    }
  },

  booking: {
    started: () => {
      toast.info(`Bắt đầu đặt phòng`, {
        description: "Vui lòng điền đầy đủ thông tin",
        duration: 3000,
      })
    },
    success: (bookingId: string) => {
      toast.success(`Đặt phòng thành công!`, {
        description: `Mã đặt phòng: ${bookingId}`,
        duration: 5000,
        action: {
          label: "Xem chi tiết",
          onClick: () => {
            // Navigate to booking details
            window.location.href = `/booking/${bookingId}`
          }
        }
      })
    },
    cancelled: () => {
      toast.warning(`Đã hủy đặt phòng`, {
        description: "Bạn có thể đặt lại bất cứ lúc nào",
        duration: 3000,
      })
    }
  },

  search: {
    started: (query: string) => {
      toast.info(`Đang tìm kiếm...`, {
        description: query,
        duration: 2000,
      })
    },
    results: (count: number, query: string) => {
      toast.success(`Tìm thấy ${count} kết quả`, {
        description: query,
        duration: 3000,
      })
    },
    noResults: (query: string) => {
      toast.warning(`Không tìm thấy kết quả`, {
        description: `Thử tìm kiếm với từ khóa khác: "${query}"`,
        duration: 4000,
      })
    }
  },

  auth: {
    loginSuccess: (userName: string) => {
      toast.success(`Chào mừng trở lại!`, {
        description: `Xin chào ${userName}`,
        duration: 3000,
      })
    },
    loginError: () => {
      toast.error(`Đăng nhập thất bại`, {
        description: "Vui lòng kiểm tra lại thông tin",
        duration: 4000,
      })
    },
    registerSuccess: () => {
      toast.success(`Đăng ký thành công!`, {
        description: "Chào mừng bạn đến với Meap Homestay",
        duration: 4000,
      })
    },
    logoutSuccess: () => {
      toast.info(`Đã đăng xuất`, {
        description: "Hẹn gặp lại bạn!",
        duration: 2000,
      })
    }
  },

  promo: {
    copied: (code: string) => {
      toast.success(`Đã sao chép mã giảm giá`, {
        description: code,
        icon: <Copy className="h-4 w-4" />,
        duration: 3000,
      })
    },
    applied: (code: string, discount: string) => {
      toast.success(`Áp dụng mã thành công!`, {
        description: `${code} - Giảm ${discount}`,
        duration: 4000,
      })
    },
    expired: (code: string) => {
      toast.warning(`Mã giảm giá đã hết hạn`, {
        description: code,
        duration: 3000,
      })
    }
  },

  loading: {
    start: (message: string) => {
      return toast.loading(message, {
        duration: Infinity,
      })
    },
    update: (toastId: string | number, message: string, type: 'success' | 'error' | 'info' = 'success') => {
      if (type === 'success') {
        toast.success(message, { id: toastId })
      } else if (type === 'error') {
        toast.error(message, { id: toastId })
      } else {
        toast.info(message, { id: toastId })
      }
    },
    dismiss: (toastId: string | number) => {
      toast.dismiss(toastId)
    }
  },

  // Custom toast with action buttons
  custom: (message: string, options: {
    description?: string
    icon?: React.ReactNode
    action?: {
      label: string
      onClick: () => void
    }
    duration?: number
  }) => {
    toast(message, {
      description: options.description,
      icon: options.icon,
      duration: options.duration || 3000,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    })
  }
}

// Hook for common toast patterns
export const useToastActions = () => {
  const handleWishlistToggle = (propertyName: string, isWishlisted: boolean) => {
    if (isWishlisted) {
      toastSystem.wishlist.added(propertyName)
    } else {
      toastSystem.wishlist.removed(propertyName)
    }
  }

  const handleShare = async (url: string, title?: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toastSystem.share.copied(title)
    } catch (error) {
      toastSystem.error("Không thể sao chép link")
    }
  }

  const handleBookingFlow = (step: 'start' | 'success' | 'cancel', data?: any) => {
    switch (step) {
      case 'start':
        toastSystem.booking.started()
        break
      case 'success':
        toastSystem.booking.success(data?.bookingId)
        break
      case 'cancel':
        toastSystem.booking.cancelled()
        break
    }
  }

  const handleSearch = (query: string, results?: number) => {
    if (results === undefined) {
      toastSystem.search.started(query)
    } else if (results > 0) {
      toastSystem.search.results(results, query)
    } else {
      toastSystem.search.noResults(query)
    }
  }

  return {
    handleWishlistToggle,
    handleShare,
    handleBookingFlow,
    handleSearch,
    toast: toastSystem
  }
}

// Toast configuration for the app
export const toastConfig = {
  position: "top-right" as const,
  richColors: true,
  closeButton: true,
  duration: 3000,
  style: {
    background: "hsl(var(--background))",
    color: "hsl(var(--foreground))",
    border: "1px solid hsl(var(--border))",
  }
}
