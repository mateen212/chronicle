export async function requestPWAInstall(): Promise<'accepted'|'dismissed'|'no-prompt'|null> {
  if (typeof window === 'undefined') return null
  const anyWin = window as any
  const prompt = anyWin.__chronicle_beforeinstallprompt
  if (!prompt) return 'no-prompt'
  try {
    await prompt.prompt()
    const choice = await prompt.userChoice
    // Clear stored prompt after using
    try { delete anyWin.__chronicle_beforeinstallprompt } catch {}
    return choice.outcome as 'accepted'|'dismissed'
  } catch {
    return null
  }
}
