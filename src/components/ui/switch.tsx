import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>((props, ref) => <SwitchPrimitives.Root {...props} ref={ref} />)
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
