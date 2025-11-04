//lib/utils
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  } catch (error) {
    return 'Invalid Date'
  }
}

export function formatDateLong(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  } catch (error) {
    return 'Invalid Date'
  }
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  
  try {
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return formatDate(date)
  } catch (error) {
    return 'Invalid Date'
  }
}

export function getStatusColor(status: string | null): string {
  const colors: Record<string, string> = {
    not_applied: 'bg-gray-100 text-gray-700 border-gray-200',
    applied: 'bg-blue-100 text-blue-700 border-blue-200',
    interviewing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    offer: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    withdrawn: 'bg-gray-100 text-gray-500 border-gray-200',
  }
  return colors[status || 'not_applied'] || colors.not_applied
}

export function getStatusLabel(status: string | null): string {
  const labels: Record<string, string> = {
    not_applied: 'Not Applied',
    applied: 'Applied',
    interviewing: 'Interviewing',
    offer: 'Offer',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  }
  return labels[status || 'not_applied'] || 'Not Applied'
}

export function getMatchScoreColor(score: number | null): string {
  if (!score) return 'text-gray-600'
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export function getMatchScoreBadge(score: number | null): string {
  if (!score) return 'No Match Data'
  if (score >= 80) return 'Excellent Match'
  if (score >= 60) return 'Good Match'
  return 'Fair Match'
}

export function getMatchScoreBg(score: number | null): string {
  if (!score) return 'bg-gray-50 border-gray-200'
  if (score >= 80) return 'bg-green-50 border-green-200'
  if (score >= 60) return 'bg-yellow-50 border-yellow-200'
  return 'bg-red-50 border-red-200'
}

export function truncateText(text: string | null, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function capitalizeFirst(str: string | null): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular
  return plural || `${singular}s`
}

export async function syncUserSubscription(userId: string) {
  try {
    const response = await fetch('/api/sync-subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Sync failed:', data)
      return false
    }

    console.log('✅ Subscription synced:', data)
    return true
  } catch (error) {
    console.error('Sync error:', error)
    return false
  }
}
