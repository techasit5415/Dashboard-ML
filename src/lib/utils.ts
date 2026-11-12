import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatPercent(value: number, decimals: number = 1): string {
	return (value * 100).toFixed(decimals) + "%";
}

export function formatCurrency(value: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0
	}).format(value);
}

export function formatNumber(value: number): string {
	return new Intl.NumberFormat("en-US").format(value);
}
