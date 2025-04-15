const main = (): void => {
	try {
		Deno.serve(() => new Response("Ticket-To-Ride"));
	} catch {
		console.error("error: Intiating Server...");
	}
};

main();
