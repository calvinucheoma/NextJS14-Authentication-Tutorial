export { default } from 'next-auth/middleware';
// In this way each page in our application is protected from the unauthenticated user but this is not desirable because
// we do not want to protect the home page of our application and other pages from unauthenticated users, only certain pages
// so we export a config object to tell nextAuth which pages we need to apply this middleware.

export const config = {
  matcher: ['/profile'], // we add the pages we want the middleware to protect here
};

// If we have an admin panel that has multiple pages, we can use regex to specify all the pages we want to keep protected rather than writing them manually one by one.
// E.g  matcher: ['/admin/:path*'], Every page that starts with /admin would be protected by the nextAuth middleware
