import {useCallback, useEffect, useRef, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {
    AlertCircle,
    ArrowLeft,
    Check,
    CheckCheck,
    Image as ImageIcon,
    Loader2,
    MoreVertical,
    Phone,
    Send,
} from 'lucide-react';
import {useAuthStore} from '@/stores';
import {Button} from '@/components/ui/Button';
import {cn, formatDate, getImageUrl} from '@/utils/helpers';
import type {ChatRoom, Message} from '@/types';

// API URL for WebSocket
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const WS_URL = API_URL.replace('http', 'ws').replace('/api/v1', '/ws/chat');

export const ChatPage = () => {
    // Backend uses shop slug for WebSocket
    const {slug: shopSlug} = useParams<{ slug?: string }>();
    console.log('ChatPage - shopSlug from URL:', shopSlug);
    const navigate = useNavigate();
    const {isAuthenticated, user} = useAuthStore();

    // State
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch rooms list
    const fetchRooms = useCallback(async (shopSlug?: string) => {
        console.log('fetchRooms called with shopSlug:', shopSlug);
        try {
            const token = localStorage.getItem('access_token');
            // If shopSlug provided, fetch seller rooms, otherwise user rooms
            const endpoint = shopSlug
                ? `${API_URL}/shops/${shopSlug}/rooms/`
                : `${API_URL}/rooms/`;
            console.log('fetchRooms endpoint:', endpoint);

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch rooms');

            const data = await response.json();
            setRooms(data);
            return data;
        } catch (err) {
            console.error('Fetch rooms error:', err);
            setError('Xonalarni yuklashda xatolik');
            return [];
        }
    }, []);

    // Fetch chat history
    const fetchMessages = useCallback(async (roomId: number) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/rooms/${roomId}/historys/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch messages');

            const data = await response.json();
            setMessages(data);
        } catch (err) {
            console.error('Fetch messages error:', err);
        }
    }, []);

    // Connect WebSocket - backend uses shop slug, not room id
    const connectWebSocket = useCallback((slug: string) => {
        console.log('Connecting WebSocket to shop:', slug);
        if (wsRef.current) {
            wsRef.current.close();
        }

        const token = localStorage.getItem('access_token');
        console.log('WebSocket URL:', `${WS_URL}/${slug}/?auth=${token ? 'EXISTS' : 'MISSING'}`);
        const ws = new WebSocket(`${WS_URL}/${slug}/?auth=${token}`);

        ws.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Backend sends: {message, image, is_me: false} or {message_id, is_me: true}
            if (data.is_me === false) {
                // Received message from other user
                const newMessage: Message = {
                    id: Date.now(), // Temporary id until we get real one
                    text: data.message,
                    image: data.image,
                    sender: {id: 0, first_name: '', last_name: '', phone: '', email: '', type: 'user', is_online: false},
                    created_at: new Date().toISOString(),
                    is_read: false,
                    chat: selectedRoom?.id || 0,
                };
                setMessages((prev) => [...prev, newMessage]);
            } else if (data.is_me === true) {
                // Our message was confirmed/saved - update with real id
                if (data.message_id) {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === Date.now() ? {...msg, id: data.message_id} : msg
                        )
                    );
                }
            }
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        wsRef.current = ws;
    }, []);

    // Initial load
    useEffect(() => {
        if (!isAuthenticated) return;

        const init = async () => {
            setIsLoading(true);
            // Check if shopSlug is provided (seller view)
            if (shopSlug) {
                // Fetch rooms for this shop and select/create room
                const rooms = await fetchRooms(shopSlug);
                if (rooms.length > 0) {
                    const room = rooms[0];
                    setSelectedRoom(room);
                    fetchMessages(room.id);
                    // WebSocket uses shop slug
                    connectWebSocket(shopSlug);
                    // Update URL to use roomId
                    navigate(`/chats/${room.id}`, {replace: true});
                }
            } else {
                await fetchRooms();
            }
            setIsLoading(false);
        };

        init();
    }, [isAuthenticated, fetchRooms, shopSlug, navigate, fetchMessages, connectWebSocket]);

    // Select room from URL or select first room
    useEffect(() => {
        if (rooms.length === 0) return;

        // Skip if shopSlug provided (handled in initial load)
        if (shopSlug) return;

        // Select first room by default
        const firstRoom = rooms[0];
        if (firstRoom) {
            setSelectedRoom(firstRoom);
            fetchMessages(firstRoom.id);
            // WebSocket uses shop slug
            connectWebSocket(firstRoom.shop.slug);
        }
    }, [rooms, shopSlug, fetchMessages, connectWebSocket]);

    // Cleanup WebSocket
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    // Send message - backend expects: {message: "", image: ""}
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Send clicked:', { message, selectedRoom: selectedRoom?.id, wsConnected: !!wsRef.current });
        if (!message.trim() || !selectedRoom || !wsRef.current) {
            console.log('Blocked:', { hasMessage: !!message.trim(), hasRoom: !!selectedRoom, hasWs: !!wsRef.current });
            return;
        }

        setIsSending(true);

        try {
            // Backend format: {message: "", image: ""}
            wsRef.current.send(
                JSON.stringify({
                    message: message,
                    image: '',
                })
            );

            // Add optimistic message
            const optimisticMessage: Message = {
                id: Date.now(),
                text: message,
                image: '',
                sender: user!,
                created_at: new Date().toISOString(),
                is_read: false,
                chat: selectedRoom?.id || 0,
            };
            setMessages((prev) => [...prev, optimisticMessage]);
            setMessage('');
        } catch (err) {
            console.error('Send message error:', err);
            setError('Xabar yuborishda xatolik');
        } finally {
            setIsSending(false);
        }
    };

    // Handle file upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedRoom) return;

        setIsSending(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/rooms/upload-image/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to upload image');

            const data = await response.json();

            // Send image message via WebSocket - backend format: {message: "", image: ""}
            if (wsRef.current) {
                wsRef.current.send(
                    JSON.stringify({
                        message: '',
                        image: data.image_url,
                    })
                );
            }
        } catch (err) {
            console.error('Upload image error:', err);
            setError('Rasm yuklashda xatolik');
        } finally {
            setIsSending(false);
        }
    };

    // Select room handler
    const handleSelectRoom = (room: ChatRoom) => {
        setSelectedRoom(room);
        navigate(`/chats/${room.id}`);
        fetchMessages(room.id);
        // WebSocket uses shop slug
        connectWebSocket(room.shop.slug);
    };

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold text-text-primary mb-4">
                    Xabarlar uchun tizimga kiring
                </h1>
                <Button asChild>
                    <Link to="/login">Kirish</Link>
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-4 h-[calc(100vh-200px)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary"/>
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <div className="container mx-auto px-4 py-4 h-[calc(100vh-200px)] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-text-primary mb-4">
                        Hozircha suhbatlar yo'q
                    </h1>
                    <p className="text-text-secondary mb-6">
                        Do'konlardan mahsulot xarid qiling va suhbat boshlang
                    </p>
                    <Button onClick={() => navigate('/products')}>Katalogga o'tish</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-4 h-[calc(100vh-200px)]">
            <div className="bg-white rounded-2xl shadow-sm h-full flex overflow-hidden">
                {/* Rooms list */}
                <div
                    className={cn(
                        'w-full md:w-80 border-r border-gray-100 flex flex-col',
                        selectedRoom && 'hidden md:flex'
                    )}
                >
                    <div className="p-4 border-b border-gray-100">
                        <h1 className="text-xl font-bold text-text-primary">Xabarlar</h1>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="divide-y divide-gray-100">
                            {rooms.map((room) => (
                                <button
                                    key={room.id}
                                    onClick={() => handleSelectRoom(room)}
                                    className={cn(
                                        'w-full flex items-center gap-3 p-4 hover:bg-surface transition-colors text-left',
                                        selectedRoom?.id === room.id && 'bg-surface'
                                    )}
                                >
                                    <div
                                        className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                        {room.shop.image ? (
                                            <img
                                                src={getImageUrl(room.shop.image)}
                                                alt={room.shop.name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="font-bold text-primary">
                        {room.shop.name[0]}
                      </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-text-primary truncate">
                                                {room.shop.name}
                                            </h3>
                                            <span className="text-xs text-text-muted">
                        {formatDate(room.last_message_at)}
                      </span>
                                        </div>
                                        <p className="text-sm text-text-secondary truncate">
                                            {room.last_message || 'Suhbat boshlandi'}
                                        </p>
                                    </div>
                                    {room.message_not_read_count > 0 && (
                                        <span
                                            className="w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center shrink-0">
                      {room.message_not_read_count}
                    </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chat area */}
                {selectedRoom ? (
                    <div className="flex-1 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedRoom(null)}
                                    className="md:hidden p-2 hover:bg-surface rounded-lg"
                                >
                                    <ArrowLeft className="w-5 h-5"/>
                                </button>
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    {selectedRoom.shop.image ? (
                                        <img
                                            src={getImageUrl(selectedRoom.shop.image)}
                                            alt={selectedRoom.shop.name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="font-bold text-primary">
                      {selectedRoom.shop.name[0]}
                    </span>
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-semibold text-text-primary">
                                        {selectedRoom.shop.name}
                                    </h2>
                                    <div className="flex items-center gap-1 text-xs">
                                        {isConnected ? (
                                            <span className="text-green-600">Onlayn</span>
                                        ) : (
                                            <span className="text-text-muted">
                        Ulanmoqda...
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-surface rounded-lg">
                                    <Phone className="w-5 h-5 text-text-muted"/>
                                </button>
                                <button className="p-2 hover:bg-surface rounded-lg">
                                    <MoreVertical className="w-5 h-5 text-text-muted"/>
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="px-4 py-2 bg-red-50 flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle className="w-4 h-4"/>
                                {error}
                                <button
                                    onClick={() => setError(null)}
                                    className="ml-auto text-red-700 hover:underline"
                                >
                                    Yopish
                                </button>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center py-8 text-text-muted">
                                    <p>Xabarlar mavjud emas</p>
                                    <p className="text-sm">Suhbatni boshlang!</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.sender?.id === user?.id;
                                    const showDate =
                                        index === 0 ||
                                        new Date(
                                            messages[index - 1].created_at
                                        ).toDateString() !==
                                        new Date(msg.created_at).toDateString();

                                    return (
                                        <div key={msg.id}>
                                            {showDate && (
                                                <div className="text-center my-4">
                          <span className="text-xs text-text-muted bg-surface px-3 py-1 rounded-full">
                            {formatDate(msg.created_at)}
                          </span>
                                                </div>
                                            )}
                                            <div
                                                className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
                                            >
                                                <div
                                                    className={cn(
                                                        'max-w-[70%] rounded-2xl px-4 py-2',
                                                        isMe
                                                            ? 'bg-primary text-white rounded-br-none'
                                                            : 'bg-surface text-text-primary rounded-bl-none'
                                                    )}
                                                >
                                                    {msg.image && (
                                                        <img
                                                            src={msg.image}
                                                            alt="Shared image"
                                                            className="rounded-lg mb-2 max-w-full"
                                                        />
                                                    )}
                                                    {msg.text && <p>{msg.text}</p>}
                                                    <div
                                                        className={cn(
                                                            'flex items-center gap-1 mt-1 text-xs',
                                                            isMe ? 'text-white/70' : 'text-text-muted'
                                                        )}
                                                    >
                            <span>
                              {new Date(msg.created_at).toLocaleTimeString(
                                  'uz-UZ',
                                  {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  }
                              )}
                            </span>
                                                        {isMe &&
                                                            (msg.is_read ? (
                                                                <CheckCheck className="w-3 h-3"/>
                                                            ) : (
                                                                <Check className="w-3 h-3"/>
                                                            ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef}/>
                        </div>

                        {/* Input */}
                        <form
                            onSubmit={handleSendMessage}
                            className="p-4 border-t border-gray-100"
                        >
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isSending}
                                    className="p-2 hover:bg-surface rounded-lg text-text-muted disabled:opacity-50"
                                >
                                    <ImageIcon className="w-5 h-5"/>
                                </button>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Xabar yozing..."
                                    disabled={isSending}
                                    className="flex-1 bg-surface rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() || isSending}
                                    className="p-3 bg-primary text-white rounded-full hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSending ? (
                                        <Loader2 className="w-5 h-5 animate-spin"/>
                                    ) : (
                                        <Send className="w-5 h-5"/>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center bg-surface/50">
                        <div className="text-center">
                            <div
                                className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-10 h-10 text-primary"/>
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary mb-2">
                                Suhbatni tanlang
                            </h3>
                            <p className="text-text-secondary">
                                Xabar almashish uchun do'kon tanlang
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
