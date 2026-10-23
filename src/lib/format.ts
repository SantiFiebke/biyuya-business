const ars = new Intl.NumberFormat('es-AR', {
	style: 'currency',
	currency: 'ARS',
	maximumFractionDigits: 2
});

export function formatARS(value: number | string): string {
	return ars.format(Number(value));
}
