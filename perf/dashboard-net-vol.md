# Dashboard `dashboard-net-vol.json`

Dashboard para ver solo metricas de negocio:

- Volumen por moneda.
- Neto por moneda.

Tambien tiene paneles chicos por moneda (`ARS`, `USD`, `EUR`, `BRL`) para que no se mezcle todo en una sola escala.

## Que muestra cada grafico

- **Volumen**: monto acumulado operado por moneda. Todo suma.
- **Neto**: monto acumulado con signo por moneda. Compras suman y ventas restan.

## Pasos para conectarlo en Grafana

1. Levantar servicios:
   - `docker compose up -d`
2. Abrir Grafana:
   - `http://localhost`
3. Crear datasource Graphite:
   - `Connections` -> `Data sources` -> `Add data source` -> `Graphite`
   - URL: `http://graphite`
   - Name: `Graphite`
   - `Save & test`
4. Importar dashboard:
   - `Dashboards` -> `Import`
   - subir `perf/dashboard-net-vol.json`

## Prueba rapida

1. Hacer un `POST /exchange` con este comando:
   - `curl.exe -sS -X POST "http://localhost:5555/exchange" -H "Content-Type: application/json" -d '{\"baseCurrency\":\"USD\",\"counterCurrency\":\"ARS\",\"baseAccountId\":\"client-usd\",\"counterAccountId\":\"client-ars\",\"baseAmount\":25}'`
2. Esperar 5-15 segundos.
3. En Grafana usar `Last 30 minutes` y refresh cada `5s`.
4. Verificar que se mueven los paneles de volumen y neto.
