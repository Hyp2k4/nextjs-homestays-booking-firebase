import clsx from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatPrice(price: number) {
  return (
    new Intl.NumberFormat("vi-VN", {
      style: "decimal",
    }).format(price) + " VND"
  );
}

export function formatPhoneNumber(phone: string): string {
  if (phone.startsWith("0") && phone.length === 10) {
    return "+84" + phone.substring(1);
  }
  if (phone.startsWith("+84") && phone.length === 12) {
    return phone;
  }
  if (phone.length === 9 && !phone.startsWith("0")) {
    return "+84" + phone;
  }
  return phone;
}

export function removeDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function formatTimeRemaining(expiryDate: Date): string {
  return formatDistanceToNow(expiryDate, { addSuffix: true });
}
