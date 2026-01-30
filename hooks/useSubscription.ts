import { useAuth } from '../contexts/AuthContext';

export const useSubscription = () => {
    const { profile, loading } = useAuth();

    const isPremium = profile?.plan_type === 'premium' && profile?.subscription_status === 'active';

    // Check if trial is active
    const isTrial = profile?.plan_type === 'trial' || profile?.subscription_status === 'trialing';

    // Check if trial is expired
    const isTrialExpired = (() => {
        if (!profile?.trial_ends_at) return false;
        return new Date(profile.trial_ends_at) < new Date();
    })();

    // Access is granted if Premium OR (Trial AND NOT Expired)
    const hasAccess = isPremium || (isTrial && !isTrialExpired);

    const daysRemaining = (() => {
        if (isPremium) return 30; // Just a placeholder
        if (!profile?.trial_ends_at) return 0;
        const now = new Date();
        const end = new Date(profile.trial_ends_at);
        const diff = end.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    })();

    return {
        isPremium,
        isTrial,
        isTrialExpired,
        hasAccess,
        daysRemaining,
        loading,
        profile
    };
};
