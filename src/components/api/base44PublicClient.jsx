import { createClient } from '@base44/sdk';

export const base44Public = createClient({
  appId: "687b78971cad562073ed5929",
  requiresAuth: false,
  entities: {
    IntakeForm: "IntakeForm",
    ConsentForm: "ConsentForm",
    Clinic: "Clinic",
    Client: "Client",
    Pet: "Pet"
  }
});
