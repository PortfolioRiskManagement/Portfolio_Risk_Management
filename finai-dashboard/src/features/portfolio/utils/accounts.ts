import type { AccountType } from "../types/portfolio.types"

export const ACCOUNT_OPTIONS: { value: AccountType; label: string }[] = [
  { value: "TFSA", label: "TFSA" },
  { value: "RRSP", label: "RRSP" },
  { value: "FHSA", label: "FHSA" },
  { value: "PERSONAL", label: "Personal (non-registered)" },
]

export function accountLabel(account: AccountType | undefined) {
  return account === "PERSONAL" || !account ? "Personal" : account
}
