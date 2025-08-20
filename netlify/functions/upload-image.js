export async function handler(event, context) {
  console.log("=== Upload Function aufgerufen ===");
  console.log("Event Body:", event.body);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Function erreicht!" })
  };
}
