import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { chatWithRag, clearConversation, getIngestedFileIds, ingestFile } from '../../service/ragService';
import { toErrorMessage } from '../../service/apiClient';

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const WELCOME = {
  id: 'welcome',
  text: "Hello! I'm your AI assistant. Select a file to start asking questions about it.",
  sender: 'ai',
  timestamp: now(),
};

export const useRag = () => {
  const [messages, setMessages] = useState([WELCOME]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [ingestedFiles, setIngestedFiles] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;
    getIngestedFileIds()
      .then((ids) => {
        if (!cancelled) setIngestedFiles(new Set(ids));
      })
      .catch(() => {
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const appendMessage = useCallback((message) => {
    setMessages((current) => [...current, { ...message, timestamp: now() }]);
  }, []);

  const handleFileSelect = useCallback(
    async (file) => {
      setSelectedFile(file);

      if (ingestedFiles.has(file.id)) {
        appendMessage({
          id: `ready-${file.id}-${Date.now()}`,
          text: `"${file.fileName}" is ready. Ask me anything about it.`,
          sender: 'system',
        });
        return;
      }

      setIsIngesting(true);
      appendMessage({
        id: `ingesting-${file.id}-${Date.now()}`,
        text: `Indexing "${file.fileName}"... this can take a few seconds.`,
        sender: 'system',
      });

      try {
        const response = await ingestFile(file.id);
        if (response.success) {
          appendMessage({
            id: `ingested-${file.id}-${Date.now()}`,
            text: `Indexed ${response.chunkCount} section(s). You can now ask questions about this file.`,
            sender: 'ai',
          });
          setIngestedFiles((current) => new Set(current).add(file.id));
          toast.success('File is ready for questions');
        } else {
          throw new Error(response.message || 'Indexing failed.');
        }
      } catch (error) {
        const message = toErrorMessage(error, 'Could not index that file.');
        appendMessage({
          id: `ingest-error-${Date.now()}`,
          text: `Could not index that file: ${message}`,
          sender: 'ai',
        });
        toast.error(message);
      } finally {
        setIsIngesting(false);
      }
    },
    [ingestedFiles, appendMessage],
  );

  const handleSendMessage = useCallback(
    async (question) => {
      if (!selectedFile) {
        toast.error('Select a file first.');
        return;
      }

      appendMessage({ id: `q-${Date.now()}`, text: question, sender: 'user' });
      setIsChatting(true);

      try {
        const response = await chatWithRag(question, selectedFile.id);
        appendMessage({
          id: `a-${Date.now()}`,
          text: response.answer,
          sender: 'ai',
          sources: response.sources || [],
        });
      } catch (error) {
        const message = toErrorMessage(error, 'Could not get an answer.');
        appendMessage({ id: `a-error-${Date.now()}`, text: message, sender: 'ai' });
        toast.error(message);
      } finally {
        setIsChatting(false);
      }
    },
    [selectedFile, appendMessage],
  );

  const handleClearConversation = useCallback(async () => {
    try {
      await clearConversation();
      setMessages([{ ...WELCOME, id: 'welcome-cleared', text: 'Conversation cleared. Ask me anything about your file.', timestamp: now() }]);
      toast.success('Conversation cleared');
    } catch (error) {
      toast.error(toErrorMessage(error, 'Could not clear the conversation.'));
    }
  }, []);

  return {
    messages,
    selectedFile,
    isIngesting,
    isChatting,
    ingestedFiles,
    handleFileSelect,
    handleSendMessage,
    handleClearConversation,
  };
};
