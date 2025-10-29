'use client'

import { useState } from 'react'
import { Application } from '@/lib/supabase/types'
import { Input } from '@/components/ui/input'
import { Search, Calendar, Building2, MapPin } from 'lucide-react'
import Link from 'next/link'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

interface ApplicationsListProps {
    initialApplications: Application[]
}

const STATUS_FILTERS = [
    { value: 'all', label: 'All Applications' },
    { value: 'not_applied', label: 'Not Applied' },
    { value: 'applied', label: 'Applied' },
    { value: 'interviewing', label: 'Interviewing' },
    { value: 'offer', label: 'Offer' },
    { value: 'rejected', label: 'Rejected' },
]

export default function ApplicationsList({ initialApplications }: ApplicationsListProps) {
    const [applications] = useState<Application[]>(initialApplications)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [sortBy, setSortBy] = useState<'date' | 'company' | 'match'>('date')

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

    return (
        <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="grid md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search by job title, company, or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-12 pl-10 border-gray-300 focus:border-transparent focus:ring-2 rounded-xl"
                                style={{ '--tw-ring-color': '#00e0ff' } as any}
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:border-transparent focus:ring-2 focus:outline-none"
                            style={{ '--tw-ring-color': '#00e0ff' } as any}
                        >
                            {STATUS_FILTERS.map((filter) => (
                                <option key={filter.value} value={filter.value}>
                                    {filter.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600 font-medium">Sort by:</span>
                    <div className="flex gap-2">
                        {[
                            { value: 'date', label: 'Date Added' },
                            { value: 'company', label: 'Company' },
                            { value: 'match', label: 'Match Score' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setSortBy(option.value as any)}
                                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${sortBy === option.value
                                        ? 'text-black'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }
                `}
                                style={sortBy === option.value ? { backgroundColor: '#00e0ff' } : {}}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{sortedApplications.length}</span> of{' '}
                    <span className="font-semibold">{applications.length}</span> applications
                </p>
            </div>

            {/* Applications Grid */}
            {sortedApplications.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 border border-gray-100 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: '#00e0ff20' }}>
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No applications found
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {searchQuery || statusFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Start tracking your job applications'}
                    </p>
                    {!searchQuery && statusFilter === 'all' && (
                        <Link href="/dashboard/applications/new">
                            <button
                                className="px-6 py-3 text-black font-semibold rounded-xl hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: '#00e0ff' }}
                            >
                                Add Your First Application
                            </button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {sortedApplications.map((app) => (
                        <ApplicationCard key={app.id} application={app} />
                    ))}
                </div>
            )}
        </div>
    )
}

function ApplicationCard({ application }: { application: Application }) {
    return (
        <Link href={`/dashboard/applications/${application.id}`}>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:border-gray-300 transition-all hover:shadow-md">
                <div className="flex items-start justify-between">
                    {/* Left Side - Job Info */}
                    <div className="flex-1">
                        <div className="flex items-start gap-4">
                            {/* Company Logo Placeholder */}
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-6 h-6 text-gray-600" />
                            </div>

                            {/* Job Details */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                                    {application.job_title}
                                </h3>
                                <p className="text-gray-600 mb-3">{application.company_name}</p>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                    {application.location && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{application.location}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Added {formatDate(application.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Status & Match */}
                    <div className="flex flex-col items-end gap-3 ml-4">
                        {/* Match Score */}
                        {application.match_score && (
                            <div className="text-right">
                                <div className="text-2xl font-bold" style={{ color: '#00e0ff' }}>
                                    {application.match_score}%
                                </div>
                                <div className="text-xs text-gray-500">Match</div>
                            </div>
                        )}

                        {/* Status Badge */}
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                application.status
                            )}`}
                        >
                            {getStatusLabel(application.status)}
                        </span>
                    </div>
                </div>

                {/* Notes Preview */}
                {application.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {application.notes}
                        </p>
                    </div>
                )}
            </div>
        </Link>
    )
}