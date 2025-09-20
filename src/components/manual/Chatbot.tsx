'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { askGemini } from '@/utils/gemini';
import { SendHorizontalIcon } from 'lucide-react';

export function Chatbot() {
    const [input, setInput] = React.useState('');
    const [messages, setMessages] = React.useState<{ type: 'user' | 'bot'; text: string }[]>([]);
    const [loading, setLoading] = React.useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { type: 'user' as const, text: input }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const response = await askGemini(input);
            setMessages([...newMessages, { type: 'bot', text: response }]);
        } catch (err) {
            setMessages([...newMessages, { type: 'bot', text: 'Error fetching response.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Sheet>
                <SheetTrigger asChild>
                    <Button className="rounded-full h-12 w-12 p-0 shadow-lg" variant="default">
                        💬
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[350px] p-4 flex flex-col gap-2">
                    <h2 className="text-lg font-semibold mb-2">AI Assistant</h2>
                    <ScrollArea className="flex-1 h-[400px] pr-2">
                        <div className="flex flex-col gap-3">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`rounded-lg px-4 py-2 text-sm max-w-[85%] ${msg.type === 'user'
                                            ? 'bg-primary text-primary-foreground self-end'
                                            : 'bg-muted text-muted-foreground self-start'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            ))}
                            {loading && <div className="text-muted text-sm italic">Typing...</div>}
                        </div>
                    </ScrollArea>
                    <div className="flex gap-2 mt-2">
                        <Input
                            placeholder="Ask me something..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={loading}
                        />
                        <Button onClick={handleSend} disabled={loading || !input.trim()} variant="secondary">
                            <SendHorizontalIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
