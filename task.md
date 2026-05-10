# Ship2Aruba Build Task

## Status: IN PROGRESS

## Done
- [x] app_init
- [x] Install deps (better-auth, aws-sdk, sonner, radix, lucide)
- [x] Design.md written
- [x] Auth schema generated (auth-schema.ts)
- [x] Full DB schema written (packages, invoices, shipmentRequests, notifications)
- [x] db:push run - tables created
- [x] Auth config (auth.ts)
- [x] Auth middleware

## Next Steps
- [ ] API routes (packages, invoices, shipment-requests, upload, notifications, dashboard stats)
- [ ] Auth frontend client
- [ ] Root styles (Poppins font, orange theme)
- [ ] UI components: sidebar, status badge, table, card
- [ ] Pages: login, signup, client dashboard, upload package, my packages, package detail, notifications
- [ ] Admin pages: dashboard, pending review, all packages, shipment requests, all clients
- [ ] App.tsx routing with protected routes
- [ ] Build & test

## API Routes Plan
- POST/GET /api/auth/* - handled by better-auth
- GET/POST /packages - list (filtered by role), create
- GET /packages/:id - single package detail
- PATCH /packages/:id/status - admin approve/reject
- POST /packages/:id/invoice - attach invoice to package
- POST /packages/:id/shipment-request - client requests shipment
- GET /shipment-requests - admin list
- PATCH /shipment-requests/:id - admin mark shipped
- POST /upload/presign - S3 presigned URL
- GET /notifications - user notifications
- PATCH /notifications/:id/read - mark read
- GET /admin/stats - dashboard analytics
- GET /admin/clients - all users with CLIENT role

## File Structure
packages/web/src/
  api/
    index.ts
    auth.ts
    middleware/auth.ts
    routes/
      packages.ts
      invoices.ts
      shipment-requests.ts
      upload.ts
      notifications.ts
      admin.ts
    database/
      schema.ts
      auth-schema.ts
  web/
    lib/auth.ts
    lib/api.ts
    lib/utils.ts
    components/
      provider.tsx
      protected-route.tsx
      sidebar.tsx
      status-badge.tsx
      page-header.tsx
      stats-card.tsx
      data-table.tsx
      upload-zone.tsx
      notification-bell.tsx
    pages/
      index.tsx (redirect)
      sign-in.tsx
      sign-up.tsx
      client/
        dashboard.tsx
        upload-package.tsx
        packages.tsx
        package-detail.tsx
        notifications.tsx
      admin/
        dashboard.tsx
        pending-reviews.tsx
        all-packages.tsx
        shipment-requests.tsx
        clients.tsx
    app.tsx
    styles.css
