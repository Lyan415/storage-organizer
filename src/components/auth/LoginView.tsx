
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ChevronDown, Sparkles, Eye, EyeOff } from 'lucide-react';
import { getAIConfig, saveAIConfig, clearAIConfig, type AIProvider } from '../../lib/aiConfig';

const ACCOUNTS = [
    { label: 'Lyan', email: 'lyan@storage.local' },
    { label: '小章魚', email: 'octopus@storage.local' },
];

const AI_PROVIDERS: { value: AIProvider; label: string }[] = [
    { value: 'gemini', label: 'Google Gemini' },
    { value: 'openai', label: 'OpenAI' },
    { value: 'claude', label: 'Claude (Anthropic)' },
];

export const LoginView = () => {
    const [selectedAccount, setSelectedAccount] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const [aiProvider, setAiProvider] = useState<AIProvider | ''>('');
    const [aiApiKey, setAiApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [aiSaved, setAiSaved] = useState(false);

    useEffect(() => {
        const existing = getAIConfig();
        if (existing) {
            setAiProvider(existing.provider);
            setAiApiKey(existing.apiKey);
            setAiSaved(true);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAccount) {
            setError('請選擇帳號');
            return;
        }
        setLoading(true);
        setError(null);

        if (aiProvider && aiApiKey.trim()) {
            saveAIConfig({ provider: aiProvider as AIProvider, apiKey: aiApiKey.trim() });
        } else {
            clearAIConfig();
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: selectedAccount,
                password,
            });
            if (error) throw error;
            navigate('/');
        } catch (err: any) {
            setError('帳號或密碼錯誤');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAI = () => {
        if (aiProvider && aiApiKey.trim()) {
            saveAIConfig({ provider: aiProvider as AIProvider, apiKey: aiApiKey.trim() });
            setAiSaved(true);
        }
    };

    const handleClearAI = () => {
        clearAIConfig();
        setAiProvider('');
        setAiApiKey('');
        setAiSaved(false);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <Package className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Storage Organizer
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        選擇帳號登入
                    </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleLogin}>
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">帳號</label>
                        <div className="relative">
                            <select
                                value={selectedAccount}
                                onChange={(e) => setSelectedAccount(e.target.value)}
                                className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:text-sm"
                            >
                                <option value="">請選擇帳號</option>
                                {ACCOUNTS.map((acc) => (
                                    <option key={acc.email} value={acc.email}>
                                        {acc.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">密碼</label>
                        <input
                            type="password"
                            required
                            className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:text-sm"
                            placeholder="請輸入密碼"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* AI Settings */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-amber-500" />
                                <span className="text-sm font-medium text-gray-700">AI 物件辨識（選填）</span>
                            </div>
                            {aiSaved && (
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">已儲存</span>
                            )}
                        </div>

                        <div className="relative">
                            <select
                                value={aiProvider}
                                onChange={(e) => {
                                    setAiProvider(e.target.value as AIProvider | '');
                                    setAiSaved(false);
                                }}
                                className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">選擇 AI 供應商</option>
                                {AI_PROVIDERS.map((p) => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>

                        {aiProvider && (
                            <>
                                <div className="relative">
                                    <input
                                        type={showApiKey ? 'text' : 'password'}
                                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                        placeholder="貼上 API Key"
                                        value={aiApiKey}
                                        onChange={(e) => { setAiApiKey(e.target.value); setAiSaved(false); }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                                    >
                                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Link
                                        to="/api-guide"
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        如何取得 API Key？
                                    </Link>
                                    <div className="flex gap-2">
                                        {aiApiKey && (
                                            <button
                                                type="button"
                                                onClick={handleClearAI}
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                清除
                                            </button>
                                        )}
                                        {aiApiKey && !aiSaved && (
                                            <button
                                                type="button"
                                                onClick={handleSaveAI}
                                                className="text-xs bg-amber-500 text-white px-2 py-1 rounded hover:bg-amber-600"
                                            >
                                                儲存
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !selectedAccount}
                        className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                    >
                        {loading ? '登入中...' : '登入'}
                    </button>
                </form>
            </div>
        </div>
    );
};
