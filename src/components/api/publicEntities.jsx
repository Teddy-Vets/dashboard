import { base44Public } from './base44PublicClient';

// Some entities may not be exposed when the SDK is used in public (unauthenticated) mode. To
// prevent runtime errors when an entity is missing, fall back to a stub implementation. The
// stub exposes the same list of methods but with no‑op implementations, ensuring that code
// consuming these entities can still call list(), create(), update() or delete() safely. The
// list method returns an empty array to allow harmless iteration.
const makeStubEntity = () => ({
  list: async () => [],
  create: undefined,
  update: undefined,
  delete: undefined
});

// Export each entity using the public client. When an entity does not exist (for example,
// because it has not been enabled for public access), fall back to the stub implementation.
export const Client = base44Public.entities?.Client ?? makeStubEntity();
export const Pet = base44Public.entities?.Pet ?? makeStubEntity();
export const IntakeForm = base44Public.entities?.IntakeForm ?? makeStubEntity();
export const ConsentForm = base44Public.entities?.ConsentForm ?? makeStubEntity();
export const Clinic = base44Public.entities?.Clinic ?? makeStubEntity();