# Development Rules

1. Keep NEXO REALMS independent from the NEXO repository.
2. Audit existing code before changing it.
3. Do not duplicate systems when a reusable module exists.
4. Do not apply production migrations without explicit authorization.
5. Do not integrate into NEXO until the standalone game passes the integration-readiness checklist.
6. Prefer deterministic/shared domain rules for competitive mechanics.
7. Client state is presentation/input; server state is authoritative for online matches.
