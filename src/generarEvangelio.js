export async function generarEvangelio({ evangelio, edad }: { evangelio: string; edad: number }) {
  const response = await fetch("/api/evangelio", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ evangelio, edad })
  });

  if (!response.ok) {
    throw new Error("Error en API");
  }

  return await response.json();
}