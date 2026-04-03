declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.ttf' {
  const content: string
  export default content
}

interface Window {
  goatcounter?: {
    count: (vars: { path: string; title?: string; event?: boolean }) => void
  }
}
