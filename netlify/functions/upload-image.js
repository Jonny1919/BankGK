export async function handler(event, context) {
  console.log("Upload Function aufgerufen");
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Function erreicht!" })
  };
}
