"use client"

import React, { useLayoutEffect, useRef } from "react"
import { AnnotationHandler, InnerPre, getPreRef } from "codehike/code"

/**
 * Pre wrapper that scrolls to focused lines (data-focus="true").
 * Use as focus handler's PreWithRef.
 */
export const PreWithFocus: NonNullable<
  AnnotationHandler["PreWithRef"]
> = (props) => {
  const ref = getPreRef(props)
  useScrollToFocus(ref)
  return <InnerPre merge={props} {...props} />
}

function useScrollToFocus(ref: React.RefObject<HTMLElement | null>) {
  const firstRender = useRef(true)
  useLayoutEffect(() => {
    if (!ref.current) return
    const focusedElements = ref.current.querySelectorAll(
      '[data-focus="true"]'
    ) as NodeListOf<HTMLElement>
    if (focusedElements.length === 0) return

    const containerRect = ref.current.getBoundingClientRect()
    let top = Infinity
    let bottom = -Infinity
    focusedElements.forEach((el) => {
      const rect = el.getBoundingClientRect()
      top = Math.min(top, rect.top - containerRect.top)
      bottom = Math.max(bottom, rect.bottom - containerRect.top)
    })

    if (bottom > containerRect.height || top < 0) {
      ref.current.scrollTo({
        top: ref.current.scrollTop + top - 10,
        behavior: firstRender.current ? "instant" : "smooth",
      })
    }
    firstRender.current = false
  })
}
