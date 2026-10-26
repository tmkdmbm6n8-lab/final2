// SMS sending is disabled in this version (no outside SMS service).
export async function sendBookingSms(_p: { id: string; customer_name: string; phone: string; slotTime: string | null; city: string }): Promise<void> {}
