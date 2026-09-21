export function normalizeBangladeshPhone(value: string) {
  const compact = value.trim().replace(/[\s()-]/g, '');

  /*
   * Local:
   * 01812345678
   */
  if (/^01[3-9]\d{8}$/.test(compact)) {
    return `+88${compact}`;
  }

  /*
   * Input used with a visible +880 prefix:
   * 1812345678
   */
  if (/^1[3-9]\d{8}$/.test(compact)) {
    return `+880${compact}`;
  }

  /*
   * International without +:
   * 8801812345678
   */
  if (/^8801[3-9]\d{8}$/.test(compact)) {
    return `+${compact}`;
  }

  /*
   * Full E.164 Bangladesh mobile number:
   * +8801812345678
   */
  if (/^\+8801[3-9]\d{8}$/.test(compact)) {
    return compact;
  }

  throw new Error('Enter a valid Bangladeshi mobile number.');
}

export function normalizePhoneOtp(value: string) {
  const normalized = value.trim().replace(/\s/g, '');

  if (!/^\d{6}$/.test(normalized)) {
    throw new Error('Verification code must contain 6 digits.');
  }

  return normalized;
}
