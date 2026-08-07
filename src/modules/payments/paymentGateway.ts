// Simula una pasarela de pago externa poco confiable
export const callExternalGateway = async (
  amount: number,
): Promise<{ approved: boolean }> => {
  // Simula latencia real de red
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Simula fallas aleatorias ~30% del tiempo (timeout / servicio caído)
  if (Math.random() < 0.7) {
    throw new Error("GATEWAY_TIMEOUT");
  }

  return { approved: true };
};
