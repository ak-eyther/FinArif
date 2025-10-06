"use client"

import * as React from "react"
import { Plus, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { addCapitalSource } from "@/lib/data/capital-history-store"
import type { Cents } from "@/lib/types"

interface AddCapitalSourceDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface FormData {
  sourceName: string
  totalCapital: string
  annualRate: string
  effectiveDate: Date
  notes: string
}

interface FormErrors {
  sourceName?: string
  totalCapital?: string
  annualRate?: string
  effectiveDate?: string
  general?: string
}

export function AddCapitalSourceDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: AddCapitalSourceDialogProps) {
  const [formData, setFormData] = React.useState<FormData>({
    sourceName: "",
    totalCapital: "",
    annualRate: "",
    effectiveDate: new Date(),
    notes: "",
  })

  const [errors, setErrors] = React.useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setFormData({
        sourceName: "",
        totalCapital: "",
        annualRate: "",
        effectiveDate: new Date(),
        notes: "",
      })
      setErrors({})
      setIsSubmitting(false)
    }
  }, [isOpen])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Source Name validation
    if (!formData.sourceName.trim()) {
      newErrors.sourceName = "Source name is required"
    } else if (formData.sourceName.trim().length < 3) {
      newErrors.sourceName = "Source name must be at least 3 characters"
    }

    // Total Capital validation
    const capitalValue = parseFloat(formData.totalCapital)
    if (!formData.totalCapital.trim()) {
      newErrors.totalCapital = "Total capital is required"
    } else if (isNaN(capitalValue)) {
      newErrors.totalCapital = "Total capital must be a valid number"
    } else if (capitalValue <= 0) {
      newErrors.totalCapital = "Total capital must be greater than 0"
    }

    // Annual Rate validation
    const rateValue = parseFloat(formData.annualRate)
    if (!formData.annualRate.trim()) {
      newErrors.annualRate = "Annual interest rate is required"
    } else if (isNaN(rateValue)) {
      newErrors.annualRate = "Interest rate must be a valid number"
    } else if (rateValue < 0) {
      newErrors.annualRate = "Interest rate cannot be negative"
    } else if (rateValue > 100) {
      newErrors.annualRate = "Interest rate cannot exceed 100%"
    }

    // Effective Date validation
    const now = new Date()
    now.setHours(23, 59, 59, 999) // Set to end of today for comparison
    if (formData.effectiveDate > now) {
      newErrors.effectiveDate = "Effective date cannot be in the future"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      // Convert KES to cents (multiply by 100)
      const capitalInCents = Math.round(
        parseFloat(formData.totalCapital) * 100
      ) as Cents

      // Convert percentage to decimal (divide by 100)
      const rateDecimal = parseFloat(formData.annualRate) / 100

      // Call addCapitalSource
      addCapitalSource(
        {
          name: formData.sourceName.trim(),
          annualRate: rateDecimal,
          availableCents: capitalInCents,
          usedCents: 0 as Cents,
          remainingCents: capitalInCents,
        },
        formData.effectiveDate,
        formData.notes.trim() || undefined
      )

      // Success - notify parent and close dialog
      if (onSuccess) {
        onSuccess()
      }
      onOpenChange(false)
    } catch (error) {
      // Handle error
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add capital source"
      setErrors({ general: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldChange = (
    field: keyof FormData,
    value: string | Date
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field-specific error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field as keyof FormErrors]
        return newErrors
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Add Capital Source
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Capital Source</DialogTitle>
            <DialogDescription>
              Add a new capital source to track funding and calculate WACC.
              Effective date cannot be in the future.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* General Error */}
            {errors.general && (
              <div className="rounded-md bg-destructive/10 border border-destructive px-4 py-3 text-sm text-destructive">
                {errors.general}
              </div>
            )}

            {/* Source Name */}
            <div className="grid gap-2">
              <Label htmlFor="sourceName">
                Source Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sourceName"
                placeholder="e.g., Investor Loan"
                value={formData.sourceName}
                onChange={(e) =>
                  handleFieldChange("sourceName", e.target.value)
                }
                aria-invalid={!!errors.sourceName}
                disabled={isSubmitting}
              />
              {errors.sourceName && (
                <p className="text-sm text-destructive">
                  {errors.sourceName}
                </p>
              )}
            </div>

            {/* Total Capital */}
            <div className="grid gap-2">
              <Label htmlFor="totalCapital">
                Total Capital (KES) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="totalCapital"
                type="number"
                placeholder="e.g., 1000000"
                value={formData.totalCapital}
                onChange={(e) =>
                  handleFieldChange("totalCapital", e.target.value)
                }
                aria-invalid={!!errors.totalCapital}
                disabled={isSubmitting}
                min="0"
                step="0.01"
              />
              {errors.totalCapital && (
                <p className="text-sm text-destructive">
                  {errors.totalCapital}
                </p>
              )}
            </div>

            {/* Annual Interest Rate */}
            <div className="grid gap-2">
              <Label htmlFor="annualRate">
                Annual Interest Rate (%) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="annualRate"
                type="number"
                placeholder="e.g., 14"
                value={formData.annualRate}
                onChange={(e) =>
                  handleFieldChange("annualRate", e.target.value)
                }
                aria-invalid={!!errors.annualRate}
                disabled={isSubmitting}
                min="0"
                max="100"
                step="0.1"
              />
              {errors.annualRate && (
                <p className="text-sm text-destructive">
                  {errors.annualRate}
                </p>
              )}
            </div>

            {/* Effective Date */}
            <div className="grid gap-2">
              <Label htmlFor="effectiveDate">
                Effective Date <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !formData.effectiveDate && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                    type="button"
                  >
                    <CalendarIcon className="mr-2" />
                    {formData.effectiveDate ? (
                      format(formData.effectiveDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.effectiveDate}
                    onSelect={(date) =>
                      date && handleFieldChange("effectiveDate", date)
                    }
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.effectiveDate && (
                <p className="text-sm text-destructive">
                  {errors.effectiveDate}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="e.g., Series A funding round"
                value={formData.notes}
                onChange={(e) => handleFieldChange("notes", e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Capital Source"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
