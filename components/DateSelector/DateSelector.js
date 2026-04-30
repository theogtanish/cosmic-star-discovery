"use client"

import * as React from "react"
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import styles from "./DateSelector.module.css"

/**
 * DateSelector component using shadcn Calendar
 * @param {Object} props
 * @param {Function} [props.onDateChange] - Callback when date changes
 */
export default function DateSelector({ onDateChange }) {
  const [date, setDate] = useState(new Date())

  const handleSelect = (newDate) => {
    if (!newDate) return
    setDate(newDate)
    if (onDateChange) {
      onDateChange(newDate)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.calendarWrapper}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          captionLayout="dropdown"
          className={styles.calendar}
        />
      </div>
      <div className={styles.selectedDate}>
        <span className={styles.label}>Selected Stardate:</span>
        <span className={styles.value}>
          {format(date, "EEEE, MMMM d, yyyy")}
        </span>
      </div>
    </div>
  )
}
