import { ChevronLeft, ChevronRight } from 'lucide-react'
import Select from '../common/Select'
import { PAGE_SIZE_OPTIONS } from '../../constants'

export default function Pagination({ page, totalPages, total, pageSize, onPageChange, onPageSizeChange }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-text-secondary">
        {total === 0 ? 'No results' : `${total.toLocaleString()} question${total === 1 ? '' : 's'}`}
      </p>

      <div className="flex items-center gap-4">
        <Select
          className="w-auto"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>{size} / page</option>
          ))}
        </Select>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-border p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-text-secondary">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg border border-border p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
