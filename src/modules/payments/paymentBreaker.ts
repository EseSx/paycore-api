import CircuitBreaker from "opossum";
import { callExternalGateway } from "./paymentGateway";

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 3000, // bajado a 3s solo para poder ver la recuperación en el test
  volumeThreshold: 5, // necesita al menos 5 llamadas antes de evaluar el % de error
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
