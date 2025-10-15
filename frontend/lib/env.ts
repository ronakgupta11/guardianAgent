import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const booleanStrings = ['true', 'false', true, false, '1', '0', 'yes', 'no', 'y', 'n', 'on', 'off'];
const BooleanOrBooleanStringSchema = z
  .any()
  .refine((val) => booleanStrings.includes(val), { message: 'must be boolean' })
  .transform((val) => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      const normalized = val.toLowerCase().trim();
      if (['true', 'yes', 'y', '1', 'on'].includes(normalized)) return true;
      if (['false', 'no', 'n', '0', 'off'].includes(normalized)) return false;
      throw new Error(`Invalid boolean string: "${val}"`);
    }
    throw new Error(`Expected boolean or boolean string, got: ${typeof val}`);
  });

export const env = createEnv({
  clientPrefix: 'NEXT_PUBLIC_',
  emptyStringAsUndefined: true,
  runtimeEnv: {
    NEXT_PUBLIC_APP_ID: process.env.NEXT_PUBLIC_APP_ID,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_REDIRECT_URI: process.env.NEXT_PUBLIC_REDIRECT_URI,
    NEXT_PUBLIC_EXPECTED_AUDIENCE: process.env.NEXT_PUBLIC_EXPECTED_AUDIENCE,
    NEXT_PUBLIC_IS_DEVELOPMENT: process.env.NEXT_PUBLIC_IS_DEVELOPMENT,
  },
  client: {
    NEXT_PUBLIC_APP_ID: z.coerce.number(),
    NEXT_PUBLIC_BACKEND_URL: z.string(),
    NEXT_PUBLIC_REDIRECT_URI: z.string().default('http://localhost:3000'),
    NEXT_PUBLIC_EXPECTED_AUDIENCE: z.string().default('http://localhost:3000'),
    NEXT_PUBLIC_IS_DEVELOPMENT: BooleanOrBooleanStringSchema.default(false),
  },
});