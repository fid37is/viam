'use client'

import { useState, useEffect } from 'react'
import { Application } from '@/lib/supabase/types'
import { Input } from '@/components/ui/input'
import { Search, Calendar, MapPin, Trash2, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { toast } from 'sonner'

interface ApplicationsListProps {
  initialApplications: Application[]
  userPlan: 'free' | 'premium'
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All Applications' },
  { value: 'not_applied', label: 'Not Applied' },
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
]

const ITEMS_PER_PAGE = 10

export default function ApplicationsList({ initialApplications, userPlan }: ApplicationsListProps) {
  const [applications] = useState<Application[]>(initialApplications)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'match'>('date')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletionsRemaining, setDeletionsRemaining] = useState(0)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [blockReason, setBlockReason] = useState<'too_new' | 'limit_reached' | null>(null)

  // Check which apps can be deleted
  const tooNewApps = selectedIds.filter(id => {
    const app = applications.find(a => a.id === id)
    if (!app || !app.created_at) return false
    const daysOld = Math.floor((Date.now() - new Date(app.created_at).getTime()) / (1000 * 60 * 60 * 24))
    return daysOld < 14
  })

  const canDeleteAll = userPlan === 'premium' || (deletionsRemaining > 0 && tooNewApps.length === 0)
  const canDelete = selectedIds.length > 0

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    } else if (sortBy === 'company') {
      return a.company_name.localeCompare(b.company_name)
    } else if (sortBy === 'match') {
      return (b.match_score || 0) - (a.match_score || 0)
    }
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedApplications.length / ITEMS_PER_PAGE)
  const paginatedApplications = sortedApplications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    )
  }

  // Select all on current page
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedApplications.length && paginatedApplications.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(paginatedApplications.map(app => app.id))
    }
  }

  // Handle delete
  const handleDelete = async () => {
    // Check for too new apps on free tier
    if (userPlan === 'free' && tooNewApps.length > 0) {
      setBlockReason('too_new')
      setShowUpgradeModal(true)
      return
    }

    // Check deletion limit on free tier
    if (userPlan === 'free' && deletionsRemaining <= 0) {
      setBlockReason('limit_reached')
      setShowUpgradeModal(true)
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch('/api/applications/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, userPlan }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.message || 'Failed to delete applications')
        return
      }

      const data = await response.json()
      
      toast.success(`${selectedIds.length} application${selectedIds.length !== 1 ? 's' : ''} deleted`)
      setSelectedIds([])
      
      // Update deletions remaining for free tier
      if (userPlan === 'free' && data.deletionsRemaining !== undefined) {
        setDeletionsRemaining(data.deletionsRemaining)
      }

      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete applications')
    } finally {
      setIsDeleting(false)
    }
  }

  // Fetch deletion limit on mount
  useEffect(() => {
    if (userPlan === 'free') {
      fetch('/api/applications/delete-limit')
        .then(res => res.json())
        .then(data => setDeletionsRemaining(data.remaining || 0))
        .catch(() => setDeletionsRemaining(0))
    }
  }, [userPlan])

  const isAllSelected = selectedIds.length === paginatedApplications.length && paginatedApplications.length > 0

  return (
    <div className="space-y-6">
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl border border-border max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {blockReason === 'too_new' ? 'Too Recent to Delete' : 'Deletion Limit Reached'}
              </h2>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              {blockReason === 'too_new'
                ? 'Free users can only delete applications older than 14 days. This helps you make thoughtful decisions about your job search.'
                : `You've reached your monthly deletion limit of 10. Upgrade to Premium for unlimited deletions and more features.`}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <Link href="/pricing" className="flex-1">
                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  Upgrade to Premium
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Free Tier Warning */}
      {userPlan === 'free' && (
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-200 dark:border-blue-900/40 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Free tier deletions: <span className="font-bold">{deletionsRemaining} of 10</span> remaining this month
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
              • Can only delete apps older than 14 days • Resets every 30 days • Premium has unlimited
            </p>
          </div>
        </div>
      )}
      {/* Filters and Search */}
      <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by job title, company, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-10 border-border focus:border-transparent focus:ring-2 focus:ring-ring rounded-xl bg-background text-foreground"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 px-4 border border-border rounded-xl focus:border-transparent focus:ring-2 focus:ring-ring focus:outline-none bg-background text-foreground"
          >
            {STATUS_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground font-medium">Sort by:</span>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'date', label: 'Date Added' },
              { value: 'company', label: 'Company' },
              { value: 'match', label: 'Match Score' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count & Selection Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {/* Select All */}
          {paginatedApplications.length > 0 && (
            <div className="flex items-center gap-3">
              <div
                onClick={toggleSelectAll}
                className={`w-5 h-5 rounded border-2 cursor-pointer transition-all flex items-center justify-center ${
                  isAllSelected ? 'bg-primary border-primary' : 'border-border hover:border-primary/50'
                }`}
              >
                {isAllSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          {/* Delete Button */}
          {selectedIds.length > 0 && (
            <button
              onClick={handleDelete}
              disabled={!canDeleteAll || isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={
                userPlan === 'free' && tooNewApps.length > 0
                  ? `${tooNewApps.length} app(s) must be older than 14 days`
                  : userPlan === 'free' && deletionsRemaining <= 0
                    ? 'Monthly deletion limit reached'
                    : ''
              }
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </button>
          )}

          {/* Applications Count */}
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{sortedApplications.length}</span> Total Applications
          </p>
        </div>
      </div>

      {/* Applications List */}
      {paginatedApplications.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-sm p-12 border border-border text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No applications found
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Start tracking your job applications'}
          </p>
        </div>
      ) : (
        <div>
          {/* Applications */}
          {paginatedApplications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              isSelected={selectedIds.includes(app.id)}
              onToggleSelect={() => toggleSelection(app.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border hover:bg-muted'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

function ApplicationCard({
  application,
  isSelected,
  onToggleSelect,
}: {
  application: Application
  isSelected: boolean
  onToggleSelect: () => void
}) {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <Link href={`/dashboard/applications/${application.id}`}>
      <div className="relative">
        <div
          className={`relative border rounded-lg transition-all pl-12 p-4 ${
            isSelected
              ? 'bg-primary/5 border-primary/50'
              : isHovering
                ? 'bg-accent/5 border-border'
                : 'bg-transparent border-border'
          }`}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Checkbox on Left Margin */}
          <div
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleSelect()
            }}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded border-2 border-border cursor-pointer transition-all flex items-center justify-center ${
              isSelected ? 'bg-primary border-primary' : isHovering ? 'border-primary/50' : ''
            } ${isHovering || isSelected ? 'opacity-100' : 'opacity-0'}`}
          >
            {isSelected && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          {/* Job Details - Horizontal Layout */}
          <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Job Title & Company */}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate">
                {application.job_title}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {application.company_name}
              </p>
            </div>

            {/* Location */}
            {application.location && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{application.location}</span>
              </div>
            )}

            {/* Date Added */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{formatDate(application.created_at)}</span>
            </div>

            {/* Match Score & Status */}
            <div className="flex items-center justify-between gap-4">
              {application.match_score && (
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">
                    {application.match_score}%
                  </div>
                  <div className="text-xs text-muted-foreground">Match</div>
                </div>
              )}

              <span
                className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                  application.status
                )}`}
              >
                {getStatusLabel(application.status)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4" />
    </Link>
  )
}