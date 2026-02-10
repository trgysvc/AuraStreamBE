export const EnergyCurve = {
    /**
     * Determines the optimal frequency based on Turkey time
     */
    getFrequencyForTime(hour: number): '440hz' | '432hz' | '528hz' {
        // Morning (06:00 - 10:00): 528Hz (Repair & Awakening)
        if (hour >= 6 && hour < 10) return '528hz';
        
        // Day (10:00 - 18:00): 440Hz (Standard Focus)
        if (hour >= 10 && hour < 18) return '440hz';
        
        // Evening/Night (18:00 - 06:00): 432Hz (Relaxation & Healing)
        return '432hz';
    },

    getCurrentTuning(): '440hz' | '432hz' | '528hz' {
        const hour = new Date().getHours();
        return this.getFrequencyForTime(hour);
    }
};
