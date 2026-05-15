import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { ingestFile, chatWithRag, clearConversation } from '../../service/ragService';
import { toast } from 'react-toastify';

export const useRag = () => {
    const { userData } = useContext(AppContext);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your AI assistant. Select a file to start asking questions about it.",
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isIngesting, setIsIngesting] = useState(false);
    const [isChatting, setIsChatting] = useState(false);
    const [ingestedFiles, setIngestedFiles] = useState(new Set());

    const handleFileSelect = async (file) => {
        if (!userData?.id) {
            toast.error('User not authenticated');
            return;
        }

        setSelectedFile(file);

        // Check if already ingested
        if (ingestedFiles.has(file.id)) {
            toast.info('File already ingested and ready!');
            return;
        }

        setIsIngesting(true);

        // Add ingestion message
        const ingestingMsg = {
            id: Date.now(),
            text: `Ingesting "${file.fileName}"... This may take a few seconds.`,
            sender: 'system',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, ingestingMsg]);

        try {
            const response = await ingestFile(file.id, userData.id);

            if (response.success) {
                const successMsg = {
                    id: Date.now() + 1,
                    text: `✅ File ingested successfully! ${response.chunkCount} chunks indexed. You can now ask questions about this file.`,
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, successMsg]);
                setIngestedFiles(prev => new Set([...prev, file.id]));
                toast.success(response.message);
            }
        } catch (error) {
            const errorMsg = {
                id: Date.now() + 1,
                text: `❌ Failed to ingest file: ${error.response?.data?.message || error.message}`,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMsg]);
            toast.error('Failed to ingest file');
        } finally {
            setIsIngesting(false);
        }
    };

    const handleSendMessage = async (question) => {
        if (!userData?.id) {
            toast.error('User not authenticated');
            return;
        }

        if (!selectedFile) {
            toast.error('Please select a file first');
            return;
        }

        // Add user message
        const userMessage = {
            id: Date.now(),
            text: question,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMessage]);

        setIsChatting(true);

        try {
            const response = await chatWithRag(userData.id, question, selectedFile.id);

            const aiMessage = {
                id: Date.now() + 1,
                text: response.answer,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                sources: response.sources || []
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMsg = {
                id: Date.now() + 1,
                text: `Error: ${error.response?.data?.message || error.message}`,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMsg]);
            toast.error('Failed to get response');
        } finally {
            setIsChatting(false);
        }
    };

    const handleClearConversation = async () => {
        if (!userData?.id) return;

        try {
            await clearConversation(userData.id);
            setMessages([
                {
                    id: 1,
                    text: "Conversation cleared. Select a file to start fresh!",
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }
            ]);
            toast.success('Conversation cleared');
        } catch (error) {
            toast.error('Failed to clear conversation');
        }
    };

    return {
        messages,
        selectedFile,
        isIngesting,
        isChatting,
        ingestedFiles,
        handleFileSelect,
        handleSendMessage,
        handleClearConversation
    };
};