/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** EmailJS service ID (VITE_EMAILJS_SERVICE_ID) */
  readonly VITE_EMAILJS_SERVICE_ID: string;
  /** EmailJS template ID (VITE_EMAILJS_TEMPLATE_ID) */
  readonly VITE_EMAILJS_TEMPLATE_ID: string;
  /** EmailJS public key (VITE_EMAILJS_PUBLIC_KEY) */
  readonly VITE_EMAILJS_PUBLIC_KEY: string;
  /** Google reCAPTCHA v2 site key (VITE_RECAPTCHA_SITE_KEY) */
  readonly VITE_RECAPTCHA_SITE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
