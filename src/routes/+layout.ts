// Every page is prerendered; /<path>/ becomes <path>/index.html.
export const prerender = true;
export const trailingSlash = 'always';
// Content pages ship without JavaScript: nothing to hydrate, no client router
// (its live-region announcer needs an inline style the CSP forbids), nothing
// in sessionStorage. Interactive pages (the playground) opt in with csr = true.
export const csr = false;
