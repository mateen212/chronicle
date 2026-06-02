"use client"
import { Download } from "lucide-react"
import { requestPWAInstall } from "./request-install"
import { toast } from "sonner"

export function PWAInstallButton({ className }: { className?: string }) {
  async function onClick() {
    const res = await requestPWAInstall()
    if (res === 'accepted') {
      toast.success('Installed')
    } else if (res === 'dismissed') {
      toast('Install dismissed')
    } else if (res === 'no-prompt') {
      // Fallback instructions for iOS / unsupported browsers
      toast('Installation not available. Use your browser menu and select "Add to Home screen"')
    } else {
      toast.error('Install failed')
    }
  }

  return (
    <button
      onClick={() => void onClick()}
      title="Add to home screen"
      className={`${className ?? ''} rounded-md p-2 hover:bg-popover/8 transition-colors`}
    >
      <Download className="h-4 w-4" />
    </button>
  )
}

export default PWAInstallButton
