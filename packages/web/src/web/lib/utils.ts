import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export type PackageStatus =
  | "uploaded"
  | "pending_review"
  | "approved"
  | "rejected"
  | "shipment_requested"
  | "shipped";

export const STATUS_CONFIG: Record<
  PackageStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  uploaded: {
    label: "Uploaded",
    color: "text-blue-700",
    bg: "bg-blue-50",
    dot: "bg-blue-500",
  },
  pending_review: {
    label: "Pending Review",
    color: "text-amber-700",
    bg: "bg-amber-50",
    dot: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    color: "text-green-700",
    bg: "bg-green-50",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-700",
    bg: "bg-red-50",
    dot: "bg-red-500",
  },
  shipment_requested: {
    label: "Shipment Requested",
    color: "text-purple-700",
    bg: "bg-purple-50",
    dot: "bg-purple-500",
  },
  shipped: {
    label: "Shipped",
    color: "text-teal-700",
    bg: "bg-teal-50",
    dot: "bg-teal-500",
  },
};

export const TIMELINE_STEPS: { status: PackageStatus; label: string; description: string }[] = [
  { status: "pending_review", label: "Submitted", description: "Package details submitted for review" },
  { status: "approved", label: "Approved", description: "Invoice and package approved by admin" },
  { status: "shipment_requested", label: "Shipment Requested", description: "Client requested shipment" },
  { status: "shipped", label: "Shipped", description: "Package shipped and on the way" },
];
