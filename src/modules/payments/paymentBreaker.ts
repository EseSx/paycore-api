import CircuitBreaker from "opossum";
import { callExternalGateway } from "./paymentGateway";

const options = {
  timeout: 3000, // si tarda más de 3s, lo considera falla
  errorThresholdPercentage: 50, // abre el circuito si falla el 50% de los últimos calls
  resetTimeout: 10000, // después de 10s en estado "abierto", prueba de nuevo (half-open)
};

const breaker = new CircuitBreaker(callExternalGateway, options);

// Fallback: qué responder cuando el circuito está abierto (sin llamar a la pasarela real)
breaker.fallback(() => ({
  approved: false,
  reason: "SERVICE_UNAVAILABLE_CIRCUIT_OPEN",
}));

breaker.on("open", () =>
  console.warn("⚠️  Circuit breaker: OPEN — pasarela caída, cortando llamadas"),
);
breaker.on("halfOpen", () =>
  console.log("🔄 Circuit breaker: HALF-OPEN — probando pasarela de nuevo"),
);
breaker.on("close", () =>
  console.log("✅ Circuit breaker: CLOSED — pasarela recuperada"),
);

export const processPayment = (amount: number) => breaker.fire(amount);
