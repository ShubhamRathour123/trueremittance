# TrueRemittance MVP Architecture

## Boundaries
- UI components live in `src/components`.
- Business logic lives in `src/lib/comparison`.
- Data access lives in `src/lib/data`.
- Admin auth lives in `src/lib/admin-auth`.
- Prisma schema lives in `prisma/schema.prisma`.

## Request Flow
Public comparison:
1. User enters send amount on `/`.
2. Server loads latest active quote per provider for the UAE to India corridor.
3. Comparison engine computes recipient amount.
4. Results are rendered as scannable provider cards.

Admin rate management:
1. Admin logs in through `/admin/login`.
2. Server sets a signed HTTP-only cookie.
3. Protected admin pages validate the cookie.
4. Admin creates providers or quote snapshots through server actions.

Affiliate redirect:
1. User clicks a provider action.
2. `/redirect/[providerSlug]` validates the provider.
3. User is redirected to the provider affiliate URL when present, otherwise provider website URL.

## MVP Data Policy
All quotes are manually entered. No API integration or scraping exists in MVP.

## Future Upgrade Points
- Replace password gate with role-based authentication.
- Add multi-corridor support.
- Add quote import tooling.
- Add audit logs for rate changes.
- Add provider API integrations where legally and technically available.
