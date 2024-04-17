import { createClient } from "@libsql/client";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);

  const client = createClient({
    url: config.tursoDatabaseUrl,
    authToken: config.tursoAuthToken,
  });

  const {rows: cityRows} = await client.execute({
    sql: "SELECT * FROM cities WHERE idx = ?",
    args: [query.idx]
  });

  if(cityRows.length != 1) {
    console.log("no city found");
  }

  const resp = await client.execute({
    sql: "SELECT * FROM records WHERE city_id = ? and created_at > unixepoch('now', '-100 hours')",
    args: [cityRows[0].id],
  });


  return resp.rows;
});
