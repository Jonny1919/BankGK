exports.handler = async function(event) {
  console.log("Function wurde aufgerufen!");
  console.log("Event Body:", event.body);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Test erfolgreich!" }),
  };
};
