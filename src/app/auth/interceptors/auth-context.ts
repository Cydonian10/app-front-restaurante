import { HttpContextToken } from '@angular/common/http';

/** Requests that must not use the current session. */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
