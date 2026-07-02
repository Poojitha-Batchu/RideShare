import { API_CONFIG } from './api-config';

export function buildProfileImageUrl(imageValue: string | null | undefined): string {
    if (!imageValue || !imageValue.toString().trim()) {
        return '';
    }

    const normalizedValue = imageValue.toString().trim().replace(/\\/g, '/');
    const baseUrl = API_CONFIG.baseUrl.toString().replace(/\/$/, '');

    if (/^https?:\/\//i.test(normalizedValue)) {
        return normalizedValue;
    }

    if (normalizedValue.startsWith('/media/')) {
        return `${baseUrl}${normalizedValue}`;
    }

    if (normalizedValue.startsWith('media/')) {
        return `${baseUrl}/${normalizedValue}`;
    }

    return `${baseUrl}/media/${normalizedValue}`;
}
