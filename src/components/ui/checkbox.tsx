"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>((props, ref) => <CheckboxPrimitive.Root {...props} ref={ref} />)
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
