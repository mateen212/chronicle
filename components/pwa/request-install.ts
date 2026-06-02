interface BeforeInstallPromptEventLite {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export async function requestPWAInstall(): Promise<'accepted'|'dismissed'|'no-prompt'|null> {
  if (typeof window === 'undefined') return null
  const win = window as Window & { __chronicle_beforeinstallprompt?: BeforeInstallPromptEventLite }
  const prompt = win.__chronicle_beforeinstallprompt
  if (!prompt) return 'no-prompt'
  try {
    await prompt.prompt()
    const choice = await prompt.userChoice
    try { delete win.__chronicle_beforeinstallprompt } catch {}
    return choice.outcome as 'accepted'|'dismissed'
  } catch {
    return null
  }
}
