/**
 * Utilitários para lidar com datas no fuso horário de Brasília (UTC-3)
 */

export const getBrasiliaDate = () => {
    // Retorna a data atual no formato YYYY-MM-DD respeitando o fuso de Brasília
    const now = new Date();
    return new Intl.DateTimeFormat('fr-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(now);
};

export const formatDisplayDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    try {
        // Extrai apenas a parte da data (YYYY-MM-DD) para evitar deslocamento de fuso horário
        // Isso garante que se o usuário salvou dia 10, ele veja dia 10, independente do UTC.
        const datePart = dateString.split('T')[0];
        const [year, month, day] = datePart.split('-');

        if (!year || !month || !day) return dateString;

        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
};

export const getRelativeTime = (timestamp: number) => {
    const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
    const diff = timestamp - Date.now();
    const diffInDays = Math.round(diff / (1000 * 60 * 60 * 24));

    if (Math.abs(diffInDays) < 1) {
        const diffInHours = Math.round(diff / (1000 * 60 * 60));
        if (Math.abs(diffInHours) < 1) {
            return 'agora mesmo';
        }
        return rtf.format(diffInHours, 'hour');
    }
    return rtf.format(diffInDays, 'day');
};
