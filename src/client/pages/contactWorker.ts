// Web worker for the contact form's ALTCHA challenge (PBKDF2/SHA-256 with
// WebCrypto). Published as its own file so the CSP can keep worker-src 'self'.
import 'altcha/workers/pbkdf2';
