'use client'

import { useState, useRef, useEffect } from 'react'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string
}

interface CustomerAutocompleteProps {
  customers: Customer[]
  value: string | null
  onChange: (customerId: string | null) => void
  placeholder?: string
  required?: boolean
}

export default function CustomerAutocomplete({
  customers,
  value,
  onChange,
  placeholder = 'Search customers...',
  required = false,
}: CustomerAutocompleteProps) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedCustomer = value ? customers.find(c => c.id === value) : null

  useEffect(() => {
    if (selectedCustomer) {
      setInputValue(`${selectedCustomer.firstName} ${selectedCustomer.lastName}`)
    }
  }, [selectedCustomer, value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    if (value.trim() === '') {
      setFilteredCustomers([])
      setIsOpen(false)
      onChange(null)
      return
    }

    const filtered = customers.filter(c => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase()
      const email = c.email?.toLowerCase() || ''
      const phone = c.phone?.toLowerCase() || ''
      const searchTerm = value.toLowerCase()
      return fullName.includes(searchTerm) || email.includes(searchTerm) || phone.includes(searchTerm)
    })

    setFilteredCustomers(filtered)
    setIsOpen(true)
  }

  const handleSelectCustomer = (customer: Customer) => {
    setInputValue(`${customer.firstName} ${customer.lastName}`)
    setIsOpen(false)
    onChange(customer.id)
  }

  const handleClear = () => {
    setInputValue('')
    setIsOpen(false)
    setFilteredCustomers([])
    onChange(null)
    inputRef.current?.focus()
  }

  const displayValue = inputValue

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (filteredCustomers.length > 0) setIsOpen(true)
          }}
          placeholder={placeholder}
          required={required && !selectedCustomer}
          className={`w-full px-3 py-2 pr-8 border ${required && !selectedCustomer ? 'border-red-300' : 'border-gray-300'} rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        />
        {selectedCustomer && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && filteredCustomers.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredCustomers.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => handleSelectCustomer(customer)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
            >
              <div className="font-medium text-gray-900">
                {customer.firstName} {customer.lastName}
              </div>
              {customer.email && (
                <div className="text-xs text-gray-500">{customer.email}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && inputValue && filteredCustomers.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="text-sm text-gray-500">No customers found</div>
        </div>
      )}
    </div>
  )
}
