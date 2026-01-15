import { useState } from 'react';
import { CalendarEvent, Email, LifeAnalysis, MessageStatus } from '../types';
import { fetchGoogleEvents, fetchGoogleEmails } from '../services/googleService';
import { analyzeLifeData } from '../services/geminiService';
import { MOCK_CALENDAR_EVENTS, MOCK_EMAILS } from '../services/mockData';

export const useGoogleData = () => {
    const [emails, setEmails] = useState<Email[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [lifeAnalysis, setLifeAnalysis] = useState<LifeAnalysis | null>(null);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [dataLoadError, setDataLoadError] = useState<string | null>(null);

    const analyze = async (currentEvents = events, currentEmails = emails) => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeLifeData(currentEvents, currentEmails);
            setLifeAnalysis(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const loadData = async (shouldAnalyze = true) => {
        setIsDataLoading(true);
        setDataLoadError(null);
        try {
            const [fetchedEvents, fetchedEmails] = await Promise.all([
                fetchGoogleEvents(),
                fetchGoogleEmails()
            ]);
            setEvents(fetchedEvents);
            setEmails(fetchedEmails);

            if (shouldAnalyze) {
                analyze(fetchedEvents, fetchedEmails);
            }
        } catch (e) {
            console.error("Failed to load Google data", e);
            const message = e instanceof Error ? e.message : "Unable to fetch Google data.";
            setDataLoadError(message);
        } finally {
            setIsDataLoading(false);
        }
    };

    const loadDemoData = () => {
        setEvents(MOCK_CALENDAR_EVENTS);
        setEmails(MOCK_EMAILS);
        analyze(MOCK_CALENDAR_EVENTS, MOCK_EMAILS);
    };

    const updateEmailStatus = (id: string, status: MessageStatus) => {
        setEmails(prev => prev.map(email =>
            email.id === id ? { ...email, status } : email
        ));
    };

    // expose setters if needed for granular control, but try to use methods above
    return {
        emails,
        events,
        lifeAnalysis,
        isAnalyzing,
        isDataLoading,
        dataLoadError,
        loadData,
        loadDemoData,
        analyze,
        updateEmailStatus,
        setDataLoadError // needed for dismissing error
    };
};
